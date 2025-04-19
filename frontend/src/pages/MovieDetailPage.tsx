import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MovieService, { Movie } from '../services/movie.service';
import AuthService from '../services/auth.service';
import ReviewService from '../services/review.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Screening {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    status: string;
    cinemaHall: {
        id: number;
        name: string;
        cinema: {
            id: number;
            name: string;
            address: string;
        };
    };
}

// Định nghĩa lại interface Review ở đây để tránh xung đột
interface Review {
    id: number;
    movieId: number;
    userId: number;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt?: string;
    user: {
        id: number;
        name: string;
        avatarUrl?: string;
    };
}

// Dummy review data - would be fetched from API in production
const dummyReviews: Review[] = [
    {
        id: 1,
        movieId: 1,
        userId: 1,
        content: "Bộ phim rất hay, diễn xuất của các diễn viên quá tuyệt vời!",
        rating: 5,
        createdAt: "2023-06-15T10:30:00",
        user: {
            id: 1,
            name: "Nguyễn Văn A",
            avatarUrl: "https://i.pravatar.cc/150?img=1"
        }
    },
    {
        id: 2,
        movieId: 1,
        userId: 2,
        content: "Cốt truyện hơi đơn giản nhưng hình ảnh và âm thanh rất ấn tượng.",
        rating: 4,
        createdAt: "2023-06-10T14:20:00",
        user: {
            id: 2,
            name: "Trần Thị B",
            avatarUrl: "https://i.pravatar.cc/150?img=5"
        }
    },
    {
        id: 3,
        movieId: 1,
        userId: 3,
        content: "Phim khá hay nhưng hơi dài, có thể cắt bớt một số cảnh không cần thiết.",
        rating: 3,
        createdAt: "2023-06-08T09:15:00",
        user: {
            id: 3,
            name: "Lê Văn C",
            avatarUrl: "https://i.pravatar.cc/150?img=8"
        }
    }
];

const MovieDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [screenings, setScreenings] = useState<Screening[]>([]);
    const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'showTimes' | 'details' | 'reviews'>('showTimes');
    const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
    const [userReview, setUserReview] = useState({ content: '', rating: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const isLoggedIn = AuthService.isLoggedIn();
    const currentUser = AuthService.getCurrentUser();
    const isMounted = useRef(true);
    const navigate = useNavigate();
    const trailerRef = useRef<HTMLDivElement>(null);

    // Debug effect to track loading state changes
    useEffect(() => {
        console.log(`Loading state changed to: ${isLoading}`);
    }, [isLoading]);

    const fetchMovieAndScreenings = async () => {
        if (!id) return;

        try {
            if (isMounted.current) {
                console.log('Setting loading state to true');
                setIsLoading(true);
                setError(null); // Clear previous error on retry
            }
            const movieId = parseInt(id);
            console.log(`Fetching movie with ID: ${movieId}`);

            // First fetch movie data
            const movieData = await MovieService.getMovieById(movieId);
            if (!movieData) {
                console.error(`Movie with ID ${movieId} was not found in the database`);
                if (isMounted.current) {
                    setError(`Không tìm thấy phim với ID ${movieId}. Phim này có thể đã bị xóa hoặc chưa được thêm vào hệ thống.`);
                    setIsLoading(false);
                }
                return;
            }

            console.log(`Successfully fetched movie: ${movieData.title}`);
            if (isMounted.current) setMovie(movieData);

            // Then fetch screenings in a try-catch block to avoid blocking if screenings fail
            try {
                const screeningsData = await MovieService.getScreeningsByMovie(movieId);
                console.log(`Fetched ${screeningsData.length} screenings for movie ID ${movieId}`);
                if (isMounted.current) {
                    setScreenings(screeningsData);
                    
                    // Set default selected date to today if screenings exist
                    if (screeningsData.length > 0) {
                        const today = new Date().toISOString().split('T')[0];
                        setSelectedDate(today);
                    }
                }
            } catch (screeningErr) {
                console.error('Error fetching screenings:', screeningErr);
                // Don't set error state, just log the error and continue with empty screenings
                if (isMounted.current) setScreenings([]);
            }

            // Fetch similar movies (movies in the same genre)
            // In a real app, you would call an API endpoint for similar movies
            try {
                const allMovies = await MovieService.getAllMovies();
                if (isMounted.current && movieData.genres) {
                    const movieGenres = movieData.genres;
                    const similar = allMovies
                        .filter(m => 
                            m.id !== movieData.id && 
                            ((m.genres && typeof m.genres === 'string' && m.genres.includes(movieGenres)) || 
                             (m.genre && typeof m.genre === 'string' && m.genre.includes(movieGenres)))
                        )
                        .slice(0, 4);
                    setSimilarMovies(similar);
                }
            } catch (similarErr) {
                console.error('Error fetching similar movies:', similarErr);
                // Don't block for similar movies
                if (isMounted.current) setSimilarMovies([]);
            }

            // Fetch reviews for this movie
            try {
                if (isMounted.current) {
                    const reviewsData = await ReviewService.getReviewsByMovie(movieId);
                    setReviews(reviewsData);
                }
            } catch (reviewsErr) {
                console.error('Error fetching reviews:', reviewsErr);
                if (isMounted.current) setReviews([]);
            }

            // Always set loading to false after all data fetches complete or error
            if (isMounted.current) {
                console.log('Setting loading state to false after successful data fetch');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error in MovieDetailPage:', err);
            if (isMounted.current) {
                console.log('Setting loading state to false after error');
                setError('Không thể tải thông tin phim. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        // Set mounted flag to true when component mounts
        isMounted.current = true;

        // Add a small delay to avoid fetching during navigation transitions
        const timer = setTimeout(() => {
            if (isMounted.current) {
                console.log('Starting data fetch after navigation stabilization');
                fetchMovieAndScreenings();
            }
        }, 50); // Small delay to ensure component is stable

        // Cleanup function to handle component unmounting during data fetching
        return () => {
            console.log('MovieDetailPage unmounting, cleaning up fetch operations');
            clearTimeout(timer);
            isMounted.current = false;
        };
    }, [id]);

    // Scroll to trailer when trailer is opened
    useEffect(() => {
        if (isTrailerPlaying && trailerRef.current) {
            trailerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isTrailerPlaying]);

    // Get unique available dates from screenings
    const availableDates = [...new Set(
        screenings.map(screening => 
            new Date(screening.startTime).toISOString().split('T')[0]
        )
    )].sort();

    // Filter screenings by selected date
    const filteredScreenings = selectedDate 
        ? screenings.filter(screening => 
            new Date(screening.startTime).toISOString().split('T')[0] === selectedDate
        )
        : screenings;

    // Group screenings by cinema
    const screeningsByCinema = filteredScreenings.reduce((acc, screening) => {
        const cinemaId = screening.cinemaHall.cinema.id;
        if (!acc[cinemaId]) {
            acc[cinemaId] = {
                cinema: screening.cinemaHall.cinema,
                screenings: []
            };
        }
        acc[cinemaId].screenings.push(screening);
        return acc;
    }, {} as Record<number, { cinema: { id: number; name: string; address: string }; screenings: Screening[] }>);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'E, dd MMM yyyy - HH:mm', { locale: vi });
    };

    const handleBookSeats = (screeningId: number) => {
        navigate(`/screenings/${screeningId}/seats`);
    };

    const handlePlayTrailer = () => {
        if (movie && movie.trailerUrl) {
            setIsTrailerPlaying(true);
        }
    };

    const handleCloseTrailer = () => {
        setIsTrailerPlaying(false);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!movie) return;
        
        const movieId = movie.id;
        const { content, rating } = userReview;
        
        if (content && rating > 0) {
            try {
                if (editingReview) {
                    // Updating existing review
                    const updatedReview = await ReviewService.updateReview(
                        editingReview.id,
                        content,
                        rating
                    );
                    
                    if (updatedReview) {
                        const updatedReviews = reviews.map(r => 
                            r.id === updatedReview.id ? updatedReview : r
                        );
                        setReviews(updatedReviews);
                        setEditingReview(null);
                    }
                } else {
                    // Creating new review
                    const newReview = await ReviewService.createReview(
                        movieId,
                        content,
                        rating
                    );
                    
                    if (newReview) {
                        setReviews([newReview, ...reviews]);
                    }
                }
                
                // Reset form
                setUserReview({ content: '', rating: 0 });
            } catch (error) {
                console.error('Error saving review:', error);
            }
        }
    };

    // Cancel editing review
    const handleCancelEdit = () => {
        setEditingReview(null);
        setUserReview({ content: '', rating: 0 });
    };
    
    // Edit review
    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setUserReview({
            content: review.content,
            rating: review.rating
        });
        
        // Scroll to review form
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Delete review
    const handleDeleteReview = async (reviewId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            const isDeleted = await ReviewService.deleteReview(reviewId);
            if (isDeleted) {
                const updatedReviews = reviews.filter(r => r.id !== reviewId);
                setReviews(updatedReviews);
            }
        }
    };

    // Kiểm tra xem người dùng hiện tại đã có đánh giá chưa
    useEffect(() => {
        const checkUserReview = async () => {
            if (movie && isLoggedIn) {
                const userReviewData = await ReviewService.getUserReviewForMovie(movie.id);
                if (userReviewData) {
                    setEditingReview(userReviewData);
                    setUserReview({
                        content: userReviewData.content,
                        rating: userReviewData.rating
                    });
                }
            }
        };
        
        checkUserReview();
    }, [movie, isLoggedIn]);

    // Render star rating component
    const StarRating = ({ rating, max = 5, size = 'small' }: { rating: number, max?: number, size?: 'small' | 'medium' | 'large' }) => {
        const sizeClass = {
            small: 'w-4 h-4',
            medium: 'w-5 h-5',
            large: 'w-6 h-6'
        };
        
        return (
            <div className="flex">
                {[...Array(max)].map((_, i) => (
                    <svg 
                        key={i}
                        className={`${sizeClass[size]} ${i < rating ? 'text-yellow-400' : 'text-gray-400'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    // Format user display name
    const formatUserName = (user: any): string => {
        if (!user) return 'Ẩn danh';
        
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
            return user.firstName;
        } else if (user.lastName) {
            return user.lastName;
        } else if (user.email) {
            return user.email.split('@')[0];
        }
        
        return user.name || 'Người dùng';
    };
    
    // Lấy avatar từ nhiều thuộc tính có thể có
    const getUserAvatar = (user: any): string => {
        if (!user) return 'https://via.placeholder.com/150';
        
        return user.avatarUrl || 
               user.profileImage || 
               user.photoURL || 
               user.imageUrl || 
               'https://via.placeholder.com/150';
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
                <div className="w-20 h-20 relative">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-600 border-t-primary animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                        </svg>
                    </div>
                </div>
                <p className="text-gray-300 mt-4 text-lg font-medium animate-pulse">Đang tải thông tin phim...</p>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center py-10 max-w-md px-4 bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700/50">
                    <svg className="w-20 h-20 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 mb-6 text-lg">{error || 'Không tìm thấy thông tin phim'}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={fetchMovieAndScreenings}
                            className="bg-gradient-to-r from-primary to-red-600 text-white px-6 py-3 rounded-lg hover:from-primary hover:to-red-700 transition-all duration-300 shadow-lg flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Thử lại
                        </button>
                        <Link
                            to="/movies"
                            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                            Quay lại danh sách phim
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
            {/* Hero Section with Backdrop */}
            <div 
                className="relative h-[50vh] md:h-[70vh] bg-cover bg-center"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(17,24,39,1)), url(${movie.backdropUrl || movie.posterUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top'
                }}
            >
                <div className="absolute inset-0 flex items-end">
                    <div className="container mx-auto px-4 py-12">
                        <div className="flex flex-col items-start">
                            <Link to="/movies" className="mb-6 text-white/80 hover:text-white flex items-center bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm transition-all">
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                                Quay lại
                    </Link>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">{movie.title}</h1>
                            
                            <div className="flex flex-wrap gap-3 mb-4">
                                {movie.rating > 0 && (
                                    <span className="flex items-center bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {movie.rating}/10
                                    </span>
                                )}
                                <span className="bg-gray-800/50 backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full text-sm">
                                {movie.durationMinutes} phút
                            </span>
                                <span className="bg-gray-800/50 backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full text-sm">
                                {movie.genres || movie.genre || 'Chưa xác định'}
                            </span>
                            {movie.language && (
                                    <span className="bg-gray-800/50 backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full text-sm">
                                    {movie.language}
                                </span>
                            )}
                                <span className="bg-gray-800/50 backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full text-sm">
                                    {format(new Date(movie.releaseDate), 'dd/MM/yyyy')}
                            </span>
                        </div>

                            <div className="flex flex-wrap gap-4 mt-4">
                                {movie.trailerUrl && (
                                    <button 
                                        onClick={handlePlayTrailer}
                                        className="bg-primary hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        Xem Trailer
                                    </button>
                                )}
                                
                                {screenings.length > 0 && (
                                    <button 
                                        onClick={() => document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 011-1h12a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                                        </svg>
                                        Đặt Vé Ngay
                                    </button>
                                )}
                            </div>
                        </div>
                                </div>
                                </div>
                        </div>

            {/* Trailer Modal */}
            {isTrailerPlaying && movie && movie.trailerUrl && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" ref={trailerRef}>
                    <div className="relative w-full max-w-4xl">
                        <button 
                            onClick={handleCloseTrailer}
                            className="absolute -top-12 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                className="w-full h-full rounded-lg shadow-2xl"
                                    src={movie.trailerUrl}
                                    title="Trailer"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    {/* Movie Poster */}
                    <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0">
                        <div className="sticky top-8">
                            <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                                <img
                                    src={movie.posterUrl || '/placeholder-poster.jpg'}
                                    alt={movie.title}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Movie Details */}
                    <div className="lg:w-2/3 xl:w-3/4">
                        {/* Tabs */}
                        <div className="mb-8 border-b border-gray-700">
                            <div className="flex overflow-x-auto">
                                <button 
                                    onClick={() => setActiveTab('showTimes')} 
                                    className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'showTimes' 
                                        ? 'text-primary border-b-2 border-primary' 
                                        : 'text-gray-400 hover:text-white'}`}
                                >
                                    Lịch Chiếu
                                </button>
                                <button 
                                    onClick={() => setActiveTab('details')} 
                                    className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'details' 
                                        ? 'text-primary border-b-2 border-primary' 
                                        : 'text-gray-400 hover:text-white'}`}
                                >
                                    Chi Tiết Phim
                                </button>
                                <button 
                                    onClick={() => setActiveTab('reviews')} 
                                    className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'reviews' 
                                        ? 'text-primary border-b-2 border-primary' 
                                        : 'text-gray-400 hover:text-white'}`}
                                >
                                    Đánh Giá ({reviews.length})
                                </button>
                    </div>
                </div>

                        {/* Tab Content */}
                        <div>
                            {/* Show Times Tab */}
                            {activeTab === 'showTimes' && (
                                <div id="showtimes" className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-white mb-6">Lịch chiếu phim</h2>

                                    {availableDates.length > 0 ? (
                                        <>
                                            {/* Date Selector */}
                                            <div className="mb-8 overflow-x-auto">
                                                <div className="inline-flex gap-2 p-1 bg-gray-800/50 backdrop-blur-sm rounded-lg">
                                                    {availableDates.map(date => {
                                                        const d = new Date(date);
                                                        const isToday = new Date().toISOString().split('T')[0] === date;
                                                        const isSelected = selectedDate === date;
                                                        
                                                        return (
                                                            <button
                                                                key={date}
                                                                onClick={() => setSelectedDate(date)}
                                                                className={`py-2 px-4 rounded-lg transition-all min-w-[100px] ${
                                                                    isSelected
                                                                        ? 'bg-primary text-white'
                                                                        : 'hover:bg-gray-700/70 text-gray-300'
                                                                }`}
                                                            >
                                                                <div className="font-medium">
                                                                    {format(d, 'EEE', { locale: vi })}
                                                                </div>
                                                                <div className="text-sm">
                                                                    {format(d, 'dd/MM', { locale: vi })}
                                                                    {isToday && ' (Hôm nay)'}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            
                                            {/* Screenings */}
                                            <div className="space-y-8">
                    {Object.values(screeningsByCinema).length === 0 ? (
                                                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700/50">
                                                        <svg className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-gray-400 text-lg">Không có suất chiếu nào cho ngày này.</p>
                                                        <button 
                                                            onClick={() => setSelectedDate('')}
                                                            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            Xem tất cả ngày
                                                        </button>
                        </div>
                    ) : (
                                                    Object.values(screeningsByCinema).map(({ cinema, screenings }) => (
                                                        <div key={cinema.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700/50 shadow-lg">
                                                            <div className="flex items-center mb-6">
                                                                <svg className="h-6 w-6 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                <h3 className="text-xl font-bold text-white">
                                                                    {cinema.name}
                                    </h3>
                                                            </div>
                                                            <p className="text-gray-400 mb-6 pl-9">
                                                                {cinema.address}
                                                            </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {screenings.map((screening) => (
                                                                    <div key={screening.id} className="bg-gray-900/80 rounded-lg p-4 hover:bg-gray-900 transition-colors border border-gray-800 shadow-md">
                                                                        <div className="mb-2 flex justify-between items-start">
                                                                            <span className="text-primary font-semibold">
                                                                                {format(new Date(screening.startTime), 'HH:mm', { locale: vi })}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                đến {format(new Date(screening.endTime), 'HH:mm', { locale: vi })}
                                                    </span>
                                                </div>
                                                <div className="mb-2">
                                                                            <span className="text-sm text-gray-400 block mb-1">Phòng:</span>
                                                                            <span className="text-white inline-block bg-gray-800 px-3 py-1 rounded-lg text-sm">
                                                                                {screening.cinemaHall.name}
                                                                            </span>
                                                </div>
                                                <div className="mb-3">
                                                                            <span className="text-sm text-gray-400 block mb-1">Giá:</span>
                                                    <span className="text-white font-medium">{screening.price.toLocaleString()}đ</span>
                                                </div>
                                                <button
                                                    onClick={() => handleBookSeats(screening.id)}
                                                                            className="w-full bg-gradient-to-r from-primary to-red-600 text-white py-3 rounded-lg hover:from-primary hover:to-red-700 transition-all flex items-center justify-center gap-2 font-medium shadow-md"
                                                >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 011-1h12a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                                                                            </svg>
                                                    Đặt vé
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700/50">
                                            <svg className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-400 text-lg">Hiện chưa có lịch chiếu cho phim này.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="animate-fadeIn">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-4">Nội dung phim</h2>
                                        <p className="text-gray-300 leading-relaxed text-lg">
                                            {movie.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {movie.director && (
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                                                    <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                    Đạo diễn
                                                </h2>
                                                <p className="text-gray-300 text-lg">{movie.director}</p>
                                            </div>
                                        )}
                                        {movie.actors && (
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                                                    <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    Diễn viên
                                                </h2>
                                                <p className="text-gray-300 text-lg">{movie.actors}</p>
                                            </div>
                                        )}
                                    </div>

                                    {movie.country && (
                                        <div className="mt-8">
                                            <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                                                <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Quốc gia
                                            </h2>
                                            <p className="text-gray-300 text-lg">{movie.country}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ người xem</h2>

                                    {/* Add Review Form */}
                                    {isLoggedIn ? (
                                        <div id="review-form" className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                            <h3 className="text-lg font-semibold text-white mb-4">
                                                {editingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Thêm đánh giá của bạn'}
                                            </h3>
                                            
                                            {currentUser && (
                                                <div className="flex items-center mb-4 text-gray-300 text-sm">
                                                    <div className="flex-shrink-0 mr-3">
                                                        <img 
                                                            src={getUserAvatar(currentUser)}
                                                            alt={formatUserName(currentUser)}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="mr-2">Bạn đang đánh giá với tên:</span>
                                                        <span className="font-medium text-white">{formatUserName(currentUser)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <form onSubmit={handleSubmitReview}>
                                                <div className="mb-4">
                                                    <label className="block text-gray-300 mb-2">Đánh giá sao</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                type="button"
                                                                key={star}
                                                                onClick={() => setUserReview({...userReview, rating: star})}
                                                                className="focus:outline-none"
                                                            >
                                                                <svg 
                                                                    className={`w-8 h-8 ${userReview.rating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                                                                    fill="currentColor" 
                                                                    viewBox="0 0 20 20" 
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-gray-300 mb-2">Nhận xét của bạn</label>
                                                    <textarea
                                                        value={userReview.content}
                                                        onChange={(e) => setUserReview({...userReview, content: e.target.value})}
                                                        className="w-full bg-gray-900 text-white rounded-lg border border-gray-700 p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        rows={4}
                                                        placeholder="Chia sẻ ý kiến của bạn về bộ phim này..."
                                                    ></textarea>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="submit"
                                                        disabled={!userReview.content || userReview.rating === 0}
                                                        className={`px-6 py-3 rounded-lg font-medium ${
                                                            !userReview.content || userReview.rating === 0
                                                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                                : 'bg-primary text-white hover:bg-red-700'
                                                        }`}
                                                    >
                                                        {editingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                                                    </button>
                                                    
                                                    {editingReview && (
                                                        <button
                                                            type="button"
                                                            onClick={handleCancelEdit}
                                                            className="px-6 py-3 rounded-lg font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                                                        >
                                                            Hủy
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
                                            <p className="text-gray-300 mb-4">Vui lòng đăng nhập để thêm đánh giá của bạn</p>
                                            <Link to="/login" className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                                Đăng nhập
                                            </Link>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-10">
                                                <svg className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                                <p className="text-gray-400">Chưa có đánh giá nào cho phim này.</p>
                                            </div>
                                        ) : (
                                            reviews.map(review => (
                                                <div key={review.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 mr-4">
                                                            <img 
                                                                src={getUserAvatar(review.user)}
                                                                alt={review.user.name}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-semibold text-white">
                                                                    {currentUser && review.userId === currentUser.id 
                                                                        ? formatUserName(currentUser) + ' '
                                                                        : review.user.name}
                                                                    {currentUser && review.userId === currentUser.id && (
                                                                        <span className="text-xs text-gray-400">(Bạn)</span>
                                                                    )}
                                                                </h4>
                                                                <span className="text-gray-400 text-sm">
                                                                    {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                                                                    {review.updatedAt && ' (đã chỉnh sửa)'}
                                                                </span>
                                                            </div>
                                                            <div className="mb-2">
                                                                <StarRating rating={review.rating} />
                                                            </div>
                                                            <p className="text-gray-300">{review.content}</p>
                                                            
                                                            {/* Review actions for owner */}
                                                            {currentUser && review.userId === currentUser.id && (
                                                                <div className="mt-3 flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleEditReview(review)}
                                                                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Chỉnh sửa
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteReview(review.id)}
                                                                        className="text-sm text-red-400 hover:text-red-300 flex items-center"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar Movies Section */}
                {similarMovies.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Phim tương tự</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarMovies.map(movie => (
                                <Link to={`/movies/${movie.id}`} key={movie.id} className="group">
                                    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                                        <div className="aspect-w-2 aspect-h-3 relative">
                                            <img 
                                                src={movie.posterUrl || "/placeholder-poster.jpg"} 
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                                                <div className="p-4">
                                                    <div className="flex items-center mb-2">
                                                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-white text-sm">{movie.rating}/10</span>
                                                    </div>
                                                    <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium">
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-white text-lg truncate mb-1">{movie.title}</h3>
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>{movie.durationMinutes} phút</span>
                                                <span>{format(new Date(movie.releaseDate), 'yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default MovieDetailPage;
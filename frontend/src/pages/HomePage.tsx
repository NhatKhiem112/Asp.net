import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import MovieService, { Movie } from '../services/movie.service';
import MovieCard from '../components/MovieCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomePage: React.FC = () => {
    const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
    const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const heroSwiperRef = useRef<any>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setIsLoading(true);
                
                // Fetch different movie categories in parallel
                const [nowShowing, comingSoon, popular] = await Promise.all([
                    MovieService.getNowShowingMovies(),
                    MovieService.getComingSoonMovies(),
                    MovieService.getPopularMovies(),
                ]);
                
                setNowShowingMovies(nowShowing.slice(0, 10));
                setComingSoonMovies(comingSoon.slice(0, 10));
                setPopularMovies(popular.slice(0, 10));
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load movies:', err);
                setError('Failed to load movies. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // Function to create hero slide content from a movie
    const createHeroSlide = (movie: Movie) => (
        <div 
            className="relative h-[600px] bg-cover bg-center" 
            style={{ 
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(${movie.backdropUrl || movie.posterUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="absolute inset-0 flex items-end">
                <div className="max-w-7xl mx-auto w-full px-4 py-16">
                    <div className="flex flex-col md:flex-row items-end md:items-end gap-6">
                        <div className="hidden md:block w-52 h-72 rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{movie.title}</h1>
                            <div className="flex items-center space-x-4 text-sm mb-4">
                                <span className="text-yellow-400 font-medium">⭐ {movie.rating}/10</span>
                                <span className="text-gray-300">
                                    {movie.durationMinutes} min
                                </span>
                                <span className="text-gray-300">
                                    {new Date(movie.releaseDate).getFullYear()}
                                </span>
                                <span className="text-gray-300">
                                    {movie.genres || movie.genre}
                                </span>
                            </div>
                            <p className="text-gray-300 mb-8 line-clamp-3 md:max-w-xl">{movie.description}</p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to={`/movies/${movie.id}`}
                                    className="bg-primary hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-md 
                                    transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Watch Trailer
                                </Link>
                                <Link 
                                    to={`/booking/${movie.id}`}
                                    className="bg-transparent border-2 border-white hover:bg-white hover:text-dark text-white 
                                    font-semibold px-8 py-3 rounded-md transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 011-1h12a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                                    </svg>
                                    Book Tickets
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    
    return (
        <div>
            {/* Hero Section - Movie Slider */}
            {isLoading ? (
                <div className="h-[600px] bg-gradient-to-r from-dark to-secondary flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="h-[600px] bg-gradient-to-r from-dark to-secondary flex items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <Swiper
                        ref={heroSwiperRef}
                        modules={[Navigation, Pagination, Autoplay]}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={true}
                        className="hero-swiper"
                    >
                        {popularMovies.slice(0, 5).map(movie => (
                            <SwiperSlide key={movie.id}>
                                {createHeroSlide(movie)}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    
                    {/* Custom navigation arrows */}
                    <div className="absolute left-4 top-1/2 z-10 transform -translate-y-1/2">
                        <button 
                            onClick={() => heroSwiperRef.current?.swiper.slidePrev()}
                            className="bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                    <div className="absolute right-4 top-1/2 z-10 transform -translate-y-1/2">
                        <button 
                            onClick={() => heroSwiperRef.current?.swiper.slideNext()}
                            className="bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Now Playing Movies */}
            <div className="py-16 px-4 bg-dark">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                            <span className="mr-2 text-primary">▶</span> Now Playing
                        </h2>
                        <Link to="/movies?filter=now-showing" className="text-primary hover:text-red-400 font-medium flex items-center">
                            View All 
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : (
                        <Swiper
                            modules={[Navigation]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                                1280: { slidesPerView: 5 },
                            }}
                            className="movie-swiper"
                        >
                            {nowShowingMovies.map((movie) => (
                                <SwiperSlide key={movie.id}>
                                    <MovieCard movie={movie} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>

            {/* Coming Soon Movies */}
            <div className="py-16 px-4 bg-gradient-to-b from-dark to-secondary">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                            <span className="mr-2 text-primary">🔜</span> Coming Soon
                        </h2>
                        <Link to="/movies?filter=coming-soon" className="text-primary hover:text-red-400 font-medium flex items-center">
                            View All 
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : (
                        <Swiper
                            modules={[Navigation]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                                1280: { slidesPerView: 5 },
                            }}
                            className="movie-swiper"
                        >
                            {comingSoonMovies.map((movie) => (
                                <SwiperSlide key={movie.id}>
                                    <MovieCard movie={movie} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>

            {/* Promotions */}
            <div className="py-16 px-4 bg-dark">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
                        Special Offers & Promotions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-secondary rounded-xl overflow-hidden transform transition-transform hover:scale-105 shadow-lg">
                            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white text-5xl font-bold">2 for 1</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-2">Couple's Tuesday</h3>
                                <p className="text-gray-300 mb-4">
                                    Buy one ticket and get one free every Tuesday. Perfect for date night!
                                </p>
                                <button className="text-primary font-medium hover:text-red-400 transition">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        <div className="bg-secondary rounded-xl overflow-hidden transform transition-transform hover:scale-105 shadow-lg">
                            <div className="h-48 bg-gradient-to-r from-yellow-500 to-red-500 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white text-4xl font-bold">Family Pack</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-2">Weekend Family Deal</h3>
                                <p className="text-gray-300 mb-4">
                                    Special pricing for families of 4 or more with free popcorn and drinks.
                                </p>
                                <button className="text-primary font-medium hover:text-red-400 transition">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        <div className="bg-secondary rounded-xl overflow-hidden transform transition-transform hover:scale-105 shadow-lg">
                            <div className="h-48 bg-gradient-to-r from-green-500 to-teal-500 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white text-4xl font-bold">Student Discount</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-2">Student Special</h3>
                                <p className="text-gray-300 mb-4">
                                    25% off on all movies with a valid student ID. Available any day of the week.
                                </p>
                                <button className="text-primary font-medium hover:text-red-400 transition">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-16 px-4 bg-gradient-to-b from-secondary to-dark">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
                        How It Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Choose a Movie</h3>
                            <p className="text-gray-300">
                                Browse our selection of the latest movies and choose what you want to watch.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Select a Cinema</h3>
                            <p className="text-gray-300">
                                Find a cinema near you with available screenings of your chosen movie.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="
                            bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Book Tickets</h3>
                            <p className="text-gray-300">
                                Select your seats, complete payment, and receive your e-tickets instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile App Promo */}
            <div className="py-16 px-4 bg-dark relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-10 md:mb-0">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Get Our Mobile App
                            </h2>
                            <p className="text-gray-300 mb-8 text-lg">
                                Book tickets, earn rewards, and stay updated with the latest movie releases right from your phone.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-900 transition">
                                    <svg className="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.6 5.6C17.1 6.1 15.9 7 15.9 8.3c0 1.5 1.2 2.4 1.6 2.8-1.7 2.6-3.5 2.6-3.5 2.6-1.5 0-2.8-0.9-3.9-0.9-1.1 0-2.3 0.9-3.8 0.9-2.5 0-5.2-3.8-5.2-7.3C1 2.9 3.4 1 5.4 1c1.5 0 3 0.9 3.9 0.9 0.8 0 2.3-1 3.9-1 1.2 0 2.4 0.4 3.3 1.1-2.9 1.5-2.3 5.4 1.1 3.6z" />
                                        <path d="M12.5 16.5c-0.3 0.7-0.8 1.3-1.3 1.8-0.6 0.6-1.3 1.3-2.2 1.3-1 0-1.3-0.6-2.4-0.6-1.1 0-1.6 0.6-2.4 0.6-0.9 0-1.6-0.6-2.2-1.3-1.5-1.6-2.6-4.5-2.6-7.1 0-4.6 3-7 5.9-7 1.5 0 2.7 1 3.6 1 0.9 0 2.2-1 3.8-1 1.2 0 2.4 0.3 3.3 1-2.9 1.5-2.5 5.5 1.1 3.5-0.7 2-2 3.5-3.5 5.1-1.5 1.5-2.9 2.5-3.5 2.5-0.8 0-1.3-0.7-2.4-0.7z" />
                                    </svg>
                                    <div className="text-left">
                                        <p className="text-xs">Download on the</p>
                                        <p className="text-xl font-semibold">App Store</p>
                                    </div>
                                </button>
                                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-900 transition">
                                    <svg className="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 20.5v-17c0-0.8 0.6-1.5 1.4-1.5h15.2c0.8 0 1.4 0.7 1.4 1.5v17c0 0.8-0.6 1.5-1.4 1.5H4.4c-0.8 0-1.4-0.7-1.4-1.5zM12 2l-9 9 9 9 9-9-9-9z" />
                                    </svg>
                                    <div className="text-left">
                                        <p className="text-xs">GET IT ON</p>
                                        <p className="text-xl font-semibold">Google Play</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="py-12 px-4 bg-secondary">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Stay Updated
                    </h2>
                    <p className="text-gray-300 mb-8">
                        Subscribe to our newsletter for the latest movie releases, exclusive offers, and cinema news.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 mx-auto max-w-lg">
                        <input 
                            type="email" 
                            placeholder="Your email address" 
                            className="flex-1 px-4 py-3 rounded-lg bg-dark border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button 
                            type="submit" 
                            className="bg-primary hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HomePage; 
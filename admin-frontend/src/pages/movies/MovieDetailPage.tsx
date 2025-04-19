import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import MoviesService from '../../services/movies.service';
import { formatDate, formatDuration } from '../../utils/formatters';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Utility function to determine movie status
const getMovieStatus = (releaseDate: string) => {
    const today = new Date();
    const movieReleaseDate = new Date(releaseDate);
    return movieReleaseDate <= today ? 'Active' : 'Upcoming';
};

const MovieDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setLoading(true);
                const data = await MoviesService.getMovie(parseInt(id as string));
                setMovie(data);
                console.log("Loaded movie:", data);
            } catch (err: any) {
                console.error('Error fetching movie:', err);
                setError(err.message || 'Không thể tải thông tin phim');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMovie();
        }
    }, [id]);

    const handleDeleteMovie = async () => {
        if (!movie) return;

        if (!window.confirm(`Bạn có chắc chắn muốn xóa phim "${movie.title}"?`)) {
            return;
        }

        try {
            await MoviesService.deleteMovie(movie.id);
            alert('Xóa phim thành công!');
            navigate('/admin/movies');
        } catch (err: any) {
            console.error('Error deleting movie:', err);
            alert(`Lỗi khi xóa phim: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Chi tiết phim">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !movie) {
        return (
            <AdminLayout title="Chi tiết phim">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                    <p>{error || 'Không tìm thấy phim'}</p>
                    <button
                        onClick={() => navigate('/admin/movies')}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </AdminLayout>
        );
    }

    // Determine movie status based on release date
    const movieStatus = getMovieStatus(movie.releaseDate);

    return (
        <AdminLayout title={`Chi tiết phim: ${movie.title}`}>
            <div className="bg-white p-6 rounded-lg shadow">
                {/* Header with actions */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/admin/movies')}
                            className="mr-4 text-gray-500 hover:text-red-600"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">{movie.title}</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to={`/admin/movies/edit/${movie.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700 transition-colors"
                        >
                            <PencilIcon className="w-5 h-5 mr-1" />
                            Chỉnh sửa
                        </Link>
                        <button
                            onClick={handleDeleteMovie}
                            className="px-4 py-2 bg-red-600 text-white rounded flex items-center hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5 mr-1" />
                            Xóa
                        </button>
                    </div>
                </div>

                {/* Movie details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left column - Poster */}
                    <div>
                        {movie.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-auto rounded-lg shadow-md"
                            />
                        ) : (
                            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Middle column - Details */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700">Thông tin cơ bản</h3>
                            <div className="mt-2 space-y-2">
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Thể loại:</span>
                                    <span className="font-medium">{movie.genre}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Thời lượng:</span>
                                    <span className="font-medium">{movie.durationMinutes} phút</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Ngôn ngữ:</span>
                                    <span className="font-medium">{movie.language || 'N/A'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Đạo diễn:</span>
                                    <span className="font-medium">{movie.director || 'N/A'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Diễn viên:</span>
                                    <span className="font-medium">{movie.actors || 'N/A'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Ngày phát hành:</span>
                                    <span className="font-medium">{formatDate(movie.releaseDate)}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Đánh giá:</span>
                                    <span className="font-medium">{movie.rating ? `${movie.rating}/10` : 'Chưa đánh giá'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Trạng thái:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${movieStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {movieStatus === 'Active' ? 'Đang chiếu' : 'Sắp chiếu'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700">Thông tin quản trị</h3>
                            <div className="mt-2 space-y-2">
                                <div className="flex">
                                    <span className="w-32 text-gray-500">ID:</span>
                                    <span className="font-medium">{movie.id}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Ngày tạo:</span>
                                    <span className="font-medium">{formatDate(movie.createdAt, 'dd/MM/yyyy HH:mm')}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500">Cập nhật:</span>
                                    <span className="font-medium">{movie.updatedAt ? formatDate(movie.updatedAt, 'dd/MM/yyyy HH:mm') : 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Description and Trailer */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Mô tả</h3>
                            <p className="text-gray-600 whitespace-pre-line">{movie.description}</p>
                        </div>

                        {movie.trailerUrl && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Trailer</h3>
                                <div className="aspect-w-16 aspect-h-9">
                                    <iframe
                                        src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                                        title={`${movie.title} trailer`}
                                        className="w-full h-56 rounded"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {movie.backdropUrl && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ảnh backdrop</h3>
                                <img
                                    src={movie.backdropUrl}
                                    alt={`${movie.title} backdrop`}
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        )}

                        {movie.screenings && movie.screenings.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Lịch chiếu ({movie.screenings.length})</h3>
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rạp</th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {movie.screenings.map((screening: any) => (
                                                <tr key={screening.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{screening.cinemaHall?.cinema?.name}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{screening.cinemaHall?.name}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{formatDate(screening.startTime, 'dd/MM/yyyy HH:mm')}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{screening.price.toLocaleString('vi-VN')}₫</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default MovieDetailPage; 
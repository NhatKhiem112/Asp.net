import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import MoviesService, { Movie, MovieStatistics } from '../../services/movies.service';
import AdminLayout from '../../layouts/AdminLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    FilmIcon,
    CalendarIcon,
    TicketIcon,
    TagIcon
} from '@heroicons/react/24/outline';

// Add a utility function to determine movie status
const getMovieStatus = (releaseDate: string) => {
    const today = new Date();
    const movieReleaseDate = new Date(releaseDate);
    return movieReleaseDate <= today ? 'Active' : 'Upcoming';
};

const MoviesPage: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    // Add statistics state
    const [statistics, setStatistics] = useState<MovieStatistics | null>(null);
    const [loadingStats, setLoadingStats] = useState<boolean>(true);
    const [showStats, setShowStats] = useState<boolean>(true);

    // Load statistics on component mount
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoadingStats(true);
                const data = await MoviesService.getStatistics();
                setStatistics(data);
            } catch (err: any) {
                console.error('Error fetching movie statistics:', err);
                // Don't show error for stats, just log it
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStatistics();
    }, []);

    // Load movies on component mount or when search/page changes
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const result = await MoviesService.getMovies(searchTerm, page, pageSize);
                setMovies(result.movies);
                setTotalPages(result.totalPages);
            } catch (err: any) {
                console.error('Error fetching movies:', err);
                setError(err.message || 'Không thể tải danh sách phim');
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [searchTerm, page, pageSize]);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page when searching
    };

    // Handle movie deletion
    const handleDeleteMovie = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
            return;
        }

        try {
            await MoviesService.deleteMovie(id);
            setMovies(movies.filter(movie => movie.id !== id));
            alert('Xóa phim thành công!');
        } catch (err: any) {
            console.error('Error deleting movie:', err);
            alert(`Lỗi khi xóa phim: ${err.message}`);
        }
    };

    // Render pagination controls
    const renderPaginationControls = () => {
        return (
            <div className="flex justify-between items-center mt-4">
                <div>
                    <span className="text-sm text-gray-700">
                        Trang {page} / {totalPages}
                    </span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                        Trước
                    </button>
                    <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                        Sau
                    </button>
                </div>
            </div>
        );
    };

    // Render statistics section
    const renderStatistics = () => {
        if (!statistics) return null;

        return (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <ChartBarIcon className="w-6 h-6 mr-2 text-red-600" />
                        Thống kê phim
                    </h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowStats(!showStats)}
                    >
                        {showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}
                    </button>
                </div>

                {showStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Movies */}
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-red-100 mr-4">
                                    <FilmIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tổng số phim</p>
                                    <p className="text-2xl font-bold text-gray-800">{statistics.totalMovies}</p>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Movies */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 mr-4">
                                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phim sắp chiếu</p>
                                    <p className="text-2xl font-bold text-gray-800">{statistics.upcomingMovies}</p>
                                </div>
                            </div>
                        </div>

                        {/* Most Screened Movie */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-start">
                                <div className="p-3 rounded-full bg-green-100 mr-4">
                                    <FilmIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phim có nhiều suất chiếu nhất</p>
                                    {statistics.mostScreenedMovie ? (
                                        <>
                                            <p className="text-base font-bold text-gray-800">{statistics.mostScreenedMovie.title}</p>
                                            <p className="text-sm text-gray-600">{statistics.mostScreenedMovie.screeningCount} suất chiếu</p>
                                        </>
                                    ) : (
                                        <p className="text-base italic text-gray-500">Không có dữ liệu</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Most Booked Movie */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-start">
                                <div className="p-3 rounded-full bg-purple-100 mr-4">
                                    <TicketIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phim được đặt vé nhiều nhất</p>
                                    {statistics.mostBookedMovie ? (
                                        <>
                                            <p className="text-base font-bold text-gray-800">{statistics.mostBookedMovie.title}</p>
                                            <p className="text-sm text-gray-600">{statistics.mostBookedMovie.bookingCount} vé đã đặt</p>
                                        </>
                                    ) : (
                                        <p className="text-base italic text-gray-500">Không có dữ liệu</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Genre Stats */}
                {showStats && statistics.genreStats && statistics.genreStats.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                            <TagIcon className="w-5 h-5 mr-2 text-red-600" />
                            Thống kê theo thể loại
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {statistics.genreStats.map((genreStat, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium">{genreStat.genre}</p>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                            {genreStat.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AdminLayout title="Quản lý phim">
            {/* Statistics Section */}
            {!loadingStats && renderStatistics()}

            <div className="bg-white p-6 rounded-lg shadow">
                {/* Header with title and add button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý phim</h1>
                    <Link
                        to="/admin/movies/add"
                        className="bg-red-600 text-white px-4 py-2 rounded flex items-center hover:bg-red-700 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Thêm phim mới
                    </Link>
                </div>

                {/* Search form */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="admin-input pl-10"
                                placeholder="Tìm kiếm theo tên phim, đạo diễn, diễn viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </form>

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                {/* Movies table */}
                {!loading && !error && (
                    <>
                        {movies.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Không tìm thấy phim nào phù hợp.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="admin-table">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="admin-table-header">ID</th>
                                            <th className="admin-table-header">Ảnh</th>
                                            <th className="admin-table-header">Tên phim</th>
                                            <th className="admin-table-header">Thể loại</th>
                                            <th className="admin-table-header">Thời lượng</th>
                                            <th className="admin-table-header">Ngày phát hành</th>
                                            <th className="admin-table-header">Trạng thái</th>
                                            <th className="admin-table-header">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {movies.map((movie) => (
                                            <tr key={movie.id} className="hover:bg-gray-50">
                                                <td className="admin-table-cell">{movie.id}</td>
                                                <td className="admin-table-cell">
                                                    {movie.posterUrl ? (
                                                        <img
                                                            src={movie.posterUrl}
                                                            alt={movie.title}
                                                            className="w-16 h-24 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-24 bg-gray-200 flex items-center justify-center rounded">
                                                            <span className="text-gray-500 text-xs">No Image</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="admin-table-cell font-medium text-gray-900">{movie.title}</td>
                                                <td className="admin-table-cell">{movie.genre}</td>
                                                <td className="admin-table-cell">{movie.durationMinutes} phút</td>
                                                <td className="admin-table-cell">{formatDate(movie.releaseDate)}</td>
                                                <td className="admin-table-cell">
                                                    {/* Determine status based on release date */}
                                                    {(() => {
                                                        const status = getMovieStatus(movie.releaseDate);
                                                        return (
                                                            <span className={`px-2 py-1 rounded-full text-xs ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {status === 'Active' ? 'Đang chiếu' : 'Sắp chiếu'}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="admin-table-cell">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            to={`/admin/movies/edit/${movie.id}`}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteMovie(movie.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Xóa"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {renderPaginationControls()}
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default MoviesPage; 
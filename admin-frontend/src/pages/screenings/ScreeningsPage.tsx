import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Film, Home, Eye, Edit, Trash2, Search, Plus, AlertCircle, Filter, Clock, DollarSign, BarChart2 } from 'react-feather';
import ScreeningsService, { ScreeningResponse, ScreeningFilters } from '../../services/screenings.service';
import MoviesService from '../../services/movies.service';
import CinemasService from '../../services/cinemas.service';
import CinemaHallsService from '../../services/cinemaHalls.service';
import AdminLayout from '../../layouts/AdminLayout';

// Extend the ScreeningFilters interface to include sort properties
interface ExtendedScreeningFilters extends ScreeningFilters {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    status?: string;
}

interface Movie {
    id: number;
    title: string;
}

interface Cinema {
    id: number;
    name: string;
}

interface CinemaHall {
    id: number;
    name: string;
    cinemaId: number;
}

const ScreeningsPage: React.FC = () => {
    // State for screenings data
    const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalScreenings, setTotalScreenings] = useState(0);

    // Filter options data
    const [movies, setMovies] = useState<Movie[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [cinemaHalls, setCinemaHalls] = useState<CinemaHall[]>([]);
    const [filteredHalls, setFilteredHalls] = useState<CinemaHall[]>([]);

    // Filter state
    const [filters, setFilters] = useState<ExtendedScreeningFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    // Delete confirmation state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [screeningToDelete, setScreeningToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchScreenings();
        fetchFilterOptions();
    }, [page, pageSize]);

    // When cinema filter changes, update the available cinema halls
    useEffect(() => {
        if (filters.cinemaId) {
            setFilteredHalls(cinemaHalls.filter(hall => hall.cinemaId === filters.cinemaId));
            // Reset cinema hall selection if it doesn't belong to selected cinema
            if (filters.cinemaHallId) {
                const hallExists = cinemaHalls.some(
                    hall => hall.id === filters.cinemaHallId && hall.cinemaId === filters.cinemaId
                );
                if (!hallExists) {
                    setFilters(prev => ({ ...prev, cinemaHallId: undefined }));
                }
            }
        } else {
            setFilteredHalls(cinemaHalls);
        }
    }, [filters.cinemaId, cinemaHalls]);

    const fetchScreenings = async () => {
        try {
            setLoading(true);

            // Create a copy of filters to modify for API request
            const apiFilters: ExtendedScreeningFilters = { ...filters };

            // Handle status filter separately (not directly passed to API)
            if (filters.status) {
                const now = new Date();

                if (filters.status === 'upcoming') {
                    // For upcoming screenings, set startDate filter to now if not already set
                    apiFilters.startDate = filters.startDate || now;
                } else if (filters.status === 'expired') {
                    // For expired screenings, set endDate filter to now if not already set
                    apiFilters.endDate = filters.endDate || now;
                    // Also set sorting to show the most recently expired first
                    apiFilters.sortBy = 'endTime';
                    apiFilters.sortDirection = 'desc';
                }

                // Remove status from API filters as it's not a backend parameter
                delete apiFilters.status;
            }

            const data = await ScreeningsService.getScreenings({
                ...apiFilters,
                page,
                pageSize,
            });

            let filteredScreenings = data.screenings;

            // Additional filtering on client side if status filter is active
            if (filters.status === 'upcoming' || filters.status === 'expired' || filters.status === 'in_progress') {
                const now = new Date();

                filteredScreenings = data.screenings.filter((screening: ScreeningResponse) => {
                    const startTime = new Date(screening.startTime);
                    const endTime = new Date(screening.endTime);

                    if (filters.status === 'upcoming') {
                        return startTime > now;
                    } else if (filters.status === 'expired') {
                        return endTime < now;
                    } else if (filters.status === 'in_progress') {
                        return startTime <= now && endTime >= now;
                    }
                    return true;
                });
            }

            setScreenings(filteredScreenings);
            setTotalPages(data.totalPages);
            setTotalScreenings(data.total);
            setLoading(false);
        } catch (err) {
            setError('Failed to load screenings. Please try again later.');
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            // Fetch movies for filter dropdown
            const moviesData = await MoviesService.getMovies('', 1, 100); // Get up to 100 movies for dropdown
            setMovies(moviesData.movies);

            // Fetch cinemas for filter dropdown
            const cinemasData = await CinemasService.getCinemas('', 1, 100);
            setCinemas(cinemasData.cinemas);

            // Fetch cinema halls for filter dropdown
            const hallsData = await CinemaHallsService.getHalls('', 1, 100);
            setCinemaHalls(hallsData.halls);
            setFilteredHalls(hallsData.halls);
        } catch (err) {
            console.error('Error fetching filter options:', err);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (value === '') {
            // If empty value selected, remove the filter
            const newFilters = { ...filters };
            delete newFilters[name as keyof typeof filters];
            setFilters(newFilters);
        } else {
            // Otherwise add/update the filter
            setFilters(prev => ({
                ...prev,
                [name]: name === 'movieId' || name === 'cinemaId' || name === 'cinemaHallId'
                    ? parseInt(value)
                    : value
            }));
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '') {
            // If date cleared, remove the filter
            const newFilters = { ...filters };
            delete newFilters[name as keyof ScreeningFilters];
            setFilters(newFilters);
        } else {
            // Otherwise set the date filter
            setFilters(prev => ({
                ...prev,
                [name]: new Date(value)
            }));
        }
    };

    const applyFilters = () => {
        setPage(1); // Reset to first page when applying filters
        fetchScreenings();
    };

    const resetFilters = () => {
        setFilters({});
        setPage(1);
        // Fetch screenings without filters after reset
        setTimeout(() => {
            fetchScreenings();
        }, 0);
    };

    const handleDeleteClick = (screeningId: number) => {
        setScreeningToDelete(screeningId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (screeningToDelete) {
            try {
                await ScreeningsService.deleteScreening(screeningToDelete);
                setDeleteModalOpen(false);
                fetchScreenings(); // Refresh the list
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error deleting screening');
            }
        }
    };

    const renderPagination = () => {
        const pages = [];
        const displayPages = 5; // Number of page buttons to show

        let startPage = Math.max(1, page - Math.floor(displayPages / 2));
        let endPage = Math.min(totalPages, startPage + displayPages - 1);

        if (endPage - startPage + 1 < displayPages) {
            startPage = Math.max(1, endPage - displayPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 mx-1 rounded ${page === i
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex items-center justify-between mt-6">
                <div>
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-medium">{screenings.length}</span> of{' '}
                        <span className="font-medium">{totalScreenings}</span> screenings
                    </span>
                </div>
                <div className="flex">
                    <button
                        onClick={() => setPage(page > 1 ? page - 1 : 1)}
                        disabled={page <= 1}
                        className={`px-3 py-1 mx-1 rounded ${page <= 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Previous
                    </button>
                    {pages}
                    <button
                        onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                        disabled={page >= totalPages}
                        className={`px-3 py-1 mx-1 rounded ${page >= totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    // Format date and time from ISO string
    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Check screening status
    const getScreeningStatus = (startTime: string, endTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) {
            return { label: 'Upcoming', color: 'blue' };
        } else if (now >= start && now <= end) {
            return { label: 'In Progress', color: 'green' };
        } else {
            return { label: 'Expired', color: 'gray' };
        }
    };

    return (
        <AdminLayout title="Screening Management">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
                        <Calendar className="mr-2" size={24} />
                        Screening Management
                    </h1>
                    <div className="flex space-x-2">
                        <Link
                            to="/admin/screenings/statistics"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition duration-200"
                        >
                            <BarChart2 size={18} className="mr-1" /> Statistics
                        </Link>
                        <Link
                            to="/admin/screenings/bulk-create"
                            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700 transition duration-200"
                        >
                            <Plus size={18} className="mr-1" /> Bulk Create
                        </Link>
                        <Link
                            to="/admin/screenings/add"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition duration-200"
                        >
                            <Plus size={18} className="mr-1" /> Add Screening
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                        <AlertCircle size={18} className="mr-2" />
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center text-gray-700 hover:text-indigo-600"
                    >
                        <Filter size={18} className="mr-1" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {showFilters && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={filters.status || ''}
                                        onChange={handleFilterChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Screenings</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>

                                {/* Movie Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Movie</label>
                                    <select
                                        name="movieId"
                                        value={filters.movieId || ''}
                                        onChange={handleFilterChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Movies</option>
                                        {movies.map(movie => (
                                            <option key={movie.id} value={movie.id}>
                                                {movie.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cinema Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cinema</label>
                                    <select
                                        name="cinemaId"
                                        value={filters.cinemaId || ''}
                                        onChange={handleFilterChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Cinemas</option>
                                        {cinemas.map(cinema => (
                                            <option key={cinema.id} value={cinema.id}>
                                                {cinema.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cinema Hall Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cinema Hall</label>
                                    <select
                                        name="cinemaHallId"
                                        value={filters.cinemaHallId || ''}
                                        onChange={handleFilterChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        disabled={filteredHalls.length === 0}
                                    >
                                        <option value="">All Cinema Halls</option>
                                        {filteredHalls.map(hall => (
                                            <option key={hall.id} value={hall.id}>
                                                {hall.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate ? filters.startDate.toISOString().substr(0, 10) : ''}
                                        onChange={handleDateChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate ? filters.endDate.toISOString().substr(0, 10) : ''}
                                        onChange={handleDateChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Loading screenings...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Movie
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cinema / Hall
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Start Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            End Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Seats
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {screenings.length > 0 ? (
                                        screenings.map((screening) => {
                                            const status = getScreeningStatus(screening.startTime, screening.endTime);
                                            return (
                                                <tr key={screening.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {screening.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            {screening.posterUrl && (
                                                                <img
                                                                    src={screening.posterUrl}
                                                                    alt={screening.movieTitle}
                                                                    className="h-10 w-7 object-cover mr-2 rounded"
                                                                />
                                                            )}
                                                            <div>
                                                                <div>{screening.movieTitle}</div>
                                                                <div className="text-xs text-gray-400 flex items-center">
                                                                    <Clock size={12} className="mr-1" /> {screening.durationMinutes} min
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div>{screening.cinemaName}</div>
                                                        <div className="text-xs text-gray-400">{screening.cinemaHallName} ({screening.hallType})</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDateTime(screening.startTime)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDateTime(screening.endTime)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {screening.price.toLocaleString('vi-VN')} VND
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${status.color}-100 text-${status.color}-800`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${screening.bookedSeatsCount === 0
                                                                ? 'bg-green-500'
                                                                : screening.availableSeats === 0
                                                                    ? 'bg-red-500'
                                                                    : 'bg-yellow-500'
                                                                }`}></span>
                                                            {screening.bookedSeatsCount}/{screening.bookedSeatsCount + (screening.availableSeats || 0)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            to={`/admin/screenings/${screening.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 mx-2"
                                                            title="View details"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/screenings/edit/${screening.id}`}
                                                            className="text-blue-600 hover:text-blue-900 mx-2"
                                                            title="Edit screening"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(screening.id)}
                                                            className={`text-red-600 hover:text-red-900 mx-2 ${status.label !== 'Expired' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Delete screening"
                                                            disabled={status.label !== 'Expired'}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                                No screenings found. Try different filters or add a new screening.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {renderPagination()}
                    </>
                )}
            </div>

            {/* Delete confirmation modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete this screening? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ScreeningsPage; 
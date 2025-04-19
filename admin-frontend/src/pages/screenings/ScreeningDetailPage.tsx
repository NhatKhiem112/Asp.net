import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Film, MapPin, Clock, DollarSign, User, Edit, Trash2, ArrowLeft, AlertCircle, Users } from 'react-feather';
import ScreeningsService, { ScreeningResponse } from '../../services/screenings.service';
import AdminLayout from '../../layouts/AdminLayout';

const ScreeningDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [screening, setScreening] = useState<ScreeningResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchScreeningData();
    }, [id]);

    const fetchScreeningData = async () => {
        try {
            setLoading(true);
            const data = await ScreeningsService.getScreening(parseInt(id as string));
            setScreening(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load screening data. Please try again.');
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await ScreeningsService.deleteScreening(parseInt(id as string));
            navigate('/admin/screenings');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error deleting screening');
            setDeleteModalOpen(false);
        }
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

    // Format just the date
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    };

    // Format just the time
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Check if the screening is in the past, current or future
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
        <AdminLayout title="Screening Details">
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/screenings')}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Screenings
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                    <AlertCircle size={18} className="mr-2" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading screening data...</p>
                </div>
            ) : screening ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <Calendar size={24} className="text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {screening.movieTitle}
                                </h1>
                                <p className="text-sm text-gray-500">Screening ID: {screening.id}</p>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${getScreeningStatus(screening.startTime, screening.endTime).color}-100 text-${getScreeningStatus(screening.startTime, screening.endTime).color}-800`}>
                                {getScreeningStatus(screening.startTime, screening.endTime).label}
                            </div>
                            <Link
                                to={`/admin/screenings/edit/${screening.id}`}
                                className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                            >
                                <Edit size={16} className="mr-1" /> Edit
                            </Link>
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                disabled={getScreeningStatus(screening.startTime, screening.endTime).label !== 'Expired'}
                            >
                                <Trash2 size={16} className="mr-1" /> Delete
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Movie Information */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Film size={20} className="mr-2 text-indigo-600" />
                                    Movie Information
                                </h2>

                                <div className="flex items-start mb-6">
                                    {screening.posterUrl && (
                                        <img
                                            src={screening.posterUrl}
                                            alt={screening.movieTitle}
                                            className="w-32 h-48 object-cover rounded-md shadow-sm mr-4"
                                        />
                                    )}

                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-gray-500">Title</p>
                                            <p className="font-medium">{screening.movieTitle}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Duration</p>
                                            <p className="font-medium">{screening.durationMinutes} minutes</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Movie ID</p>
                                            <p className="font-medium">{screening.movieId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Screening Details */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Calendar size={20} className="mr-2 text-indigo-600" />
                                    Screening Details
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <Clock className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Date</p>
                                            <p className="text-gray-800 font-medium">{formatDate(screening.startTime)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Clock className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Time</p>
                                            <p className="text-gray-800 font-medium">
                                                {formatTime(screening.startTime)} - {formatTime(screening.endTime)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Cinema</p>
                                            <p className="text-gray-800 font-medium">{screening.cinemaName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Cinema Hall</p>
                                            <p className="text-gray-800 font-medium">{screening.cinemaHallName} ({screening.hallType})</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <DollarSign className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Ticket Price</p>
                                            <p className="text-gray-800 font-medium">{screening.price.toLocaleString('vi-VN')} VND</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Users className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Seats</p>
                                            <div className="flex items-center mt-1">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-indigo-600 h-2.5 rounded-full"
                                                        style={{
                                                            width: `${screening.bookedSeatsCount / (screening.bookedSeatsCount + (screening.availableSeats || 0)) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="ml-2 text-sm text-gray-600">
                                                    {screening.bookedSeatsCount} / {screening.bookedSeatsCount + (screening.availableSeats || 0)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {screening.availableSeats} seats available
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="text-gray-800">{formatDateTime(screening.createdAt)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-${getScreeningStatus(screening.startTime, screening.endTime).color}-100 text-${getScreeningStatus(screening.startTime, screening.endTime).color}-800`}>
                                        {getScreeningStatus(screening.startTime, screening.endTime).label}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Booking Rate</p>
                                    <p className="text-gray-800">
                                        {(screening.bookedSeatsCount / (screening.bookedSeatsCount + (screening.availableSeats || 0)) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-red-500 mb-2">
                        <AlertCircle size={48} className="inline-block" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Screening Not Found</h3>
                    <p className="mt-1 text-gray-500">The screening you're looking for does not exist or may have been deleted.</p>
                    <div className="mt-6">
                        <Link
                            to="/admin/screenings"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to Screenings
                        </Link>
                    </div>
                </div>
            )}

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

export default ScreeningDetailPage; 
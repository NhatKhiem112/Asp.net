import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import CinemasService, { CinemaDetail, CinemaHall } from '../../services/cinemas.service';
import CinemaHallsService from '../../services/cinemaHalls.service';
import { PencilIcon, TrashIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const CinemaDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [cinema, setCinema] = useState<CinemaDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCinema = async () => {
            if (!id) {
                setError('Invalid cinema ID');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const cinemaData = await CinemasService.getCinema(parseInt(id, 10));
                console.log('Cinema data received:', cinemaData);

                // If halls array is missing or empty but we know the cinema exists, try to fetch halls separately
                if (cinemaData && (!cinemaData.halls || cinemaData.halls.length === 0)) {
                    console.log('Halls not included in cinema data, fetching separately...');
                    const updatedCinemaData = await fetchCinemaHalls(cinemaData);
                    setCinema(updatedCinemaData);
                } else {
                    // Ensure halls is always an array
                    if (!cinemaData.halls) {
                        cinemaData.halls = [];
                    }
                    setCinema(cinemaData);
                }
            } catch (err: any) {
                console.error('Error fetching cinema:', err);
                setError(err.message || 'Failed to load cinema details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCinema();
    }, [id]);

    // Helper function to fetch halls when they're not included in cinema data
    const fetchCinemaHalls = async (cinemaData: CinemaDetail) => {
        // Try multiple methods to fetch halls
        let hallsFetched = false;

        // Method 1: Try getCinemaHalls
        try {
            const hallsResponse = await CinemasService.getCinemaHalls(cinemaData.id);
            if (hallsResponse.halls && hallsResponse.halls.length > 0) {
                console.log('Halls fetched from getCinemaHalls:', hallsResponse.halls);
                cinemaData.halls = hallsResponse.halls;
                hallsFetched = true;
            }
        } catch (hallError) {
            console.error('Error fetching cinema halls with getCinemaHalls:', hallError);
        }

        // Method 2: If first method didn't work, try getCinemaHallsDirect
        if (!hallsFetched) {
            try {
                const directResponse = await CinemasService.getCinemaHallsDirect(cinemaData.id);
                if (directResponse.halls && directResponse.halls.length > 0) {
                    console.log('Halls fetched from getCinemaHallsDirect:', directResponse.halls);
                    cinemaData.halls = directResponse.halls;
                    hallsFetched = true;
                }
            } catch (directError) {
                console.error('Error fetching cinema halls with getCinemaHallsDirect:', directError);
            }
        }

        // If both methods failed, initialize with empty array
        if (!hallsFetched) {
            console.warn('Failed to fetch halls with both methods, initializing empty array');
            cinemaData.halls = [];
        }

        return cinemaData;
    };

    const handleDeleteCinema = async () => {
        if (!cinema || !id) return;

        if (window.confirm(`Are you sure you want to delete "${cinema.name}"? This action cannot be undone.`)) {
            try {
                await CinemasService.deleteCinema(parseInt(id, 10));
                navigate('/admin/cinemas');
            } catch (err: any) {
                console.error('Error deleting cinema:', err);
                alert(err.response?.data?.message || 'Failed to delete cinema');
            }
        }
    };

    const handleDeleteHall = async (hallId: number) => {
        if (!cinema || !id) return;

        if (window.confirm(`Are you sure you want to delete this hall? This action cannot be undone.`)) {
            try {
                console.log(`Deleting hall with ID: ${hallId} using direct CinemaHallsService.deleteHall`);
                // Use the direct endpoint from CinemaHallsController
                await CinemaHallsService.deleteHall(hallId);

                console.log('Hall deleted successfully, refreshing cinema data...');
                // Refresh cinema data
                let cinemaData = await CinemasService.getCinema(parseInt(id, 10));

                // If halls array is missing or empty, fetch halls separately
                if (!cinemaData.halls || cinemaData.halls.length === 0) {
                    console.log('Halls not included in cinema data after deletion, fetching separately...');
                    cinemaData = await fetchCinemaHalls(cinemaData);
                }

                // Update the state with refreshed data
                setCinema(cinemaData);
            } catch (err: any) {
                console.error('Error deleting hall:', err);

                // Extract the most meaningful error message
                let errorMessage = 'Failed to delete hall';

                if (err.response?.data?.message) {
                    // API might return a meaningful error message
                    errorMessage = err.response.data.message;
                } else if (err.response?.data) {
                    // Try to get any information from the response data
                    errorMessage = typeof err.response.data === 'string'
                        ? err.response.data
                        : 'Server error: Cannot delete hall';
                } else if (err.message) {
                    // Use the error's own message
                    errorMessage = err.message;
                }

                alert(errorMessage);
            }
        }
    };

    if (isLoading) {
        return (
            <AdminLayout title="Cinema Details">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !cinema) {
        return (
            <AdminLayout title="Cinema Details">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error || 'Failed to load cinema details'}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/cinemas')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back to Cinemas
                </button>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Cinema: ${cinema.name}`}>
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/cinemas')}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Cinemas
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Cinema Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{cinema.name}</h1>
                            <p className="text-gray-600">{cinema.address}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => navigate(`/admin/cinemas/edit/${cinema.id}`)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteCinema}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cinema Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>
                            <dl className="divide-y divide-gray-200">
                                <div className="py-2 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                    <dd className="text-sm text-gray-900">{cinema.phoneNumber}</dd>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Total Halls</dt>
                                    <dd className="text-sm text-gray-900">{cinema.halls?.length || 0}</dd>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Total Seats</dt>
                                    <dd className="text-sm text-gray-900">{cinema.seatCount || 0}</dd>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                                    <dd className="text-sm text-gray-900">{new Date(cinema.createdAt).toLocaleDateString()}</dd>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                    <dd className="text-sm text-gray-900">{new Date(cinema.updatedAt).toLocaleDateString()}</dd>
                                </div>
                            </dl>
                        </div>

                        {cinema.description && (
                            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                                <p className="text-sm text-gray-700">{cinema.description}</p>
                            </div>
                        )}

                        {cinema.imageUrl && (
                            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Image</h2>
                                <img
                                    src={cinema.imageUrl}
                                    alt={cinema.name}
                                    className="w-full h-48 object-cover rounded-md shadow-sm"
                                />
                            </div>
                        )}
                    </div>

                    <div className="col-span-2">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900">Cinema Halls</h2>
                                <button
                                    onClick={() => navigate(`/admin/cinemas/${cinema.id}/halls/add`)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add Hall
                                </button>
                            </div>

                            {/* Debug information */}
                            {(() => { console.log('Rendering cinema halls section. Halls data:', cinema.halls); return null; })()}
                            {(cinema.halls?.length > 0) ? (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {cinema.halls.map((hall: CinemaHall) => (
                                            <li key={hall.id}>
                                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center">
                                                            <p className="text-sm font-medium text-indigo-600 truncate">{hall.name}</p>
                                                            <p className="ml-2 text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5">
                                                                {hall.hallType || 'Standard'}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 flex">
                                                            <div className="flex items-center text-sm text-gray-500 mr-4">
                                                                <span>Capacity: {hall.capacity || 0}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <span>Seats: {hall.seatsCount || 0}</span>
                                                            </div>
                                                            {hall.screeningsCount !== undefined && (
                                                                <div className="flex items-center text-sm text-gray-500 ml-4">
                                                                    <span>Screenings: {hall.screeningsCount}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/cinemas/${cinema.id}/halls/edit/${hall.id}`)}
                                                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            <PencilIcon className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHall(hall.id)}
                                                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        >
                                                            <TrashIcon className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 bg-white rounded-md">
                                    <p className="text-gray-500 mb-4">No cinema halls found for this cinema</p>
                                    <button
                                        onClick={() => navigate(`/admin/cinemas/${cinema.id}/halls/add`)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Your First Hall
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CinemaDetailPage; 
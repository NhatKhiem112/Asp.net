import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import CinemasService, { Cinema, CinemaStatistics } from '../../services/cinemas.service';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const CinemasPage: React.FC = () => {
    const navigate = useNavigate();
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [statistics, setStatistics] = useState<CinemaStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        fetchCinemas();
        fetchStatistics();
    }, [page, search]);

    // New function to fetch capacity data for cinemas that are missing it
    const enrichCinemasWithCapacityData = async (cinemasToEnrich: Cinema[]) => {
        const enrichedCinemas = [...cinemasToEnrich];

        for (let i = 0; i < enrichedCinemas.length; i++) {
            const cinema = enrichedCinemas[i];

            // Only fetch additional data if seatCount is 0 or undefined
            if (!cinema.seatCount) {
                console.log(`Fetching additional capacity data for cinema ${cinema.id} (${cinema.name})`);

                try {
                    // Try to get the halls to calculate total capacity
                    const hallsResponse = await CinemasService.getCinemaHallsDirect(cinema.id);

                    if (hallsResponse.halls && hallsResponse.halls.length > 0) {
                        // Calculate total capacity from halls
                        const totalCapacity = hallsResponse.halls.reduce((sum: number, hall: any) => {
                            const hallCapacity = hall.capacity || hall.Capacity || 0;
                            return sum + hallCapacity;
                        }, 0);

                        console.log(`Calculated total capacity for cinema ${cinema.id}: ${totalCapacity} from ${hallsResponse.halls.length} halls`);

                        // Update the cinema with the calculated capacity
                        enrichedCinemas[i] = {
                            ...cinema,
                            seatCount: totalCapacity
                        };
                    }
                } catch (err) {
                    console.error(`Failed to fetch halls for cinema ${cinema.id}:`, err);
                }
            }
        }

        // Update state with enriched data
        setCinemas(enrichedCinemas);
    };

    const fetchCinemas = async () => {
        try {
            setLoading(true);
            const response = await CinemasService.getCinemas(search, page, pageSize);
            console.log('Cinemas data received:', response.cinemas);

            // Process the cinema data to ensure hallCount and seatCount are available
            const processedCinemas = response.cinemas.map((cinema: any) => {
                // Log each cinema to check its properties
                console.log(`Cinema ${cinema.id} (${cinema.name}) details:`, cinema);
                console.log(`Available seat-related fields:`, {
                    seatCount: cinema.seatCount,
                    seatsCount: cinema.seatsCount,
                    capacity: cinema.capacity,
                    Capacity: cinema.Capacity,
                    totalSeats: cinema.totalSeats,
                    // Log raw object keys to see all available properties
                    allKeys: Object.keys(cinema)
                });

                // Handle different property names or missing values
                const processedCinema: Cinema = {
                    ...cinema,
                    // Handle possible naming differences or undefined values
                    hallCount: cinema.hallCount !== undefined ? cinema.hallCount :
                        (cinema.hallsCount !== undefined ? cinema.hallsCount : 0),
                    // For seat count, check multiple possible property names including Capacity
                    seatCount: cinema.seatCount !== undefined ? cinema.seatCount :
                        (cinema.seatsCount !== undefined ? cinema.seatsCount :
                            (cinema.capacity !== undefined ? cinema.capacity :
                                (cinema.Capacity !== undefined ? cinema.Capacity :
                                    (cinema.totalSeats !== undefined ? cinema.totalSeats : 0))))
                };

                return processedCinema;
            });

            setCinemas(processedCinemas);
            setTotalPages(response.totalPages);

            // If any cinemas have zero seat count, fetch additional data
            const cinemasNeedingEnrichment = processedCinemas.filter((cinema: Cinema) => !cinema.seatCount);
            if (cinemasNeedingEnrichment.length > 0) {
                console.log(`${cinemasNeedingEnrichment.length} cinemas need additional capacity data`);
                enrichCinemasWithCapacityData(processedCinemas);
            }
        } catch (err: any) {
            console.error('Error fetching cinemas:', err);
            setError(err.message || 'Failed to load cinemas');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await CinemasService.getStatistics();
            setStatistics(stats);
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    const handleDeleteCinema = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                await CinemasService.deleteCinema(id);
                // Refresh cinema list
                fetchCinemas();
                fetchStatistics();
            } catch (err: any) {
                console.error('Error deleting cinema:', err);
                alert(err.response?.data?.message || 'Failed to delete cinema');
            }
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCinemas();
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`px-3 py-1 rounded-md ${page === i ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setPage(i)}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex justify-center mt-4 space-x-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                {pages}
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <AdminLayout title="Cinemas Management">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cinemas Management</h1>
                    <p className="text-gray-600">Manage your cinemas and cinema halls</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        {showStats ? 'Hide Stats' : 'Show Stats'}
                    </button>
                    <button
                        onClick={() => navigate('/admin/cinemas/add')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Cinema
                    </button>
                </div>
            </div>

            {showStats && statistics && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <dt className="text-sm text-gray-500">Total Cinemas</dt>
                            <dd className="text-sm font-medium text-gray-900">{statistics.totalCinemas}</dd>
                            <dt className="text-sm text-gray-500">Total Halls</dt>
                            <dd className="text-sm font-medium text-gray-900">{statistics.totalCinemaHalls}</dd>
                            <dt className="text-sm text-gray-500">Total Seats</dt>
                            <dd className="text-sm font-medium text-gray-900">{statistics.totalSeats}</dd>
                        </dl>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Averages</h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <dt className="text-sm text-gray-500">Halls per Cinema</dt>
                            <dd className="text-sm font-medium text-gray-900">{statistics.avgHallsPerCinema.toFixed(1)}</dd>
                            <dt className="text-sm text-gray-500">Seats per Hall</dt>
                            <dd className="text-sm font-medium text-gray-900">{statistics.avgSeatsPerHall.toFixed(1)}</dd>
                        </dl>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Most Active</h3>
                        <dl className="grid grid-cols-1 gap-y-2">
                            {statistics.mostActiveVenue ? (
                                <>
                                    <dt className="text-sm text-gray-500">Most Screenings</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {statistics.mostActiveVenue.name} ({statistics.mostActiveVenue.screeningCount} screenings)
                                    </dd>
                                </>
                            ) : (
                                <dd className="text-sm text-gray-500">No screenings data</dd>
                            )}
                            {statistics.mostBookedVenue ? (
                                <>
                                    <dt className="text-sm text-gray-500">Most Bookings</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {statistics.mostBookedVenue.name} ({statistics.mostBookedVenue.bookingCount} bookings)
                                    </dd>
                                </>
                            ) : (
                                <dd className="text-sm text-gray-500">No booking data</dd>
                            )}
                        </dl>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <form onSubmit={handleSearch} className="flex gap-x-4">
                        <div className="min-w-0 flex-1">
                            <label htmlFor="search" className="sr-only">
                                Search
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="search"
                                    name="search"
                                    id="search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="Search by name, address, or phone number"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                    </div>
                ) : cinemas.length === 0 ? (
                    <div className="text-center py-12">
                        {search ? (
                            <div>
                                <p className="mt-1 text-sm text-gray-500">No cinemas found matching "{search}"</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setPage(1);
                                    }}
                                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-900"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="mt-1 text-sm text-gray-500">No cinemas yet</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/cinemas/add')}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add your first cinema
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cinema
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Address
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Halls / Seats
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {cinemas.map(cinema => (
                                        <tr key={cinema.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600" onClick={() => navigate(`/admin/cinemas/${cinema.id}`)}>
                                                            {cinema.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{cinema.phoneNumber}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{cinema.address}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {/* Debug info */}
                                                {(() => { console.log(`Rendering hall/seat data for ${cinema.name}:`, cinema.hallCount, cinema.seatCount); return null; })()}
                                                {cinema.hallCount ?? 0} halls / {cinema.seatCount ?? 0} seats
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/cinemas/${cinema.id}`)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/cinemas/edit/${cinema.id}`)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCinema(cinema.id, cinema.name)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination()}
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default CinemasPage; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BookingsService, { BookingStatistics } from '../../services/bookings.service';
import {
    BarChart2,
    DollarSign,
    Users,
    Calendar,
    ArrowLeft,
    RefreshCw,
    Film
} from 'react-feather';

const BookingStatisticsPage: React.FC = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState<BookingStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const data = await BookingsService.getBookingStatistics();
            setStatistics(data);
            setError('');
        } catch (err) {
            console.error('Error fetching booking statistics:', err);
            setError('Failed to load booking statistics. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/admin/bookings')}
                        className="btn btn-ghost btn-sm flex items-center"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Bookings
                    </button>
                    <h1 className="text-2xl font-semibold mt-4">Booking Statistics</h1>
                    <p className="text-gray-600">Overview of booking performance and revenue</p>
                </div>

                {error && <div className="alert alert-error mb-6">{error}</div>}

                {loading ? (
                    <div className="flex justify-center my-12">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : statistics ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Bookings */}
                            <div className="stat bg-white shadow rounded-lg">
                                <div className="stat-figure text-primary">
                                    <BarChart2 size={24} />
                                </div>
                                <div className="stat-title">Total Bookings</div>
                                <div className="stat-value text-primary">{statistics.totalBookings}</div>
                                <div className="stat-desc">All time booking count</div>
                            </div>

                            {/* Total Revenue */}
                            <div className="stat bg-white shadow rounded-lg">
                                <div className="stat-figure text-secondary">
                                    <DollarSign size={24} />
                                </div>
                                <div className="stat-title">Total Revenue</div>
                                <div className="stat-value text-secondary">{formatCurrency(statistics.totalRevenue)}</div>
                                <div className="stat-desc">All time revenue</div>
                            </div>

                            {/* Total Tickets */}
                            <div className="stat bg-white shadow rounded-lg">
                                <div className="stat-figure text-accent">
                                    <Users size={24} />
                                </div>
                                <div className="stat-title">Total Tickets</div>
                                <div className="stat-value text-accent">{statistics.totalTickets}</div>
                                <div className="stat-desc">Tickets sold</div>
                            </div>

                            {/* Today's Bookings */}
                            <div className="stat bg-white shadow rounded-lg">
                                <div className="stat-figure text-info">
                                    <Calendar size={24} />
                                </div>
                                <div className="stat-title">Today's Bookings</div>
                                <div className="stat-value text-info">{statistics.bookingsByTime.today}</div>
                                <div className="stat-desc">Bookings made today</div>
                            </div>
                        </div>

                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Booking Status */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>Pending</span>
                                            <span className="font-medium">{statistics.bookingStatus.pending}</span>
                                        </div>
                                        <progress
                                            className="progress progress-warning w-full"
                                            value={statistics.bookingStatus.pending}
                                            max={statistics.totalBookings}
                                        ></progress>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>Confirmed</span>
                                            <span className="font-medium">{statistics.bookingStatus.confirmed}</span>
                                        </div>
                                        <progress
                                            className="progress progress-success w-full"
                                            value={statistics.bookingStatus.confirmed}
                                            max={statistics.totalBookings}
                                        ></progress>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>Cancelled</span>
                                            <span className="font-medium">{statistics.bookingStatus.cancelled}</span>
                                        </div>
                                        <progress
                                            className="progress progress-error w-full"
                                            value={statistics.bookingStatus.cancelled}
                                            max={statistics.totalBookings}
                                        ></progress>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>Pending</span>
                                            <span className="font-medium">{statistics.paymentStatus.pending}</span>
                                        </div>
                                        <progress
                                            className="progress progress-warning w-full"
                                            value={statistics.paymentStatus.pending}
                                            max={statistics.totalBookings}
                                        ></progress>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>Completed</span>
                                            <span className="font-medium">{statistics.paymentStatus.completed}</span>
                                        </div>
                                        <progress
                                            className="progress progress-success w-full"
                                            value={statistics.paymentStatus.completed}
                                            max={statistics.totalBookings}
                                        ></progress>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>Failed</span>
                                            <span className="font-medium">{statistics.paymentStatus.failed}</span>
                                        </div>
                                        <progress
                                            className="progress progress-error w-full"
                                            value={statistics.paymentStatus.failed}
                                            max={statistics.totalBookings}
                                        ></progress>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue by Time Period */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
                                <p className="text-3xl font-bold mt-2">{formatCurrency(statistics.revenueByTime.today)}</p>
                            </div>
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-sm font-medium text-gray-500">This Week's Revenue</h3>
                                <p className="text-3xl font-bold mt-2">{formatCurrency(statistics.revenueByTime.thisWeek)}</p>
                            </div>
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-sm font-medium text-gray-500">This Month's Revenue</h3>
                                <p className="text-3xl font-bold mt-2">{formatCurrency(statistics.revenueByTime.thisMonth)}</p>
                            </div>
                        </div>

                        {/* Top Movies */}
                        {statistics.topMovies && statistics.topMovies.length > 0 && (
                            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                                <div className="p-6 border-b">
                                    <h3 className="text-lg font-semibold">Top Movies by Bookings</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Movie ID</th>
                                                <th>Title</th>
                                                <th>Booking Count</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statistics.topMovies.map(movie => (
                                                <tr key={movie.id}>
                                                    <td>{movie.id}</td>
                                                    <td className="flex items-center">
                                                        <Film size={16} className="mr-2 text-gray-400" />
                                                        {movie.title}
                                                    </td>
                                                    <td>{movie.bookingCount}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => navigate(`/admin/movies/${movie.id}`)}
                                                            className="btn btn-ghost btn-xs"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Payment Methods */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">Credit Card</h4>
                                    <p className="text-2xl font-bold mt-1">{statistics.paymentMethods.creditcard}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">Banking</h4>
                                    <p className="text-2xl font-bold mt-1">{statistics.paymentMethods.banking}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">Cash</h4>
                                    <p className="text-2xl font-bold mt-1">{statistics.paymentMethods.cash}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">Other</h4>
                                    <p className="text-2xl font-bold mt-1">{statistics.paymentMethods.other}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-base-200 p-12 rounded-lg text-center">
                        <p className="text-gray-500 mb-4">No statistics available</p>
                        <button
                            onClick={fetchStatistics}
                            className="btn btn-primary"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Refresh Data
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BookingStatisticsPage; 
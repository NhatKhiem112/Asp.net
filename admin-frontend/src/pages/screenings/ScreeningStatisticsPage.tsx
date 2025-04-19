import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart2,
    DollarSign,
    Film,
    Calendar,
    Clock,
    Bookmark,
    Tag,
    ChevronLeft
} from 'react-feather';
import ScreeningsService, { ScreeningStatistics } from '../../services/screenings.service';
import AdminLayout from '../../layouts/AdminLayout';

const ScreeningStatisticsPage: React.FC = () => {
    const [statistics, setStatistics] = useState<ScreeningStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const stats = await ScreeningsService.getScreeningStatistics();
            setStatistics(stats);
            setError(null);
        } catch (err) {
            console.error('Error fetching screening statistics:', err);
            setError('Failed to load screening statistics. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Function to calculate percentage
    const calculatePercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <AdminLayout>
            <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Screening Statistics</h1>
                    <Link to="/admin/screenings" className="flex items-center text-blue-600 hover:text-blue-800">
                        <ChevronLeft size={16} className="mr-1" />
                        Back to Screenings
                    </Link>
                </div>

                {loading && (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Total Screenings */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                                    <Film size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 uppercase">Total Screenings</p>
                                    <p className="text-2xl font-bold text-gray-800">{statistics.totalScreenings}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-gray-500">Past</span>
                                    <span className="text-xs text-gray-500">Upcoming</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${calculatePercentage(statistics.pastScreenings, statistics.totalScreenings)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-500">{statistics.pastScreenings}</span>
                                    <span className="text-xs text-gray-500">{statistics.upcomingScreenings}</span>
                                </div>
                            </div>
                        </div>

                        {/* Booked Screenings */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                    <Bookmark size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 uppercase">Booked Screenings</p>
                                    <p className="text-2xl font-bold text-gray-800">{statistics.bookedScreenings}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-gray-500">0</span>
                                    <span className="text-xs text-gray-500">{statistics.totalScreenings}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${calculatePercentage(statistics.bookedScreenings, statistics.totalScreenings)}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1">
                                    <span className="text-xs text-gray-500">
                                        {calculatePercentage(statistics.bookedScreenings, statistics.totalScreenings)}% of total screenings have bookings
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sold Tickets */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                    <Tag size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 uppercase">Sold Tickets</p>
                                    <p className="text-2xl font-bold text-gray-800">{statistics.soldTicketsCount}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center">
                                    <Calendar size={16} className="text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        {statistics.bookingsToday} tickets sold today
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 uppercase">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(statistics.totalRevenue)}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center">
                                    <BarChart2 size={16} className="text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Avg. {formatCurrency(statistics.totalRevenue / (statistics.soldTicketsCount || 1))} per ticket
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Screenings */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 uppercase">Upcoming Screenings</p>
                                    <p className="text-2xl font-bold text-gray-800">{statistics.upcomingScreenings}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-gray-500">Upcoming</span>
                                    <span className="text-xs text-gray-500">Past</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{ width: `${calculatePercentage(statistics.upcomingScreenings, statistics.totalScreenings)}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1">
                                    <span className="text-xs text-gray-500">
                                        {calculatePercentage(statistics.upcomingScreenings, statistics.totalScreenings)}% of screenings are upcoming
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    to="/admin/screenings/add"
                                    className="block w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-center"
                                >
                                    Create New Screening
                                </Link>
                                <Link
                                    to="/admin/screenings/bulk-create"
                                    className="block w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
                                >
                                    Bulk Create Screenings
                                </Link>
                                <Link
                                    to="/admin/screenings"
                                    className="block w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center"
                                >
                                    Manage Screenings
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ScreeningStatisticsPage; 
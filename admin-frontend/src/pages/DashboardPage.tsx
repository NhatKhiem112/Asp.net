import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import DashboardService from '../services/dashboard.service';
import AdminLayout from '../layouts/AdminLayout';

// Components
import { ArrowUpIcon, ArrowDownIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// Types
interface ActivityItem {
    id: number;
    userId: number;
    userName: string;
    email: string;
    movieTitle: string;
    createdAt: string;
    totalAmount: number;
    bookingStatus: string;
    paymentStatus: string;
    type: string;
    timeAgo: number;
}

interface DashboardSummary {
    users: {
        total: number;
        newToday: number;
        newThisWeek: number;
        newThisMonth: number;
    };
    bookings: {
        total: number;
        today: number;
        yesterday: number;
        trend: number;
        byStatus: {
            pending: number;
            confirmed: number;
            cancelled: number;
        };
    };
    revenue: {
        total: number;
        today: number;
        yesterday: number;
        trend: number;
        byMonth: {
            month: string;
            revenue: number;
        }[];
        byPaymentStatus: {
            pending: number;
            completed: number;
            failed: number;
        };
    };
    screenings: {
        total: number;
        upcoming: number;
        today: number;
    };
    cinemas: {
        total: number;
        halls: number;
    };
    movies: {
        total: number;
        upcoming: number;
    };
    topPerformers: {
        movies: {
            id: number;
            title: string;
            posterUrl: string;
            bookingCount: number;
        }[];
        cinemas: {
            id: number;
            name: string;
            imageUrl: string;
            bookingCount: number;
        }[];
    };
}

const DashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);

    // Lấy dữ liệu dashboard
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const summaryData = await DashboardService.getSummary();
                setSummary(summaryData);

                try {
                    const activityData = await DashboardService.getActivity();
                    setActivity(activityData);
                } catch (activityErr) {
                    console.error('Error fetching activity data:', activityErr);
                    // Don't set the main error - this allows the dashboard to still render with summary data
                    setActivity([]);
                }
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Render các thẻ thống kê
    const StatCard = ({ title, value, trend = 0, icon }: { title: string; value: string | number; trend?: number; icon?: React.ReactNode }) => (
        <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                    <p className="text-3xl font-bold mt-2">{value}</p>

                    {trend !== 0 && (
                        <div className={`mt-2 flex items-center text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {trend > 0 ? (
                                <ArrowUpIcon className="w-4 h-4 mr-1" />
                            ) : trend < 0 ? (
                                <ArrowDownIcon className="w-4 h-4 mr-1" />
                            ) : null}
                            <span>{Math.abs(trend)}% so với hôm qua</span>
                        </div>
                    )}
                </div>

                {icon && (
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );

    // Màu sắc cho biểu đồ
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Màu sắc cho biểu đồ tròn trạng thái đặt vé
    const PIE_COLORS = {
        pending: '#FFBB28',
        confirmed: '#00C49F',
        cancelled: '#FF8042'
    };

    if (isLoading) {
        return (
            <AdminLayout title="Dashboard">
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Dashboard">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                    <div className="flex items-center">
                        <ExclamationCircleIcon className="w-6 h-6 mr-2" />
                        <p>{error}</p>
                    </div>
                    <button
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Dashboard">
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Tổng doanh thu"
                    value={formatCurrency(summary?.revenue.total || 0)}
                    trend={summary?.revenue.trend && summary.revenue.today && summary.revenue.yesterday
                        ? Math.round((summary.revenue.trend / summary.revenue.yesterday) * 100)
                        : 0}
                    icon={<span className="text-xl">₫</span>}
                />

                <StatCard
                    title="Đơn đặt vé"
                    value={summary?.bookings.total || 0}
                    trend={summary?.bookings.trend && summary.bookings.yesterday
                        ? Math.round((summary.bookings.trend / summary.bookings.yesterday) * 100)
                        : 0}
                />

                <StatCard
                    title="Người dùng"
                    value={summary?.users.total || 0}
                    trend={summary?.users.newToday || 0}
                />

                <StatCard
                    title="Phim đang chiếu"
                    value={summary ? summary.movies.total - summary.movies.upcoming : 0}
                />
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Biểu đồ doanh thu theo tháng */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Doanh thu theo tháng</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={summary?.revenue.byMonth || []}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `${value / 1000000}tr`} />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Area type="monotone" dataKey="revenue" stroke="#E50914" fill="#E50914" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ trạng thái đặt vé */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Trạng thái đặt vé</h3>
                    <div className="h-80 flex justify-center items-center">
                        {summary?.bookings.byStatus && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Đang chờ', value: summary.bookings.byStatus.pending, color: PIE_COLORS.pending },
                                            { name: 'Đã xác nhận', value: summary.bookings.byStatus.confirmed, color: PIE_COLORS.confirmed },
                                            { name: 'Đã hủy', value: summary.bookings.byStatus.cancelled, color: PIE_COLORS.cancelled },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {[
                                            { name: 'Đang chờ', value: summary.bookings.byStatus.pending, color: PIE_COLORS.pending },
                                            { name: 'Đã xác nhận', value: summary.bookings.byStatus.confirmed, color: PIE_COLORS.confirmed },
                                            { name: 'Đã hủy', value: summary.bookings.byStatus.cancelled, color: PIE_COLORS.cancelled },
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => value} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Top phim và hoạt động gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top phim */}
                <div className="bg-white rounded-lg shadow p-5 lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Top phim trong tháng</h3>
                    <div className="space-y-4">
                        {summary?.topPerformers.movies.map((movie, index) => (
                            <div key={movie.id} className="flex items-center space-x-3 border-b pb-3 last:border-b-0">
                                <div className="font-bold text-gray-500 w-6 text-center">{index + 1}</div>
                                <div className="h-12 w-12 flex-shrink-0">
                                    {movie.posterUrl ? (
                                        <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover rounded" />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center text-gray-500">
                                            No img
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{movie.title}</h4>
                                    <p className="text-sm text-gray-500">{movie.bookingCount} đặt vé</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hoạt động gần đây */}
                <div className="bg-white rounded-lg shadow p-5 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Đặt vé gần đây</h3>
                    <div className="space-y-4">
                        {activity && activity.length > 0 ? (
                            activity.map((item) => (
                                <div key={item.id} className="flex space-x-3 border-b pb-3 last:border-b-0">
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                        {item.userName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-medium">{item.userName || 'Người dùng'}</span> đã đặt vé xem phim{' '}
                                            <span className="font-medium">{item.movieTitle || 'không xác định'}</span>
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</p>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${item.bookingStatus === 'Confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : item.bookingStatus === 'Cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {item.bookingStatus || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-center items-center py-8 text-gray-500">
                                <div className="text-center">
                                    <ExclamationCircleIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                    <p>Không thể tải dữ liệu hoạt động gần đây</p>
                                    <p className="text-sm mt-1">Vui lòng thử lại sau</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DashboardPage; 
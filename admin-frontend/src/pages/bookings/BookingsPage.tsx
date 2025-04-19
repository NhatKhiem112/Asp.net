import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BookingsService, { Booking, BookingFilters } from '../../services/bookings.service';
import {
    Eye,
    Edit,
    Trash2,
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Calendar,
    DollarSign,
    Film,
    Home,
    BarChart2
} from 'react-feather';

const BookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Filter state
    const [filters, setFilters] = useState<BookingFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [filterValues, setFilterValues] = useState<BookingFilters>({
        bookingStatus: '',
        paymentStatus: '',
        paymentMethod: '',
        startDate: '',
        endDate: '',
        cinemaId: undefined,
        movieId: undefined
    });

    // Load bookings
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await BookingsService.getBookings(page, pageSize, filters);
            setBookings(result.bookings);
            setTotalItems(result.total);
            setTotalPages(result.totalPages);
        } catch (err: any) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu đặt vé');
        } finally {
            setLoading(false);
        }
    };

    // Initial load and when page/filters change
    useEffect(() => {
        fetchBookings();
    }, [page, pageSize, filters]);

    // Apply filters
    const handleApplyFilters = () => {
        setFilters(filterValues);
        setPage(1); // Reset to first page when filters change
        setShowFilters(false);
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilterValues({
            bookingStatus: '',
            paymentStatus: '',
            paymentMethod: '',
            startDate: '',
            endDate: '',
            cinemaId: undefined,
            movieId: undefined
        });
        setFilters({});
        setPage(1);
    };

    // Handle filter value changes
    const handleFilterChange = (field: keyof BookingFilters, value: string | number | undefined) => {
        setFilterValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // View booking details
    const handleViewBooking = (id: number) => {
        navigate(`/admin/bookings/${id}`);
    };

    // Update booking status
    const handleUpdateStatus = (id: number) => {
        navigate(`/admin/bookings/${id}/edit`);
    };

    // Delete booking
    const handleDeleteBooking = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đơn đặt vé này không?')) {
            try {
                await BookingsService.deleteBooking(id);
                // Reload the list after deletion
                fetchBookings();
            } catch (err: any) {
                console.error('Error deleting booking:', err);
                alert(err.response?.data?.message || 'Lỗi khi xóa đơn đặt vé');
            }
        }
    };

    // Render status badge
    const renderStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { color: string; icon: React.ReactNode } } = {
            Pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} className="mr-1" /> },
            Confirmed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="mr-1" /> },
            Cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} className="mr-1" /> },
            Completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="mr-1" /> },
            Paid: { color: 'bg-green-100 text-green-800', icon: <DollarSign size={14} className="mr-1" /> },
            Failed: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} className="mr-1" /> }
        };

        const { color, icon } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: null };

        return (
            <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}>
                {icon}
                {status}
            </span>
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        // Điều chỉnh múi giờ bằng cách trừ đi 7 tiếng (7 * 60 * 60 * 1000 milliseconds)
        const adjustedDate = new Date(date.getTime() - 7 * 60 * 60 * 1000);

        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(adjustedDate);
    };

    return (
        <Layout title="Quản lý đặt vé">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đặt vé</h1>
                    <p className="text-gray-600">Xem và quản lý tất cả các đơn đặt vé trong hệ thống</p>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/admin/bookings/statistics')}
                        className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <BarChart2 size={16} className="mr-2" />
                        Thống kê đặt vé
                    </button>
                </div>
            </div>

            {/* Actions and filters */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Bộ lọc tìm kiếm</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Filter size={16} className="mr-2" />
                            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                        </button>
                        <button
                            onClick={fetchBookings}
                            className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Filter panel */}
                {showFilters && (
                    <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-2">
                                <label htmlFor="bookingStatus" className="block text-sm font-medium text-gray-700">
                                    Trạng thái đặt vé
                                </label>
                                <select
                                    id="bookingStatus"
                                    name="bookingStatus"
                                    value={filterValues.bookingStatus || ''}
                                    onChange={(e) => handleFilterChange('bookingStatus', e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Pending">Đang chờ</option>
                                    <option value="Confirmed">Đã xác nhận</option>
                                    <option value="Cancelled">Đã hủy</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                                    Trạng thái thanh toán
                                </label>
                                <select
                                    id="paymentStatus"
                                    name="paymentStatus"
                                    value={filterValues.paymentStatus || ''}
                                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Pending">Chưa thanh toán</option>
                                    <option value="Completed">Đã thanh toán</option>
                                    <option value="Paid">Đã thanh toán</option>
                                    <option value="Failed">Thất bại</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                                    Phương thức thanh toán
                                </label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={filterValues.paymentMethod || ''}
                                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="creditcard">Thẻ tín dụng</option>
                                    <option value="banking">Chuyển khoản</option>
                                    <option value="cash">Tiền mặt</option>
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                    Từ ngày
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={filterValues.startDate || ''}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                    Đến ngày
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={filterValues.endDate || ''}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Đặt lại
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bookings list */}
            <div className="bg-white shadow rounded-lg">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchBookings}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Thử lại
                        </button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500 mb-4">Không tìm thấy đơn đặt vé nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã đặt vé
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phim / Rạp
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian chiếu
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian đặt vé
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thanh toán
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                            #{booking.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.user ? (
                                                <div>
                                                    <div>{`${booking.user.firstName} ${booking.user.lastName}`}</div>
                                                    <div className="text-gray-500 text-xs">{booking.user.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.screening ? (
                                                <div>
                                                    <div className="flex items-center">
                                                        <Film size={14} className="mr-1 text-gray-400" />
                                                        <span>{booking.screening.movie?.title || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-500 text-xs mt-1">
                                                        <Home size={12} className="mr-1" />
                                                        <span>
                                                            {booking.screening.cinemaHall?.cinema?.name} / {booking.screening.cinemaHall?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.screening ? (
                                                <div className="flex items-center">
                                                    <Calendar size={14} className="mr-1 text-gray-400" />
                                                    <span>{formatDate(booking.screening.startTime)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Clock size={14} className="mr-1 text-gray-400" />
                                                <span>{formatDate(booking.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatusBadge(booking.bookingStatus)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                {renderStatusBadge(booking.paymentStatus)}
                                                {booking.paymentMethod && (
                                                    <div className="text-gray-500 text-xs mt-1">
                                                        {booking.paymentMethod}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(booking.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewBooking(booking.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Chỉnh sửa trạng thái"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
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
                {!loading && !error && bookings.length > 0 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}</span> đến{' '}
                                    <span className="font-medium">
                                        {Math.min(page * pageSize, totalItems)}
                                    </span>{' '}
                                    trong số <span className="font-medium">{totalItems}</span> đơn đặt vé
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(Math.max(page - 1, 1))}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = Math.min(
                                            Math.max(page - 2, 1) + i,
                                            totalPages
                                        );
                                        if (pageNum <= 0 || pageNum > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${page === pageNum
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(Math.min(page + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BookingsPage;
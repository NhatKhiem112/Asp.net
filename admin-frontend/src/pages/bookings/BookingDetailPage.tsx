import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import BookingsService, { Booking } from '../../services/bookings.service';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Film,
    Home,
    User,
    DollarSign,
    Clipboard,
    Edit,
    Trash2,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
} from 'react-feather';

const BookingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookingDetail = async () => {
            if (!id) {
                setError('Mã đặt vé không hợp lệ');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await BookingsService.getBooking(parseInt(id, 10));
                setBooking(data);
            } catch (err: any) {
                console.error('Error fetching booking details:', err);
                setError(err.message || 'Có lỗi xảy ra khi tải thông tin đặt vé');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetail();
    }, [id]);

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Render status badge
    const renderStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { color: string; icon: React.ReactNode } } = {
            Pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} className="mr-1" /> },
            Confirmed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="mr-1" /> },
            Cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} className="mr-1" /> },
            Completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="mr-1" /> },
            Paid: { color: 'bg-green-100 text-green-800', icon: <DollarSign size={14} className="mr-1" /> },
            Failed: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} className="mr-1" /> },
        };

        const { color, icon } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: null };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                {icon}
                {status}
            </span>
        );
    };

    // Delete booking
    const handleDeleteBooking = async () => {
        if (!booking || !id) return;

        if (window.confirm('Bạn có chắc chắn muốn xóa đơn đặt vé này không?')) {
            try {
                await BookingsService.deleteBooking(parseInt(id, 10));
                navigate('/admin/bookings');
            } catch (err: any) {
                console.error('Error deleting booking:', err);
                alert(err.response?.data?.message || 'Lỗi khi xóa đơn đặt vé');
            }
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Chi tiết đặt vé">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !booking) {
        return (
            <AdminLayout title="Chi tiết đặt vé">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error || 'Không thể tải thông tin đặt vé'}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/bookings')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại danh sách
                </button>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Chi tiết đặt vé #${booking.id}`}>
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/bookings')}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Quay lại danh sách đặt vé
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Chi tiết đơn đặt vé #{booking.id}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Đặt lúc: {formatDate(booking.createdAt)}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate(`/admin/bookings/${booking.id}/edit`)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Cập nhật trạng thái
                        </button>
                        <button
                            onClick={handleDeleteBooking}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        {/* Booking Status */}
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Clipboard className="h-4 w-4 mr-2" />
                                Trạng thái đặt vé
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {renderStatusBadge(booking.bookingStatus)}
                            </dd>
                        </div>

                        {/* Payment Information */}
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Thông tin thanh toán
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <div className="flex items-center mb-2">
                                    <span className="mr-2">Trạng thái:</span>
                                    {renderStatusBadge(booking.paymentStatus)}
                                </div>
                                {booking.paymentMethod && (
                                    <div className="mb-2">
                                        <span className="font-medium">Phương thức:</span> {booking.paymentMethod}
                                    </div>
                                )}
                                {booking.paymentReference && (
                                    <div className="mb-2">
                                        <span className="font-medium">Mã tham chiếu:</span> {booking.paymentReference}
                                    </div>
                                )}
                                {booking.transactionId && (
                                    <div className="mb-2">
                                        <span className="font-medium">Mã giao dịch:</span> {booking.transactionId}
                                    </div>
                                )}
                                {booking.paidAt && (
                                    <div className="mb-2">
                                        <span className="font-medium">Thời gian thanh toán:</span> {formatDate(booking.paidAt)}
                                    </div>
                                )}
                                <div className="mt-2">
                                    <span className="font-medium">Tổng tiền:</span> {formatCurrency(booking.totalAmount)}
                                </div>
                            </dd>
                        </div>

                        {/* User Information */}
                        {booking.user && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Thông tin khách hàng
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <div className="mb-2">
                                        <span className="font-medium">Tên:</span> {booking.user.firstName} {booking.user.lastName}
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                                        <span className="ml-1">{booking.user.email}</span>
                                    </div>
                                </dd>
                            </div>
                        )}

                        {/* Screening Information */}
                        {booking.screening && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Film className="h-4 w-4 mr-2" />
                                    Thông tin suất chiếu
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {booking.screening.movie && (
                                        <div className="mb-2">
                                            <span className="font-medium">Phim:</span> {booking.screening.movie.title}
                                        </div>
                                    )}
                                    <div className="flex items-center mb-2">
                                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                        <span className="ml-1">
                                            <span className="font-medium">Thời gian chiếu:</span> {formatDate(booking.screening.startTime)}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                        <span className="ml-1">
                                            <span className="font-medium">Thời gian kết thúc:</span> {formatDate(booking.screening.endTime)}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Home className="h-4 w-4 mr-1 text-gray-400" />
                                        <span className="ml-1">
                                            <span className="font-medium">Rạp/Phòng:</span>{' '}
                                            {booking.screening.cinemaHall?.cinema?.name} / {booking.screening.cinemaHall?.name}
                                        </span>
                                    </div>
                                </dd>
                            </div>
                        )}

                        {/* Seats Information */}
                        {booking.bookingSeats && booking.bookingSeats.length > 0 && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Ghế đã đặt</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <div className="flex flex-wrap">
                                        {booking.bookingSeats.map((bookingSeat) => (
                                            <span
                                                key={bookingSeat.id}
                                                className="px-2 py-1 m-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-md"
                                            >
                                                {bookingSeat.seat?.row}{bookingSeat.seat?.number}
                                                {bookingSeat.seat?.seatType && (
                                                    <span className="ml-1 text-gray-500">({bookingSeat.seat.seatType})</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-gray-500">
                                        Tổng số ghế: {booking.bookingSeats.length}
                                    </p>
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BookingDetailPage; 
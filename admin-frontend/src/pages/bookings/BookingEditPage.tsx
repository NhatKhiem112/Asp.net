import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BookingsService, { Booking, UpdateBookingStatusDTO } from '../../services/bookings.service';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Film,
    Home,
    User,
    DollarSign,
    CheckCircle,
    XCircle,
    Save,
} from 'react-feather';

const BookingEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<UpdateBookingStatusDTO>({
        bookingStatus: '',
        paymentStatus: '',
        paymentMethod: '',
        paymentReference: '',
        transactionId: '',
    });

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

                // Initialize form with booking data
                setFormData({
                    bookingStatus: data.bookingStatus,
                    paymentStatus: data.paymentStatus,
                    paymentMethod: data.paymentMethod || '',
                    paymentReference: data.paymentReference || '',
                    transactionId: data.transactionId || '',
                });
            } catch (err: any) {
                console.error('Error fetching booking details:', err);
                setError(err.message || 'Có lỗi xảy ra khi tải thông tin đặt vé');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetail();
    }, [id]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);

            await BookingsService.updateBookingStatus(parseInt(id, 10), formData);
            setSuccess('Cập nhật trạng thái đặt vé thành công!');

            // Navigate back to booking details after 1.5 seconds
            setTimeout(() => {
                navigate(`/admin/bookings/${id}`);
            }, 1500);
        } catch (err: any) {
            console.error('Error updating booking status:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái đặt vé');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Cập nhật trạng thái đặt vé">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    if (error && !booking) {
        return (
            <Layout title="Cập nhật trạng thái đặt vé">
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
            </Layout>
        );
    }

    return (
        <Layout title={`Cập nhật trạng thái đặt vé #${id}`}>
            <div className="mb-4">
                <button
                    onClick={() => navigate(`/admin/bookings/${id}`)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Quay lại chi tiết đặt vé
                </button>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Cập nhật trạng thái đơn đặt vé #{id}
                    </h3>
                    {booking && (
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Đặt lúc: {formatDate(booking.createdAt)}
                        </p>
                    )}
                </div>

                {/* Error and success messages */}
                {error && (
                    <div className="mx-6 my-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <div className="flex">
                            <XCircle className="h-5 w-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mx-6 my-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span>{success}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Booking Summary */}
                    {booking && booking.screening && (
                        <div className="bg-gray-50 p-4 rounded-md mb-6">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Thông tin đặt vé</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start">
                                    <Film className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {booking.screening.movie?.title || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {booking.screening.cinemaHall?.cinema?.name} / {booking.screening.cinemaHall?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDate(booking.screening.startTime)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Số ghế: {booking.bookingSeats?.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking Status */}
                    <div>
                        <label htmlFor="bookingStatus" className="block text-sm font-medium text-gray-700">
                            Trạng thái đặt vé
                        </label>
                        <select
                            id="bookingStatus"
                            name="bookingStatus"
                            value={formData.bookingStatus}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="Pending">Đang chờ</option>
                            <option value="Confirmed">Đã xác nhận</option>
                            <option value="Cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                            Trạng thái thanh toán
                        </label>
                        <select
                            id="paymentStatus"
                            name="paymentStatus"
                            value={formData.paymentStatus}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="Pending">Chưa thanh toán</option>
                            <option value="Completed">Đã thanh toán</option>
                            <option value="Paid">Đã thanh toán</option>
                            <option value="Failed">Thất bại</option>
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                            Phương thức thanh toán
                        </label>
                        <select
                            id="paymentMethod"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">Chọn phương thức</option>
                            <option value="creditcard">Thẻ tín dụng</option>
                            <option value="visa">Thẻ Visa</option>
                            <option value="mastercard">Thẻ Mastercard</option>
                            <option value="banking">Chuyển khoản</option>
                            <option value="banktransfer">Chuyển khoản</option>
                            <option value="cash">Tiền mặt</option>
                            <option value="atcounter">Tại quầy</option>
                        </select>
                    </div>

                    {/* Payment Reference */}
                    <div>
                        <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700">
                            Mã tham chiếu thanh toán
                        </label>
                        <input
                            type="text"
                            id="paymentReference"
                            name="paymentReference"
                            value={formData.paymentReference || ''}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Mã tham chiếu từ cổng thanh toán hoặc xác nhận từ ngân hàng
                        </p>
                    </div>

                    {/* Transaction ID */}
                    <div>
                        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                            Mã giao dịch
                        </label>
                        <input
                            type="text"
                            id="transactionId"
                            name="transactionId"
                            value={formData.transactionId || ''}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Mã giao dịch nội bộ hoặc từ bên thứ ba
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/bookings/${id}`)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang cập nhật...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default BookingEditPage; 
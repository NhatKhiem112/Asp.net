import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import BookingService from '../services/booking.service';
import { formatVietnamDate } from '../utils/formatters';

// Sử dụng interface từ BookingService
interface BookingSeat {
    id: number;
    bookingId: number;
    seatId: number;
    seat?: {
        row: string;
        seatNumber: number;
        seatType: string;
    };
}

interface Booking {
    id: number;
    screeningId: number;
    userId: number;
    createdAt: string;
    bookingStatus: string;
    paymentStatus: string;
    paymentMethod?: string;
    totalAmount: number;
    screening?: {
        id: number;
        startTime: string;
        endTime: string;
        movie?: {
            title: string;
            posterUrl: string;
        };
        cinemaHall?: {
            name: string;
            cinema?: {
                name: string;
                address: string;
            };
        };
    };
    bookingSeats?: BookingSeat[];
}

const BookingHistoryPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (!AuthService.isLoggedIn()) {
            navigate('/login');
            return;
        }

        const loadBookings = async () => {
            setIsLoading(true);
            try {
                const data = await BookingService.getAllUserBookings();
                // Sắp xếp theo ngày mới nhất
                const sortedBookings = data
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                // Đảm bảo kiểu dữ liệu
                setBookings(sortedBookings as unknown as Booking[]);
            } catch (error) {
                console.error('Error loading bookings:', error);
                setError('Không thể tải lịch sử đặt vé. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        loadBookings();
    }, [navigate]);

    // Hiển thị ghế ngồi dạng A1, A2, v.v.
    const formatSeats = (booking: Booking) => {
        if (!booking.bookingSeats || booking.bookingSeats.length === 0) return 'N/A';

        // Carefully map the seat data to avoid undefined values
        const seatsList: string[] = [];

        if (booking.bookingSeats && Array.isArray(booking.bookingSeats)) {
            // Try different property paths based on what we might receive from the API
            for (const bs of booking.bookingSeats) {
                // Case 1: Standard structure from the interface
                if (bs.seat && bs.seat.row && bs.seat.seatNumber !== undefined) {
                    seatsList.push(`${bs.seat.row}${bs.seat.seatNumber}`);
                    continue;
                }

                // Case 2: Direct properties on bookingSeat - use type assertion for non-standard properties
                if ((bs as any).row && (bs as any).number !== undefined) {
                    seatsList.push(`${(bs as any).row}${(bs as any).number}`);
                    continue;
                }

                // Case 3: Different naming convention for seat number
                if (bs.seat && bs.seat.row && (bs.seat as any).number !== undefined) {
                    seatsList.push(`${bs.seat.row}${(bs.seat as any).number}`);
                    continue;
                }

                console.warn("Could not extract seat information from", bs);
            }
        }

        // If we couldn't extract seats, return N/A
        if (seatsList.length === 0) {
            return 'N/A';
        }

        // Sort seats (e.g., A1, A2, B1, B2)
        return seatsList.sort((a, b) => {
            const rowA = a.charAt(0);
            const rowB = b.charAt(0);

            if (rowA !== rowB) {
                return rowA.localeCompare(rowB);
            }

            const numA = parseInt(a.substring(1));
            const numB = parseInt(b.substring(1));
            return numA - numB;
        }).join(', ');
    };

    // Hiển thị trạng thái đặt vé
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'text-green-500 bg-green-500/20';
            case 'pending':
                return 'text-yellow-500 bg-yellow-500/20';
            case 'cancelled':
                return 'text-red-500 bg-red-500/20';
            default:
                return 'text-gray-400 bg-gray-400/20';
        }
    };

    // Lọc các booking theo trạng thái
    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.bookingStatus.toLowerCase() === filter;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!AuthService.isLoggedIn()) {
        return (
            <div className="min-h-screen bg-dark text-white py-10 px-4">
                <div className="max-w-4xl mx-auto bg-secondary rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold mb-6 text-center">User Not Authenticated</h1>
                    <p className="text-gray-300 text-center mb-6">
                        You need to be logged in to view your booking history. Please login to continue.
                    </p>
                    <div className="flex justify-center">
                        <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-secondary rounded-lg shadow-lg p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Lịch sử mua vé</h1>
                        
                        {/* Filters */}
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                Tất cả
                            </button>
                            <button 
                                onClick={() => setFilter('confirmed')}
                                className={`px-4 py-2 rounded-lg text-sm ${filter === 'confirmed' 
                                    ? 'bg-green-500/30 text-green-400 border border-green-500/50' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                Đã xác nhận
                            </button>
                            <button 
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-lg text-sm ${filter === 'pending' 
                                    ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                Đang chờ
                            </button>
                            <button 
                                onClick={() => setFilter('cancelled')}
                                className={`px-4 py-2 rounded-lg text-sm ${filter === 'cancelled' 
                                    ? 'bg-red-500/30 text-red-400 border border-red-500/50' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                Đã hủy
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    {filteredBookings.length > 0 ? (
                        <div className="space-y-6">
                            {filteredBookings.map((booking) => (
                                <div key={booking.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                                    <Link to={`/bookings/${booking.id}`} className="block">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {/* Movie poster if available */}
                                            {booking.screening?.movie?.posterUrl && (
                                                <div className="w-20 h-30 flex-shrink-0">
                                                    <img
                                                        src={booking.screening.movie.posterUrl}
                                                        alt={booking.screening.movie.title}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium text-white">
                                                        {booking.screening?.movie?.title || 'Unknown Movie'}
                                                    </h4>
                                                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                                                        {booking.bookingStatus}
                                                    </span>
                                                </div>

                                                <div className="mt-3 text-sm text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-gray-400">Rạp:</span>{' '}
                                                        {booking.screening?.cinemaHall?.cinema?.name || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Phòng:</span>{' '}
                                                        {booking.screening?.cinemaHall?.name || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Ngày & giờ:</span>{' '}
                                                        {booking.screening?.startTime ? formatVietnamDate(booking.screening.startTime) : 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Ghế:</span>{' '}
                                                        {formatSeats(booking)}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex justify-between items-center">
                                                    <span className="font-medium text-primary">
                                                        {booking.totalAmount.toLocaleString()}đ
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(booking.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border border-gray-700 rounded-lg bg-gray-800/30">
                            <svg className="h-16 w-16 mx-auto mb-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <p className="text-gray-400 mb-4">
                                {filter === 'all' 
                                    ? 'Bạn chưa có lịch sử đặt vé nào.' 
                                    : `Không tìm thấy vé nào có trạng thái "${filter === 'confirmed' ? 'đã xác nhận' : filter === 'pending' ? 'đang chờ' : 'đã hủy'}".`}
                            </p>
                            <div className="flex flex-col md:flex-row gap-3 justify-center">
                                {filter !== 'all' && (
                                    <button 
                                        onClick={() => setFilter('all')}
                                        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                                    >
                                        Xem tất cả các vé
                                    </button>
                                )}
                                <Link 
                                    to="/movies" 
                                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                                >
                                    Đặt vé xem phim
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingHistoryPage; 
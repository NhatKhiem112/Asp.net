import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import BookingService from '../services/booking.service';
import { formatVietnamDate } from '../utils/formatters';

interface ProfileFormData {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    username: string;
}

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

const ProfilePage: React.FC = () => {
    const [formData, setFormData] = useState<ProfileFormData>({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        username: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true);
            try {
                // Nếu người dùng đã đăng nhập, thử lấy dữ liệu từ API
                if (AuthService.isLoggedIn()) {
                    // Lấy dữ liệu người dùng từ server
                    const userData = await AuthService.fetchCurrentUser();

                    if (userData) {
                        setFormData({
                            email: userData.email || '',
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            phoneNumber: userData.phoneNumber || '',
                            username: userData.username || userData.email || ''
                        });
                    } else {
                        // Fallback: dùng dữ liệu từ localStorage nếu API thất bại
                        const localUserData = AuthService.getCurrentUser();
                        if (localUserData) {
                            setFormData({
                                email: localUserData.email || '',
                                firstName: localUserData.firstName || '',
                                lastName: localUserData.lastName || '',
                                phoneNumber: localUserData.phoneNumber || '',
                                username: localUserData.username || localUserData.email || ''
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                setError('Failed to load user data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
        loadRecentBookings();
    }, []);

    const loadRecentBookings = async () => {
        if (!AuthService.isLoggedIn()) return;

        setIsLoadingBookings(true);
        try {
            const bookings = await BookingService.getAllUserBookings();
            // Sắp xếp theo ngày mới nhất và chỉ lấy 3 booking gần đây nhất
            const sortedBookings = bookings
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 3);

            // Đảm bảo kiểu dữ liệu
            setRecentBookings(sortedBookings as unknown as Booking[]);
        } catch (error) {
            console.error('Error loading recent bookings:', error);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            // Call API to update user profile using AuthService
            await AuthService.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                username: formData.username || formData.email // Use email as username if not provided
            });

            // Fetch updated user data to ensure we have the latest data
            await AuthService.fetchCurrentUser();

            setSuccess('Profile updated successfully!');

            // Clear success message after a delay
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

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
        switch (status) {
            case 'Confirmed':
                return 'text-green-500';
            case 'Pending':
                return 'text-yellow-500';
            case 'Cancelled':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    };

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
                    <h1 className="text-2xl font-bold mb-6 text-center">User Profile Not Found</h1>
                    <p className="text-gray-300 text-center mb-6">
                        You need to be logged in to view your profile. Please login to continue.
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
            <div className="max-w-4xl mx-auto bg-secondary rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Your Profile
                </h1>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-900/50 border border-green-500 text-white px-4 py-3 rounded-md mb-4">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - User avatar */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-5xl text-white mb-4">
                            {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : formData.email.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-semibold text-primary text-center">
                            {formData.firstName && formData.lastName
                                ? `${formData.firstName} ${formData.lastName}`
                                : 'User'}
                        </h2>
                        <p className="text-gray-300 mt-1 text-center">{formData.email}</p>

                        {formData.phoneNumber && (
                            <div className="mt-4 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{formData.phoneNumber}</span>
                            </div>
                        )}

                        <div className="mt-6 w-full space-y-3">
                            <Link
                                to="/profile/change-password"
                                className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-md transition w-full"
                            >
                                <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Change Password
                            </Link>

                            <Link
                                to="/profile/delete-account"
                                className="flex items-center justify-center bg-red-900/30 hover:bg-red-900/50 px-4 py-3 rounded-md transition w-full"
                            >
                                <svg className="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Account
                            </Link>
                        </div>
                    </div>

                    {/* Right column - Edit form */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-primary">Edit Profile Information</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Your first name"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Your last name"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Your email address"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Your phone number"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {isSaving ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Recent bookings section */}
                <div className="border-t border-gray-700 pt-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Recent Bookings</h3>
                        <Link to="/tickets" className="text-primary hover:text-red-400">View All</Link>
                    </div>

                    {isLoadingBookings ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : recentBookings.length > 0 ? (
                        <div className="space-y-4">
                            {recentBookings.map((booking) => (
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
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.bookingStatus)} bg-opacity-20`}>
                                                        {booking.bookingStatus}
                                                    </span>
                                                </div>

                                                <div className="mt-2 text-sm text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-gray-400">Cinema:</span>{' '}
                                                        {booking.screening?.cinemaHall?.cinema?.name || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Hall:</span>{' '}
                                                        {booking.screening?.cinemaHall?.name || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Date & Time:</span>{' '}
                                                        {booking.screening?.startTime ? formatVietnamDate(booking.screening.startTime) : 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Seats:</span>{' '}
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
                        <div className="text-center py-8 text-gray-400">
                            <svg className="h-12 w-12 mx-auto mb-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <p>You don't have any recent bookings</p>
                            <Link to="/movies" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
                                Browse Movies
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingService, { PaymentRequest } from '../services/booking.service';
import { formatDate } from '../utils/formatters';

interface BookingDetails {
    id: number;
    screeningId: number;
    createdAt: string;
    totalAmount: number;
    bookingStatus: string;
    paymentStatus: string;
    paymentMethod?: string;
    screening: {
        movieTitle: string;
        cinemaName: string;
        hallName: string;
        startTime: string;
        endTime: string;
        price: number;
    };
    seats: string[];
}

const BookingPaymentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('creditcard');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');

    // Helper function to ensure dates are properly formatted
    const formatVietnamDate = (dateString: string) => {
        if (!dateString) return 'N/A';

        try {
            // The backend already converts to Vietnam timezone (UTC+7)
            // So we just need to format it correctly
            const date = new Date(dateString);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.error("Invalid date:", dateString);
                return 'Invalid date';
            }

            return formatDate(date, 'dd/MM/yyyy HH:mm');
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString; // Return original string if formatting fails
        }
    };

    // Helper function to sort seats (e.g., A1, A2, B1, B2)
    const sortSeats = (seats: string[]) => {
        if (!seats || seats.length === 0 || seats.some(s => s === 'undefined' || !s)) {
            return ['No seats selected'];
        }

        return [...seats].sort((a, b) => {
            const rowA = a.charAt(0);
            const rowB = b.charAt(0);

            if (rowA !== rowB) {
                return rowA.localeCompare(rowB);
            }

            const numA = parseInt(a.substring(1));
            const numB = parseInt(b.substring(1));
            return numA - numB;
        });
    };

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!id) {
                setError('Invalid booking ID');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await BookingService.getBookingById(parseInt(id, 10));
                console.log("Raw booking data:", data); // Debug: log raw data from API

                // Debug booking seats data
                if (data.bookingSeats) {
                    console.log("Booking seats data:", JSON.stringify(data.bookingSeats, null, 2));
                }

                // Carefully map the seat data to avoid undefined values
                const seatsList: string[] = [];

                if (data.bookingSeats && Array.isArray(data.bookingSeats)) {
                    // Inspect the first seat to understand structure
                    if (data.bookingSeats.length > 0) {
                        const sampleSeat = data.bookingSeats[0];
                        console.log("Sample seat structure:", JSON.stringify(sampleSeat, null, 2));
                    }

                    // Try different property paths based on what we might receive from the API
                    for (const bs of data.bookingSeats) {
                        console.log("Processing seat:", bs);

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
                } else {
                    console.warn("No booking seats data available or invalid format");
                }

                console.log("Final mapped seats:", seatsList);

                // If we couldn't extract seats, set a default message
                if (seatsList.length === 0) {
                    seatsList.push("Seat data unavailable");
                }

                // Formatting the data for the component
                const formattedBooking: BookingDetails = {
                    id: data.id,
                    screeningId: data.screeningId,
                    createdAt: data.createdAt,
                    totalAmount: data.totalAmount,
                    bookingStatus: data.bookingStatus,
                    paymentStatus: data.paymentStatus,
                    paymentMethod: data.paymentMethod,
                    screening: {
                        movieTitle: data.screening?.movie?.title || 'Unknown Movie',
                        cinemaName: data.screening?.cinemaHall?.cinema?.name || 'Unknown Cinema',
                        hallName: data.screening?.cinemaHall?.name || 'Unknown Hall',
                        startTime: data.screening?.startTime || '',
                        endTime: data.screening?.endTime || '',
                        price: data.screening?.price || 0
                    },
                    seats: seatsList
                };

                console.log("Formatted booking data:", formattedBooking); // Debug: log formatted data
                setBooking(formattedBooking);

                // If booking is already paid, redirect to success page
                if (data.paymentStatus === 'Completed' || data.paymentStatus === 'Paid') {
                    navigate(`/bookings/${id}/success`);
                }
            } catch (err: any) {
                console.error('Error fetching booking details:', err);
                setError(err.response?.data || 'Failed to load booking details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id, navigate]);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!booking) return;

        try {
            setIsProcessing(true);

            const paymentData: PaymentRequest = {
                bookingId: booking.id,
                paymentMethod: paymentMethod,
                paymentReference: paymentReference.trim() || undefined
            };

            await BookingService.processPayment(paymentData);

            // Redirect to success page
            navigate(`/bookings/${booking.id}/success`);
        } catch (err: any) {
            console.error('Error processing payment:', err);
            setError(err.response?.data || 'Failed to process payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-dark text-white py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-900/30 border border-red-500 text-white px-6 py-4 rounded-md mb-8">
                        <h2 className="text-xl font-bold mb-2">Error</h2>
                        <p>{error || 'Failed to load booking details'}</p>
                        <div className="mt-4 flex space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="mr-4 text-gray-400 hover:text-white"
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-bold">Payment</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Booking Details */}
                    <div className="md:col-span-1">
                        <div className="bg-secondary rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary">Booking Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-gray-400 text-sm">Movie</h3>
                                    <p className="font-medium">{booking.screening.movieTitle}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm">Cinema</h3>
                                    <p className="font-medium">{booking.screening.cinemaName}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm">Hall</h3>
                                    <p className="font-medium">{booking.screening.hallName}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm">Date & Time</h3>
                                    <p className="font-medium">
                                        {booking.screening.startTime
                                            ? formatVietnamDate(new Date(new Date(booking.screening.startTime).getTime() - (7 * 60 * 60 * 1000)).toISOString())
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm">Seats</h3>
                                    <p className="font-medium">{sortSeats(booking.seats).join(', ')}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm">Booking Time</h3>
                                    <p className="font-medium">
                                    {booking.createdAt
                                            ? formatVietnamDate(new Date(new Date(booking.createdAt).getTime() - (7 * 60 * 60 * 1000)).toISOString())
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm">Total Amount</h3>
                                    <p className="font-medium text-lg text-primary">
                                        {booking.totalAmount.toLocaleString()}đ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="md:col-span-2">
                        <div className="bg-secondary rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6 text-primary">Payment Method</h2>

                            <form onSubmit={handlePaymentSubmit}>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">
                                            Select Payment Method
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div
                                                className={`border rounded-md p-4 cursor-pointer transition ${paymentMethod === 'creditcard'
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-gray-700 hover:border-gray-500'
                                                    }`}
                                                onClick={() => setPaymentMethod('creditcard')}
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="creditcard"
                                                        checked={paymentMethod === 'creditcard'}
                                                        onChange={() => setPaymentMethod('creditcard')}
                                                        className="mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-medium">Credit Card</div>
                                                        <div className="text-xs text-gray-400">Visa, Mastercard, JCB</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`border rounded-md p-4 cursor-pointer transition ${paymentMethod === 'banking'
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-gray-700 hover:border-gray-500'
                                                    }`}
                                                onClick={() => setPaymentMethod('banking')}
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="banking"
                                                        checked={paymentMethod === 'banking'}
                                                        onChange={() => setPaymentMethod('banking')}
                                                        className="mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-medium">Bank Transfer</div>
                                                        <div className="text-xs text-gray-400">Internet Banking</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`border rounded-md p-4 cursor-pointer transition ${paymentMethod === 'momo'
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-gray-700 hover:border-gray-500'
                                                    }`}
                                                onClick={() => setPaymentMethod('momo')}
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="momo"
                                                        checked={paymentMethod === 'momo'}
                                                        onChange={() => setPaymentMethod('momo')}
                                                        className="mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-medium">MoMo</div>
                                                        <div className="text-xs text-gray-400">E-Wallet</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`border rounded-md p-4 cursor-pointer transition ${paymentMethod === 'cash'
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-gray-700 hover:border-gray-500'
                                                    }`}
                                                onClick={() => setPaymentMethod('cash')}
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="cash"
                                                        checked={paymentMethod === 'cash'}
                                                        onChange={() => setPaymentMethod('cash')}
                                                        className="mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-medium">Pay at Counter</div>
                                                        <div className="text-xs text-gray-400">Cash payment at cinema</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Reference (optional) */}
                                    <div>
                                        <label htmlFor="paymentReference" className="block mb-2 text-sm font-medium">
                                            Transaction Reference (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="paymentReference"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Transaction number or reference"
                                        />
                                        <p className="mt-1 text-sm text-gray-400">
                                            {paymentMethod === 'cash' ? 'Optional note for counter staff' : 'Enter transaction ID if you have one'}
                                        </p>
                                    </div>

                                    {/* Payment Notes */}
                                    <div className="mt-6 bg-gray-800/50 p-4 rounded-md border border-gray-700">
                                        <p className="text-sm text-gray-300">
                                            <span className="font-semibold text-primary">Note:</span> This is a demo application. No actual payment will be processed. In a real application, you would be redirected to a secure payment gateway.
                                        </p>
                                    </div>

                                    {/* Error message if any */}
                                    {error && (
                                        <div className="bg-red-900/30 border border-red-500 text-white px-4 py-3 rounded-md">
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <div className="flex justify-end gap-4 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => navigate(-1)}
                                            className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className={`px-6 py-3 rounded-md font-medium transition ${isProcessing
                                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-red-700'
                                                }`}
                                        >
                                            {isProcessing ? 'Processing...' : 'Complete Payment'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPaymentPage; 
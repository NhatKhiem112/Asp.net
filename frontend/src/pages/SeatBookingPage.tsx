import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScreeningService, { ScreeningSeat, RowSeats, ScreeningSeatsResponse } from '../services/screening.service';
import BookingService, { CreateBookingRequest } from '../services/booking.service';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';

const SeatBookingPage: React.FC = () => {
    const { id: screeningId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [screeningData, setScreeningData] = useState<ScreeningSeatsResponse | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<ScreeningSeat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchScreeningData = async () => {
            if (!screeningId) {
                setError('Invalid screening ID');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await ScreeningService.getScreeningSeats(parseInt(screeningId, 10));
                setScreeningData(data);
            } catch (err: any) {
                console.error('Error fetching screening data:', err);
                setError(err.response?.data || 'Failed to load screening data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchScreeningData();
    }, [screeningId]);

    const handleSeatClick = (seat: ScreeningSeat) => {
        if (seat.isBooked) return; // Cannot select already booked seats

        const isSeatSelected = selectedSeats.some(s => s.id === seat.id);

        if (isSeatSelected) {
            // Remove seat from selection
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            // Check for constraints
            const rowSeats = seatsByRow.find(rowData => rowData.row === seat.row)?.seats || [];

            // Rule: Prevent leaving one empty seat between selected seats
            const selectedSeatIds = selectedSeats.map(s => s.id);
            const allSeats = [...selectedSeatIds, seat.id].sort((a, b) => a - b);
            const hasGap = allSeats.some((id, index) => {
                const nextId = allSeats[index + 1];
                return nextId && nextId - id === 2; // Check for a gap of 1 seat
            });

            if (hasGap) {
                alert('Cannot select this seat due to seating constraints (one empty seat between selected seats).');
                return;
            }

            // Add seat to selection (max 8 seats)
            if (selectedSeats.length < 8) {
                setSelectedSeats([...selectedSeats, seat]);
            } else {
                alert('Bạn chỉ có thể chọn tối đa 8 ghế cho một lần đặt');
            }
        }
    };

    const getSeatClass = (seat: ScreeningSeat) => {
        if (seat.isBooked) {
            return 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-70';
        }

        const isSelected = selectedSeats.some(s => s.id === seat.id);

        if (isSelected) {
            return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white cursor-pointer hover:from-emerald-500 hover:to-emerald-700 shadow-lg transform scale-105';
        }

        // Different colors based on seat type
        switch (seat.seatType) {
            case 'VIP':
                return 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white cursor-pointer hover:from-purple-600 hover:to-indigo-700 shadow-md';
            case 'Couple':
                return 'bg-gradient-to-br from-pink-500 to-rose-600 text-white cursor-pointer hover:from-pink-600 hover:to-rose-700 shadow-md';
            default:
                return 'bg-gradient-to-br from-gray-600 to-gray-800 text-white cursor-pointer hover:from-gray-700 hover:to-gray-900 shadow-md';
        }
    };

    const handleBookingSubmit = async () => {
        if (!isAuthenticated) {
            // Redirect to login page with a redirect back to this page
            navigate(`/login?redirect=/screenings/${screeningId}/seats`);
            return;
        }

        if (selectedSeats.length === 0) {
            alert('Vui lòng chọn ít nhất một ghế');
            return;
        }

        try {
            setIsSubmitting(true);

            const bookingData: CreateBookingRequest = {
                screeningId: parseInt(screeningId!, 10),
                seatIds: selectedSeats.map(seat => seat.id)
            };

            const response = await BookingService.createBooking(bookingData);

            // Redirect to payment page or booking confirmation
            navigate(`/bookings/${response.id}/payment`);
        } catch (err: any) {
            console.error('Error creating booking:', err);
            setError(err.response?.data || 'Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateTotalPrice = () => {
        if (!screeningData) return 0;
        return selectedSeats.length * screeningData.screening.price;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    if (error || !screeningData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-900/30 backdrop-blur-md border border-red-500 text-white px-8 py-6 rounded-xl mb-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Error</h2>
                        <p className="text-lg">{error || 'Failed to load screening data'}</p>
                        <div className="mt-6 flex space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-300 shadow-md"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { screening, seatsByRow } = screeningData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-10 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-10">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/60 backdrop-blur-sm text-white hover:bg-primary transition duration-300"
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{screening.movieTitle}</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Movie Poster */}
                        <div className="md:col-span-1">
                            <div className="rounded-2xl overflow-hidden h-96 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                                {screening.moviePoster ? (
                                    <img
                                        src={screening.moviePoster}
                                        alt={screening.movieTitle}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                        <svg className="h-28 w-28 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Screening Details */}
                        <div className="md:col-span-2">
                            <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700/50">
                                <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">Screening Details</h2>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
                                        <span className="text-gray-400 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            Cinema
                                        </span>
                                        <span className="font-medium text-white">{screening.cinemaName}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
                                        <span className="text-gray-400 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                            </svg>
                                            Hall
                                        </span>
                                        <span className="font-medium text-white">{screening.hallName}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
                                        <span className="text-gray-400 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Date & Time
                                        </span>
                                        <span className="font-medium text-white">
                                            {formatDate(new Date(screening.startTime), 'dd/MM/yyyy HH:mm')}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
                                        <span className="text-gray-400 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Price per Seat
                                        </span>
                                        <span className="font-medium text-white">{screening.price.toLocaleString()}đ</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Available Seats
                                        </span>
                                        <span className="font-medium text-white">
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                                                {screeningData.availableSeats}/{screeningData.totalSeats}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seat Selection Area */}
                <div className="mb-8">
                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">Select Your Seats</h2>

                        {/* Screen */}
                        <div className="w-full h-10 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg mb-12 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                            <span className="text-gray-300 font-medium tracking-widest">SCREEN</span>
                        </div>

                        {/* Seat Legend */}
                        <div className="flex flex-wrap justify-center gap-6 mb-10">
                            <div className="flex items-center">
                                <div className="w-8 h-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-md mr-2 shadow-sm"></div>
                                <span className="text-sm text-gray-300">Standard</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-md mr-2 shadow-sm"></div>
                                <span className="text-sm text-gray-300">VIP</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-md mr-2 shadow-sm"></div>
                                <span className="text-sm text-gray-300">Couple</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-md mr-2 shadow-sm"></div>
                                <span className="text-sm text-gray-300">Selected</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-6 bg-gray-500 rounded-md mr-2 shadow-sm opacity-70"></div>
                                <span className="text-sm text-gray-300">Booked</span>
                            </div>
                        </div>

                        {/* Seats Layout */}
                        <div className="overflow-x-auto mb-8">
                            <div className="min-w-full flex justify-center">
                                <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-800">
                                    {seatsByRow.map((rowData: RowSeats) => (
                                        <div key={rowData.row} className="flex mb-3 items-center">
                                            <div className="w-8 h-8 flex items-center justify-center text-gray-400 mr-3 bg-gray-800/50 rounded-full">
                                                {rowData.row}
                                            </div>
                                            <div className="flex gap-3">
                                                {rowData.seats.map((seat: ScreeningSeat) => (
                                                    <button
                                                        key={seat.id}
                                                        onClick={() => handleSeatClick(seat)}
                                                        disabled={seat.isBooked}
                                                        className={`w-12 h-9 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-300 ${getSeatClass(seat)}`}
                                                        title={`${seat.row}${seat.number} - ${seat.seatType}`}
                                                    >
                                                        {`${seat.row}${seat.number}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="mb-10">
                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">Booking Summary</h2>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                                <span className="text-gray-300 flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Selected Seats
                                </span>
                                <span className="font-medium text-white">
                                    {selectedSeats.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSeats
                                                .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
                                                .map(seat => (
                                                    <span key={seat.id} className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-sm">
                                                        {seat.row}{seat.number}
                                                    </span>
                                                ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">None</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-bold text-white flex items-center">
                                    <svg className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Total Price
                                </span>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">
                                    {calculateTotalPrice().toLocaleString()}đ
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-5 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-lg flex items-center"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                    <button
                        onClick={handleBookingSubmit}
                        disabled={selectedSeats.length === 0 || isSubmitting}
                        className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg flex items-center ${
                            selectedSeats.length === 0 || isSubmitting
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary to-rose-600 text-white hover:from-primary hover:to-rose-700 transform hover:-translate-y-1'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Continue to Payment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatBookingPage; 
import api from './api';

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
        movieId: number;
        startTime: string;
        endTime: string;
        price: number;
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
    bookingSeats?: Array<{
        id: number;
        bookingId: number;
        seatId: number;
        seat?: {
            row: string;
            seatNumber: number;
            seatType: string;
        };
    }>;
}

export interface CreateBookingRequest {
    screeningId: number;
    seatIds: number[];
}

export interface PaymentRequest {
    bookingId: number;
    paymentMethod: string;
    paymentReference?: string;
}

const BookingService = {
    getAllUserBookings: async (): Promise<Booking[]> => {
        const response = await api.get('/Bookings');
        return response.data;
    },

    getBookingById: async (id: number): Promise<Booking> => {
        const response = await api.get(`/Bookings/${id}`);
        return response.data;
    },

    createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
        const response = await api.post('/Bookings', data);
        return response.data;
    },

    processPayment: async (data: PaymentRequest): Promise<any> => {
        const response = await api.post('/Bookings/payment', data);
        return response.data;
    },

    cancelBooking: async (id: number): Promise<void> => {
        await api.put(`/Bookings/${id}/cancel`);
    }
};

export default BookingService; 
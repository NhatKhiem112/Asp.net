import api from './api';

export interface Booking {
    id: number;
    userId: number;
    screeningId: number;
    bookingStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentReference?: string;
    transactionId?: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
    screening?: {
        startTime: string;
        endTime: string;
        movie?: {
            title: string;
            id: number;
        };
        cinemaHall?: {
            name: string;
            id: number;
            cinema?: {
                name: string;
                id: number;
            };
        };
    };
    bookingSeats?: Array<{
        id: number;
        bookingId: number;
        seatId: number;
        seat?: {
            row: string;
            number: number;
            seatType?: string;
        };
    }>;
}

export interface UpdateBookingStatusDTO {
    bookingStatus?: string;
    paymentStatus?: string;
    paymentReference?: string;
    paymentMethod?: string;
    transactionId?: string;
}

export interface BookingStatistics {
    totalBookings: number;
    bookingStatus: {
        pending: number;
        confirmed: number;
        cancelled: number;
    };
    paymentStatus: {
        pending: number;
        completed: number;
        failed: number;
    };
    paymentMethods: {
        creditcard: number;
        banking: number;
        cash: number;
        other: number;
    };
    bookingsByTime: {
        today: number;
        thisWeek: number;
        thisMonth: number;
    };
    totalRevenue: number;
    revenueByTime: {
        today: number;
        thisWeek: number;
        thisMonth: number;
    };
    totalTickets: number;
    topMovies: Array<{
        id: number;
        title: string;
        bookingCount: number;
    }>;
}

export interface BookingFilters {
    userId?: number;
    screeningId?: number;
    movieId?: number;
    cinemaId?: number;
    bookingStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
}

const BookingsService = {
    getBookings: async (
        page = 1,
        pageSize = 10,
        filters: BookingFilters = {}
    ) => {
        let queryString = `page=${page}&pageSize=${pageSize}`;

        // Add filters if provided
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryString += `&${key}=${encodeURIComponent(String(value))}`;
            }
        });

        const response = await api.get(`/admin/bookings?${queryString}`);
        return {
            bookings: response.data,
            total: parseInt(response.headers['x-total-count'] || '0'),
            page: parseInt(response.headers['x-page'] || '1'),
            pageSize: parseInt(response.headers['x-page-size'] || '10'),
            totalPages: parseInt(response.headers['x-total-pages'] || '1'),
        };
    },

    getBooking: async (id: number) => {
        const response = await api.get(`/admin/bookings/${id}`);
        return response.data;
    },

    updateBookingStatus: async (id: number, statusUpdate: UpdateBookingStatusDTO) => {
        const response = await api.put(`/admin/bookings/${id}/status`, statusUpdate);
        return response.data;
    },

    deleteBooking: async (id: number) => {
        const response = await api.delete(`/admin/bookings/${id}`);
        return response.data;
    },

    getBookingStatistics: async () => {
        const response = await api.get('/admin/bookings/statistics');
        return response.data as BookingStatistics;
    },

    // Lấy doanh thu theo khoảng thời gian
    getRevenueByDateRange: async (startDate: string, endDate: string) => {
        const response = await api.get(`/admin/bookings/revenue?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    },
};

export default BookingsService; 
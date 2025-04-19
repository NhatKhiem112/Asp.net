import api from './api';

export interface ScreeningResponse {
    id: number;
    startTime: string;
    endTime: string;
    price: number;

    // Movie info
    movieId: number;
    movieTitle: string;
    posterUrl: string;
    durationMinutes: number;

    // Cinema info
    cinemaHallId: number;
    cinemaHallName: string;
    hallType: string;
    cinemaId: number;
    cinemaName: string;

    // Booking info
    bookedSeatsCount: number;
    availableSeats: number | null;

    // Audit info
    createdAt: string;
}

export interface AdminScreeningDTO {
    movieId: number;
    cinemaHallId: number;
    startTime: Date;
    price: number;
}

export interface ScreeningUpdateDTO {
    movieId?: number;
    cinemaHallId?: number;
    startTime?: Date;
    price?: number;
}

export interface BulkScreeningDTO {
    movieId: number;
    cinemaHallId: number;
    startDate: Date;
    endDate: Date;
    daysOfWeek: number[]; // 0-6 where 0 is Sunday
    showTimes: Date[]; // Array of times of day
    price: number;
}

export interface ScreeningStatistics {
    totalScreenings: number;
    pastScreenings: number;
    upcomingScreenings: number;
    bookedScreenings: number;
    soldTicketsCount: number;
    totalRevenue: number;
    bookingsToday: number;
}

export interface ScreeningFilters {
    movieId?: number;
    cinemaId?: number;
    cinemaHallId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
}

const ScreeningsService = {
    getScreenings: async (filters: ScreeningFilters = {}) => {
        const { movieId, cinemaId, cinemaHallId, startDate, endDate, page = 1, pageSize = 10 } = filters;

        let url = `/admin/screenings?page=${page}&pageSize=${pageSize}`;

        if (movieId) url += `&movieId=${movieId}`;
        if (cinemaId) url += `&cinemaId=${cinemaId}`;
        if (cinemaHallId) url += `&cinemaHallId=${cinemaHallId}`;
        if (startDate) url += `&startDate=${startDate.toISOString()}`;
        if (endDate) url += `&endDate=${endDate.toISOString()}`;

        const response = await api.get(url);

        return {
            screenings: response.data,
            total: parseInt(response.headers['x-total-count'] || '0'),
            page: parseInt(response.headers['x-page'] || '1'),
            pageSize: parseInt(response.headers['x-page-size'] || '10'),
            totalPages: parseInt(response.headers['x-total-pages'] || '1'),
        };
    },

    getScreening: async (id: number) => {
        const response = await api.get(`/admin/screenings/${id}`);
        return response.data;
    },

    createScreening: async (screeningData: AdminScreeningDTO) => {
        const response = await api.post('/admin/screenings', screeningData);
        return response.data;
    },

    updateScreening: async (id: number, screeningData: ScreeningUpdateDTO) => {
        const response = await api.put(`/admin/screenings/${id}`, screeningData);
        return response.data;
    },

    deleteScreening: async (id: number) => {
        const response = await api.delete(`/admin/screenings/${id}`);
        return response.data;
    },

    bulkCreateScreenings: async (bulkData: BulkScreeningDTO) => {
        const response = await api.post('/admin/screenings/bulk-create', bulkData);
        return response.data;
    },

    getScreeningStatistics: async () => {
        const response = await api.get('/admin/screenings/statistics');
        return response.data as ScreeningStatistics;
    }
};

export default ScreeningsService; 
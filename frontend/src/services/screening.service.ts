import api from './api';

export interface Screening {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    status: string;
    movieId: number;
    movieTitle: string;
    posterUrl: string;
    durationMinutes: number;
    cinemaHallId: number;
    cinemaHallName: string;
    hallType: string;
    cinemaId: number;
    cinemaName: string;
    bookedSeatsCount?: number;
    availableSeats?: number;
    createdAt: string;
}

export interface ScreeningSeat {
    id: number;
    row: string;
    number: number;
    seatType: string;
    cinemaHallId: number;
    isBooked: boolean;
}

export interface RowSeats {
    row: string;
    seats: ScreeningSeat[];
}

export interface ScreeningSeatsResponse {
    screening: {
        id: number;
        movieTitle: string;
        moviePoster: string;
        cinemaName: string;
        hallName: string;
        startTime: string;
        endTime: string;
        price: number;
        status: string;
    };
    seatsByRow: RowSeats[];
    totalSeats: number;
    availableSeats: number;
    bookedSeats: number;
}

const ScreeningService = {
    getScreeningById: async (id: number): Promise<Screening> => {
        const response = await api.get(`/Screenings/${id}`);
        return response.data;
    },

    getScreeningSeats: async (id: number): Promise<ScreeningSeatsResponse> => {
        const response = await api.get(`/Screenings/${id}/Seats`);
        return response.data;
    },

    getScreeningsByMovie: async (movieId: number): Promise<Screening[]> => {
        const response = await api.get(`/Screenings/Movie/${movieId}`);
        return response.data;
    },

    getScreeningsByCinema: async (cinemaId: number): Promise<Screening[]> => {
        const response = await api.get(`/Screenings/Cinema/${cinemaId}`);
        return response.data;
    }
};

export default ScreeningService; 
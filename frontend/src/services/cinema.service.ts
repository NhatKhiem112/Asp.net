import api from './api';

export interface Cinema {
    id: number;
    name: string;
    address: string;
    city?: string;
    phoneNumber: string;
    description: string;
    hallsCount: number;
    totalSeats?: number;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CinemaDetail extends Cinema {
    halls: CinemaHall[];
}

export interface CinemaHall {
    id: number;
    name: string;
    seatsCount: number;
    cinemaId: number;
    seats?: Seat[];
}

export interface Seat {
    id: number;
    row: string;
    seatNumber: number;
    hallId: number;
}

const CinemaService = {
    getAllCinemas: async (): Promise<Cinema[]> => {
        try {
            const response = await api.get('/Cinemas');
            return response.data;
        } catch (error) {
            console.error('Error fetching cinemas:', error);
            return [];
        }
    },

    getCinemaById: async (id: number): Promise<CinemaDetail | null> => {
        try {
            const response = await api.get(`/Cinemas/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching cinema with id ${id}:`, error);
            return null;
        }
    },

    getScreeningsByCinema: async (cinemaId: number) => {
        const response = await api.get(`/Screenings/Cinema/${cinemaId}`);
        return response.data;
    }
};

export default CinemaService; 
import api from './api';

export interface Movie {
    id: number;
    title: string;
    description: string;
    durationMinutes: number; // Changed from duration to durationMinutes to match API
    director?: string;
    actors?: string;
    genres?: string;
    genre?: string; // Support both formats
    releaseDate: string;
    endDate: string;
    language?: string;
    country?: string;
    posterUrl: string;
    backdropUrl?: string;
    trailerUrl?: string;
    rating: number;
    createdAt?: string;
    updatedAt?: string;
}

const MovieService = {
    getAllMovies: async (): Promise<Movie[]> => {
        try {
            const response = await api.get('/Movies');
            return response.data;
        } catch (error) {
            console.error('Error fetching movies:', error);
            return [];
        }
    },

    getMovieById: async (id: number): Promise<Movie | null> => {
        try {
            const response = await api.get(`/Movies/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching movie with id ${id}:`, error);
            return null;
        }
    },

    getNowShowingMovies: async (): Promise<Movie[]> => {
        try {
            const response = await api.get('/Movies/now-showing');
            return response.data;
        } catch (error) {
            console.error('Error fetching now showing movies:', error);
            return [];
        }
    },

    getComingSoonMovies: async (): Promise<Movie[]> => {
        try {
            const response = await api.get('/Movies/coming-soon');
            return response.data;
        } catch (error) {
            console.error('Error fetching coming soon movies:', error);
            return [];
        }
    },

    getPopularMovies: async (): Promise<Movie[]> => {
        try {
            const response = await api.get('/Movies/popular');
            return response.data;
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return [];
        }
    },

    getScreeningsByMovie: async (movieId: number) => {
        const response = await api.get(`/Screenings/Movie/${movieId}`);
        return response.data;
    }
};

export default MovieService; 
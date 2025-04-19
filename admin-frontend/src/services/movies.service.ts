import api from './api';

export interface Movie {
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    genre: string;
    releaseDate: string;
    endDate?: string;
    posterUrl: string;
    backdropUrl: string;
    trailerUrl: string;
    rating: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMovieData {
    title: string;
    description: string;
    durationMinutes: number;
    genre: string;
    releaseDate: string;
    endDate?: string;
    posterUrl?: string;
    backdropUrl?: string;
    trailerUrl?: string;
    rating?: number;
}

export interface UpdateMovieData {
    title?: string;
    description?: string;
    durationMinutes?: number;
    genre?: string;
    releaseDate?: string;
    endDate?: string;
    posterUrl?: string;
    backdropUrl?: string;
    trailerUrl?: string;
    rating?: number;
}

export interface MovieStatistics {
    totalMovies: number;
    upcomingMovies: number;
    mostScreenedMovie: {
        id: number;
        title: string;
        screeningCount: number;
    } | null;
    mostBookedMovie: {
        id: number;
        title: string;
        bookingCount: number;
    } | null;
    genreStats: {
        genre: string;
        count: number;
    }[];
}

const MoviesService = {
    getMovies: async (search = '', page = 1, pageSize = 10) => {
        const response = await api.get(`/admin/movies?search=${search}&page=${page}&pageSize=${pageSize}`);
        return {
            movies: response.data,
            total: parseInt(response.headers['x-total-count'] || '0'),
            page: parseInt(response.headers['x-page'] || '1'),
            pageSize: parseInt(response.headers['x-page-size'] || '10'),
            totalPages: parseInt(response.headers['x-total-pages'] || '1'),
        };
    },

    getMovie: async (id: number) => {
        const response = await api.get(`/admin/movies/${id}`);
        return response.data;
    },

    createMovie: async (movieData: CreateMovieData) => {
        const response = await api.post('/admin/movies', movieData);
        return response.data;
    },

    updateMovie: async (id: number, movieData: UpdateMovieData) => {
        const response = await api.put(`/admin/movies/${id}`, movieData);
        return response.data;
    },

    deleteMovie: async (id: number) => {
        const response = await api.delete(`/admin/movies/${id}`);
        return response.data;
    },

    uploadPoster: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/admin/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    getStatistics: async (): Promise<MovieStatistics> => {
        const response = await api.get('/admin/movies/statistics');
        return response.data;
    },
};

export default MoviesService; 
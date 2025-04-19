import api from './api';

export interface Cinema {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    description: string;
    imageUrl: string;
    hallCount: number;
    seatCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CinemaDetail extends Cinema {
    halls: CinemaHall[];
}

export interface CinemaHall {
    id: number;
    name: string;
    hallType: string;
    capacity: number;
    cinemaId: number;
    seatsCount: number;
    screeningsCount: number;
    description?: string;
    rowCount?: number;
    seatsPerRow?: number;
    seatLayout?: any;
}

export interface CinemaCreateDTO {
    name: string;
    address: string;
    phoneNumber: string;
    description: string;
    imageUrl?: string;
}

export interface CinemaUpdateDTO {
    name?: string;
    address?: string;
    phoneNumber?: string;
    description?: string;
    imageUrl?: string;
}

export interface CinemaHallCreateDTO {
    name: string;
    description?: string;
    hallType?: string;
    rowCount: number;
    seatsPerRow: number;
    cinemaId: number;
}

export interface CinemaHallUpdateDTO {
    name?: string;
    description?: string;
    hallType?: string;
    rowCount?: number;
    seatsPerRow?: number;
    capacity?: number;
    regenerateSeats?: boolean;
}

export interface CinemaStatistics {
    totalCinemas: number;
    totalCinemaHalls: number;
    totalSeats: number;
    avgHallsPerCinema: number;
    avgSeatsPerHall: number;
    mostActiveVenue: {
        id: number;
        name: string;
        screeningCount: number;
    } | null;
    mostBookedVenue: {
        id: number;
        name: string;
        bookingCount: number;
    } | null;
}

const CinemasService = {
    // Get all cinemas with pagination and search
    getCinemas: async (search = '', page = 1, pageSize = 10) => {
        console.log(`Fetching cinemas with search=${search}, page=${page}, pageSize=${pageSize}`);
        const response = await api.get(`/admin/cinemas?search=${search}&page=${page}&pageSize=${pageSize}`);

        // Log the raw response to see what we're getting
        console.log('Raw cinema API response:', response.data);

        // Process the cinema data to ensure consistent property names
        const processedCinemas = response.data.map((cinema: any) => {
            // Ensure seat count information is properly captured from any possible property
            const seatCountValue = cinema.seatCount !== undefined ? cinema.seatCount :
                (cinema.seatsCount !== undefined ? cinema.seatsCount :
                    (cinema.capacity !== undefined ? cinema.capacity :
                        (cinema.Capacity !== undefined ? cinema.Capacity :
                            (cinema.totalSeats !== undefined ? cinema.totalSeats : 0))));

            return {
                ...cinema,
                seatCount: seatCountValue
            };
        });

        console.log('Processed cinema data:', processedCinemas);

        return {
            cinemas: processedCinemas,
            total: parseInt(response.headers['x-total-count'] || '0'),
            page: parseInt(response.headers['x-page'] || '1'),
            pageSize: parseInt(response.headers['x-page-size'] || '10'),
            totalPages: parseInt(response.headers['x-total-pages'] || '1'),
        };
    },

    // Get cinema by ID with detailed information
    getCinema: async (id: number) => {
        const response = await api.get(`/admin/cinemas/${id}`);
        return response.data;
    },

    // Create a new cinema
    createCinema: async (cinemaData: CinemaCreateDTO) => {
        const response = await api.post('/admin/cinemas', cinemaData);
        return response.data;
    },

    // Update an existing cinema
    updateCinema: async (id: number, cinemaData: CinemaUpdateDTO) => {
        const response = await api.put(`/admin/cinemas/${id}`, cinemaData);
        return response.data;
    },

    // Delete a cinema
    deleteCinema: async (id: number) => {
        const response = await api.delete(`/admin/cinemas/${id}`);
        return response.data;
    },

    // Get cinema statistics
    getStatistics: async (): Promise<CinemaStatistics> => {
        const response = await api.get('/admin/cinemas/statistics');
        return response.data;
    },

    // Get cinema halls for a specific cinema
    getCinemaHalls: async (cinemaId: number, search = '', hallType = '', sortBy = 'name', sortOrder = 'asc', page = 1, pageSize = 10) => {
        console.log(`Fetching halls for cinema ${cinemaId}`);
        try {
            const response = await api.get(
                `/admin/cinemas/${cinemaId}/halls?search=${search}&hallType=${hallType}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&pageSize=${pageSize}`
            );
            console.log('Halls API response:', response);
            return {
                halls: response.data,
                total: parseInt(response.headers['x-total-count'] || '0'),
                page: parseInt(response.headers['x-page'] || '1'),
                pageSize: parseInt(response.headers['x-page-size'] || '10'),
                totalPages: parseInt(response.headers['x-total-pages'] || '1'),
            };
        } catch (error) {
            console.error('Error fetching cinema halls:', error);

            // Try an alternative endpoint if the first one fails
            try {
                console.log('Trying alternative endpoint for halls...');
                const altResponse = await api.get(`/admin/cinemahalls?cinemaId=${cinemaId}`);
                console.log('Alternative halls API response:', altResponse);
                return {
                    halls: altResponse.data,
                    total: parseInt(altResponse.headers['x-total-count'] || '0'),
                    page: 1,
                    pageSize: altResponse.data.length,
                    totalPages: 1,
                };
            } catch (altError) {
                console.error('Alternative endpoint also failed:', altError);
                throw error; // Throw the original error
            }
        }
    },

    // Upload an image for a cinema
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/admin/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    // Get cinema hall by ID
    getCinemaHall: async (cinemaId: number, hallId: number) => {
        const response = await api.get(`/admin/cinemas/${cinemaId}/halls/${hallId}`);
        return response.data;
    },

    // Create a new cinema hall
    createCinemaHall: async (cinemaId: number, hallData: CinemaHallCreateDTO) => {
        console.log(`Attempting to create cinema hall for cinema ID ${cinemaId} with data:`, hallData);
        try {
            const response = await api.post(`/admin/cinemas/${cinemaId}/halls`, hallData);
            console.log('Cinema hall creation successful with response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error in createCinemaHall:', error);
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);

            // Check if endpoint might be wrong
            if (error.response?.status === 404) {
                console.warn('Endpoint /admin/cinemas/${cinemaId}/halls might not exist, trying alternative endpoint');
                try {
                    // Try direct endpoint
                    const altResponse = await api.post('/admin/cinemahalls', {
                        ...hallData,
                        cinemaId: cinemaId,
                        capacity: hallData.rowCount * hallData.seatsPerRow,
                    });
                    console.log('Alternative endpoint success:', altResponse.data);
                    return altResponse.data;
                } catch (altError: any) {
                    console.error('Alternative endpoint also failed:', altError);
                    console.error('Alt response data:', altError.response?.data);
                    throw error; // Throw original error
                }
            }
            throw error;
        }
    },

    // Update an existing cinema hall
    updateCinemaHall: async (cinemaId: number, hallId: number, hallData: CinemaHallUpdateDTO) => {
        console.log(`[CinemasService] Updating hall ${hallId} in cinema ${cinemaId} with data:`, hallData);
        try {
            // Check for 404 issues
            try {
                // Try the nested route first
                const response = await api.put(`/admin/cinemahalls/${hallId}`, {
                    ...hallData,
                    cinemaId: cinemaId // Make sure to include cinemaId
                });

                console.log(`[CinemasService] Direct endpoint response status:`, response.status);
                console.log(`[CinemasService] Direct endpoint response data:`, response.data);

                if (response.status === 200 || response.status === 204) {
                    return response.data || { success: true, message: "Update successful" };
                } else {
                    throw new Error(`Unexpected status: ${response.status}`);
                }
            } catch (directError) {
                console.error('[CinemasService] Direct route failed:', directError);

                // Fall back to nested route
                const nestedResponse = await api.put(`/admin/cinemas/${cinemaId}/halls/${hallId}`, hallData);
                console.log(`[CinemasService] Nested route response status:`, nestedResponse.status);
                console.log(`[CinemasService] Nested route response data:`, nestedResponse.data);

                if (nestedResponse.status === 200 || nestedResponse.status === 204) {
                    return nestedResponse.data || { success: true, message: "Update successful" };
                } else {
                    throw new Error(`Unexpected status: ${nestedResponse.status}`);
                }
            }
        } catch (error) {
            console.error(`[CinemasService] All update attempts failed:`, error);
            throw error;
        }
    },

    // Delete a cinema hall
    deleteCinemaHall: async (cinemaId: number, hallId: number) => {
        const response = await api.delete(`/admin/cinemas/${cinemaId}/halls/${hallId}`);
        return response.data;
    },

    // Get cinema halls directly from CinemaHallsController
    getCinemaHallsDirect: async (cinemaId: number) => {
        console.log(`Directly fetching halls for cinema ${cinemaId} from CinemaHallsController`);
        const response = await api.get(`/admin/cinemahalls?cinemaId=${cinemaId}&page=1&pageSize=100`);
        console.log('Direct halls API response:', response);
        return {
            halls: response.data,
            total: parseInt(response.headers['x-total-count'] || '0'),
            page: 1,
            pageSize: response.data.length,
            totalPages: 1,
        };
    },
};

export default CinemasService; 
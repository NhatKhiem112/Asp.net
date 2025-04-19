import api from './api';

export interface CinemaHall {
    id: number;
    name: string;
    cinemaId: number;
    capacity: number;
    hallType: string;
    status: string;
    description?: string;
    rowCount?: number;
    seatsPerRow?: number;
    seatLayout?: string;
    createdAt: string;
    updatedAt: string;
    cinema?: {
        name: string;
    };
}

export interface CreateCinemaHallData {
    name: string;
    cinemaId: number;
    capacity: number;
    hallType: string;
    status?: string;
}

export interface UpdateCinemaHallData {
    name?: string;
    cinemaId?: number;
    capacity?: number;
    hallType?: string;
    status?: string;
    rowCount?: number;
    seatsPerRow?: number;
    regenerateSeats?: boolean;
}

const CinemaHallsService = {
    getHalls: async (search = '', page = 1, pageSize = 10) => {
        const response = await api.get(`/admin/cinemahalls?search=${search}&page=${page}&pageSize=${pageSize}`);
        return {
            halls: response.data,
            total: parseInt(response.headers['x-total-count'] || '0'),
            page: parseInt(response.headers['x-page'] || '1'),
            pageSize: parseInt(response.headers['x-page-size'] || '10'),
            totalPages: parseInt(response.headers['x-total-pages'] || '1'),
        };
    },

    getHall: async (id: number) => {
        const response = await api.get(`/admin/cinemahalls/${id}`);
        return response.data;
    },

    createHall: async (hallData: CreateCinemaHallData) => {
        const response = await api.post('/admin/cinemahalls', hallData);
        return response.data;
    },

    updateHall: async (id: number, hallData: UpdateCinemaHallData) => {
        console.log(`[CinemaHallsService] Updating hall ${id} with data:`, hallData);
        try {
            // Check if we're using the right URL format
            console.log(`[CinemaHallsService] Sending PUT request to: /admin/cinemahalls/${id}`);

            // Make sure we're passing regenerateSeats correctly
            const dataToSend = {
                ...hallData,
                regenerateSeats: true // Ensure this field is included and correctly cased
            };

            console.log(`[CinemaHallsService] Sending data:`, dataToSend);
            const response = await api.put(`/admin/cinemahalls/${id}`, dataToSend);

            console.log(`[CinemaHallsService] Update response status:`, response.status);
            console.log(`[CinemaHallsService] Update response data:`, response.data);

            if (response.status === 200 || response.status === 204) {
                return response.data || { success: true, message: "Update successful" };
            } else {
                console.error(`[CinemaHallsService] Unexpected status code:`, response.status);
                throw new Error(`Unexpected status: ${response.status}`);
            }
        } catch (error) {
            console.error(`[CinemaHallsService] Update failed:`, error);
            throw error;
        }
    },

    deleteHall: async (id: number) => {
        const response = await api.delete(`/admin/cinemahalls/${id}`);
        return response.data;
    },

    // Quản lý ghế trong phòng chiếu
    getSeats: async (hallId: number) => {
        const response = await api.get(`/admin/cinemahalls/${hallId}/seats`);
        return response.data;
    },

    // Tạo cấu trúc ghế ngồi theo hàng và cột
    createSeatLayout: async (hallId: number, rows: number, seatsPerRow: number) => {
        const response = await api.post(`/admin/cinemahalls/${hallId}/seats/generate`, {
            rows,
            seatsPerRow
        });
        return response.data;
    },

    // Xóa tất cả ghế của một phòng chiếu
    clearSeats: async (hallId: number) => {
        const response = await api.delete(`/admin/cinemahalls/${hallId}/seats`);
        return response.data;
    },
};

export default CinemaHallsService; 
import api from './api';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: string;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    role?: string;
}

const UsersService = {
    getUsers: async (search = '', page = 1, pageSize = 10) => {
        const response = await api.get(`/admin/users?search=${search}&page=${page}&pageSize=${pageSize}`);
        return {
            users: response.data,
            total: parseInt(response.headers['x-total-count'] || '0'),
            page: parseInt(response.headers['x-page'] || '1'),
            pageSize: parseInt(response.headers['x-page-size'] || '10'),
            totalPages: parseInt(response.headers['x-total-pages'] || '1'),
        };
    },

    getUser: async (id: number) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    createUser: async (userData: CreateUserData) => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },

    updateUser: async (id: number, userData: UpdateUserData) => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    getUserStatistics: async () => {
        const response = await api.get('/admin/users/statistics');
        return response.data;
    },
};

export default UsersService; 
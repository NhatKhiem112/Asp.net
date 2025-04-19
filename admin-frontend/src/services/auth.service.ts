import api from './api';

interface LoginData {
    email: string;
    password: string;
}

interface UserData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

const AuthService = {
    login: async (data: LoginData) => {
        const response = await api.post('/Auth/login', data);
        if (response.data && response.data.token) {
            localStorage.setItem('admin_token', response.data.token);

            // Lưu thông tin người dùng
            const userData = {
                id: response.data.userId,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                role: response.data.role,
            };

            // Chỉ cho phép admin đăng nhập
            if (userData.role !== 'Admin') {
                throw new Error('Only admin users can log in to this dashboard');
            }

            localStorage.setItem('admin_user', JSON.stringify(userData));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    },

    getCurrentUser: (): UserData | null => {
        const userStr = localStorage.getItem('admin_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role !== 'Admin') {
                    return null;
                }
                return user;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    },

    isLoggedIn: (): boolean => {
        const token = localStorage.getItem('admin_token');
        const user = AuthService.getCurrentUser();
        return !!token && !!user && user.role === 'Admin';
    },
};

export default AuthService; 
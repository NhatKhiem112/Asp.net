import api from './api';

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface UpdateProfileData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    username?: string;
}

interface UserData {
    userId?: number;
    id?: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
    username?: string;
}

const AuthService = {
    login: async (data: LoginData) => {
        const response = await api.post('/Auth/login', data);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);

            // Store user data from response
            const userData = {
                userId: response.data.userId,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                phoneNumber: response.data.phoneNumber || '',
                role: response.data.role,
                username: response.data.username || response.data.email || ''
            };

            localStorage.setItem('user', JSON.stringify(userData));
        }
        return response.data;
    },

    register: async (data: RegisterData) => {
        return api.post('/Auth/register', data);
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    fetchCurrentUser: async () => {
        try {
            // Fetch current user data from the server
            const response = await api.get('/Users/me');

            // Update the stored user data
            if (response.data) {
                const userData: UserData = {
                    userId: response.data.id,
                    id: response.data.id,
                    email: response.data.email,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    phoneNumber: response.data.phoneNumber || '',
                    role: response.data.role,
                    username: response.data.username || response.data.email || ''
                };

                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    },

    updateProfile: async (data: UpdateProfileData) => {
        // Ensure username is set (use email as fallback if not provided)
        if (!data.username) {
            data.username = data.email;
        }
const response = await api.put('/Users/profile', data);

        // Update stored user data
        if (response.data) {
            const currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    username: data.username
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }

        return response.data;
    },

    changePassword: async (data: ChangePasswordData) => {
        return api.put('/Auth/change-password', data);
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
                return null;
            }
        }
        return null;
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    }
};

export default AuthService;
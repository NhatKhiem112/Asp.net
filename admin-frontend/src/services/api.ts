import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5246/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: (status) => status < 500, // Không throw error cho status < 500
});

// Thêm interceptor để đưa token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log more details about server errors
        if (error.response && error.response.status >= 500) {
            console.error('Server error details:', {
                status: error.response.status,
                url: error.config.url,
                method: error.config.method,
                headers: error.config.headers,
                responseData: error.response.data
            });
        }

        // Xử lý lỗi 401 - Unauthorized (token hết hạn hoặc không hợp lệ)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api; 
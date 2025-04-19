import api from './api';

const DashboardService = {
    getSummary: async () => {
        try {
            const response = await api.get('/admin/dashboard/summary');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    },

    getActivity: async (count = 10) => {
        try {
            const response = await api.get(`/admin/dashboard/activity?count=${count}`);

            // Ensure we return an empty array if data is missing or malformed
            if (!response.data || !Array.isArray(response.data)) {
                console.warn('Activity data is not in expected format, returning empty array');
                return [];
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching activity data:', error);
            throw error;
        }
    },
};

export default DashboardService; 
import api from './api';
import AuthService from './auth.service';

export interface Review {
    id: number;
    movieId: number;
    userId: number;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt?: string;
    user: {
        id: number;
        name: string;
        avatarUrl?: string;
    };
}

const ReviewService = {
    // Lấy tất cả đánh giá của một bộ phim
    getReviewsByMovie: async (movieId: number): Promise<Review[]> => {
        try {
            // Trong môi trường thực tế, bạn sẽ gọi API thực sự
            // const response = await api.get(`/reviews/movie/${movieId}`);
            // return response.data;
            
            // Hiện tại sẽ sử dụng localStorage để lưu trữ tạm thời
            const storedReviews = localStorage.getItem('movie_reviews');
            const allReviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
            return allReviews.filter(review => review.movieId === movieId);
        } catch (error) {
            console.error(`Error fetching reviews for movie ${movieId}:`, error);
            return [];
        }
    },

    // Tạo đánh giá mới
    createReview: async (movieId: number, content: string, rating: number): Promise<Review | null> => {
        try {
            // Trong môi trường thực tế
            // const response = await api.post('/reviews', { movieId, content, rating });
            // return response.data;
            
            // Sử dụng localStorage
            const user = AuthService.getCurrentUser();
            if (!user) return null;
            
            // Tạo tên hiển thị dựa trên thông tin người dùng
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            
            // Xác định ảnh đại diện
            let avatarUrl = 'https://via.placeholder.com/150';
            
            // Nếu user có avatarUrl, sử dụng nó
            if (user.avatarUrl) {
                avatarUrl = user.avatarUrl;
            } else if (user.profileImage) {
                // Kiểm tra các thuộc tính phổ biến khác cho ảnh
                avatarUrl = user.profileImage;
            } else if (user.photoURL) {
                avatarUrl = user.photoURL;
            } else if (user.imageUrl) {
                avatarUrl = user.imageUrl;
            }
            
            const newReview: Review = {
                id: Date.now(), // Tạo ID giả
                movieId,
                userId: user.id,
                content,
                rating,
                createdAt: new Date().toISOString(),
                user: {
                    id: user.id,
                    name: fullName || user.email.split('@')[0], // Dùng tên đầy đủ hoặc phần đầu của email
                    avatarUrl: avatarUrl
                }
            };
            
            const storedReviews = localStorage.getItem('movie_reviews');
            const allReviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
            allReviews.push(newReview);
            localStorage.setItem('movie_reviews', JSON.stringify(allReviews));
            
            return newReview;
        } catch (error) {
            console.error('Error creating review:', error);
            return null;
        }
    },

    // Cập nhật đánh giá
    updateReview: async (reviewId: number, content: string, rating: number): Promise<Review | null> => {
        try {
            // Trong môi trường thực tế
            // const response = await api.put(`/reviews/${reviewId}`, { content, rating });
            // return response.data;
            
            // Sử dụng localStorage
            const storedReviews = localStorage.getItem('movie_reviews');
            if (!storedReviews) return null;
            
            const allReviews: Review[] = JSON.parse(storedReviews);
            const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
            
            if (reviewIndex === -1) return null;
            
            // Kiểm tra quyền cập nhật (người dùng hiện tại phải là tác giả)
            const user = AuthService.getCurrentUser();
            if (!user || allReviews[reviewIndex].userId !== user.id) return null;
            
            // Tạo tên hiển thị dựa trên thông tin người dùng
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            
            // Xác định ảnh đại diện
            let avatarUrl = 'https://via.placeholder.com/150';
            
            // Nếu user có avatarUrl, sử dụng nó
            if (user.avatarUrl) {
                avatarUrl = user.avatarUrl;
            } else if (user.profileImage) {
                // Kiểm tra các thuộc tính phổ biến khác cho ảnh
                avatarUrl = user.profileImage;
            } else if (user.photoURL) {
                avatarUrl = user.photoURL;
            } else if (user.imageUrl) {
                avatarUrl = user.imageUrl;
            }
            
            // Cập nhật đánh giá
            allReviews[reviewIndex] = {
                ...allReviews[reviewIndex],
                content,
                rating,
                updatedAt: new Date().toISOString(),
                user: {
                    ...allReviews[reviewIndex].user,
                    name: fullName || user.email.split('@')[0], // Cập nhật tên người dùng
                    avatarUrl: avatarUrl // Cập nhật ảnh đại diện
                }
            };
            
            localStorage.setItem('movie_reviews', JSON.stringify(allReviews));
            return allReviews[reviewIndex];
        } catch (error) {
            console.error(`Error updating review ${reviewId}:`, error);
            return null;
        }
    },

    // Xóa đánh giá
    deleteReview: async (reviewId: number): Promise<boolean> => {
        try {
            // Trong môi trường thực tế
            // await api.delete(`/reviews/${reviewId}`);
            // return true;
            
            // Sử dụng localStorage
            const storedReviews = localStorage.getItem('movie_reviews');
            if (!storedReviews) return false;
            
            const allReviews: Review[] = JSON.parse(storedReviews);
            const reviewToDelete = allReviews.find(r => r.id === reviewId);
            
            if (!reviewToDelete) return false;
            
            // Kiểm tra quyền xóa (người dùng hiện tại phải là tác giả)
            const user = AuthService.getCurrentUser();
            if (!user || reviewToDelete.userId !== user.id) return false;
            
            // Xóa đánh giá
            const updatedReviews = allReviews.filter(r => r.id !== reviewId);
            localStorage.setItem('movie_reviews', JSON.stringify(updatedReviews));
            
            return true;
        } catch (error) {
            console.error(`Error deleting review ${reviewId}:`, error);
            return false;
        }
    },

    // Kiểm tra xem người dùng hiện tại đã đánh giá phim chưa
    getUserReviewForMovie: async (movieId: number): Promise<Review | null> => {
        try {
            const user = AuthService.getCurrentUser();
            if (!user) return null;
            
            const storedReviews = localStorage.getItem('movie_reviews');
            if (!storedReviews) return null;
            
            const allReviews: Review[] = JSON.parse(storedReviews);
            return allReviews.find(r => r.movieId === movieId && r.userId === user.id) || null;
        } catch (error) {
            console.error('Error checking user review:', error);
            return null;
        }
    }
};

export default ReviewService; 
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Định dạng ngày theo mẫu cụ thể
 */
export const formatDate = (date: string | Date | number, pattern = 'dd/MM/yyyy'): string => {
    if (!date) return 'N/A';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
        return format(dateObj, pattern, { locale: vi });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Định dạng ngày giờ kiểu Việt Nam: dd/MM/yyyy HH:mm
 */
export const formatVietnamDate = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateString);
            return 'Invalid date';
        }

        return formatDate(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
};

/**
 * Rút gọn văn bản dài
 */
export const shortenText = (text: string, maxLength = 100): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Định dạng số thành tiền Việt Nam
 */
export const formatCurrency = (value: number): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Chuyển đổi phút thành định dạng HH:mm
 */
export const formatDuration = (minutes: number): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours > 0 ? `${hours}h` : ''}${mins > 0 ? ` ${mins}m` : ''}`.trim();
};

/**
 * Tạo tên viết tắt từ họ tên đầy đủ
 */
export const getInitials = (name: string): string => {
    if (!name) return '';

    const names = name.split(' ').filter(n => n.length > 0);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Chuyển đổi trạng thái sang màu sắc
 */
export const getStatusColor = (status: string): string => {
    const statusLower = status?.toLowerCase() || '';

    if (statusLower.includes('active') || statusLower.includes('confirmed') || statusLower.includes('completed') || statusLower.includes('paid')) {
        return 'text-green-500 bg-green-100';
    }

    if (statusLower.includes('pending') || statusLower.includes('processing')) {
        return 'text-yellow-500 bg-yellow-100';
    }

    if (statusLower.includes('cancelled') || statusLower.includes('failed') || statusLower.includes('inactive')) {
        return 'text-red-500 bg-red-100';
    }

    return 'text-gray-500 bg-gray-100';
}; 
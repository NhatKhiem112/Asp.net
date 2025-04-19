/**
 * Format a date according to the provided format
 * @param date The date to format
 * @param format The format to use (e.g. 'dd/MM/yyyy HH:mm')
 * @returns The formatted date string
 */
export function formatDate(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return format
        .replace('dd', day)
        .replace('MM', month)
        .replace('yyyy', year.toString())
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * Format a date to Vietnam format (dd/MM/yyyy HH:mm)
 * @param dateString The date string to format
 * @returns The formatted date string
 */
export function formatVietnamDate(dateString: string): string {
    try {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return formatDate(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

/**
 * Format currency in VND
 * @param amount The amount to format
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + 'đ';
}

/**
 * Shorten a string to a specified length and add ellipsis if needed
 * @param text The text to shorten
 * @param maxLength The maximum length of the string
 * @returns The shortened string
 */
export function shortenText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
} 
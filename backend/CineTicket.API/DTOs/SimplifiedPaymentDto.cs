using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class SimplifiedPaymentDto
    {
        [Required(ErrorMessage = "Booking ID is required")]
        public int BookingId { get; set; }

        [Required(ErrorMessage = "Payment method is required")]
        public string PaymentMethod { get; set; } = string.Empty;

        // Chỉ dùng cho thanh toán bằng thẻ (mô phỏng)
        public string? CardNumber { get; set; }
        public string? CardHolderName { get; set; }
        public string? ExpiryDate { get; set; }
        public string? CVV { get; set; }
    }
}
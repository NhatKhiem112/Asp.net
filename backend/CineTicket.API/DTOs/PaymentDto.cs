using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class PaymentDto
    {
        [Required(ErrorMessage = "Booking ID is required")]
        public int BookingId { get; set; }

        [Required(ErrorMessage = "Payment method is required")]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required(ErrorMessage = "Payment amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Payment amount must be greater than 0")]
        public decimal Amount { get; set; }

        // Optional field for storing payment reference/transaction ID from external payment service
        public string? TransactionReference { get; set; }
    }
}
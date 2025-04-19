using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.Models
{
    public class Booking : IAuditableEntity
    {
        [Key]
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public int? CreatedById { get; set; }

        public int? UpdatedById { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(50)]
        public string BookingStatus { get; set; } = "Pending"; // Pending, Confirmed, Cancelled

        [MaxLength(50)]
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Completed, Failed

        [MaxLength(100)]
        public string? PaymentReference { get; set; }

        [MaxLength(100)]
        public string? TransactionId { get; set; }

        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        public DateTime? PaidAt { get; set; }

        // Foreign Keys
        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        [ForeignKey("Screening")]
        public int ScreeningId { get; set; }
        public virtual Screening Screening { get; set; } = null!;

        // Navigation property for BookingSeat
        public virtual ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
    }
}
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.Models
{
    public class BookingSeat
    {
        [Key]
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("Booking")]
        public int BookingId { get; set; }
        public virtual Booking Booking { get; set; } = null!;

        [ForeignKey("Seat")]
        public int SeatId { get; set; }
        public virtual Seat Seat { get; set; } = null!;
    }
}
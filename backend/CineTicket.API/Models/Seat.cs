using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.Models
{
    public class Seat : AuditableEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Row { get; set; } = string.Empty;

        [Required]
        public int Number { get; set; }

        [MaxLength(50)]
        public string SeatType { get; set; } = string.Empty; // Standard, VIP, Handicap etc.

        [ForeignKey("CinemaHall")]
        public int CinemaHallId { get; set; }
        public virtual CinemaHall CinemaHall { get; set; } = null!;

        // Navigation property for BookingSeat
        public virtual ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
    }
}
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.Models
{
    public class CinemaHall : AuditableEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public int Capacity { get; set; }

        [MaxLength(100)]
        public string HallType { get; set; } = string.Empty; // Regular, IMAX, VIP, etc.

        [ForeignKey("Cinema")]
        public int CinemaId { get; set; }
        public virtual Cinema Cinema { get; set; } = null!;

        // Navigation properties
        public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();
        public virtual ICollection<Screening> Screenings { get; set; } = new List<Screening>();
    }
}
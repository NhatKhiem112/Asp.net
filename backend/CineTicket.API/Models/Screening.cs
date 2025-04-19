using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.Models
{
    public class Screening : AuditableEntity
    {
        [Key]
        public int Id { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        [Column(TypeName = "decimal(10,0)")]
        public decimal Price { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "upcoming";

        [ForeignKey("Movie")]
        public int MovieId { get; set; }
        public virtual Movie Movie { get; set; } = null!;

        [ForeignKey("CinemaHall")]
        public int CinemaHallId { get; set; }
        public virtual CinemaHall CinemaHall { get; set; } = null!;

        // Navigation properties
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
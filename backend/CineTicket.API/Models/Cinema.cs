using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.Models
{
    public class Cinema : AuditableEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ImageUrl { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<CinemaHall> CinemaHalls { get; set; } = new List<CinemaHall>();
    }
}
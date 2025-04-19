using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.Models
{
    public class Movie : AuditableEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(255)]
        public string PosterUrl { get; set; } = string.Empty;

        [MaxLength(255)]
        public string BackdropUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Genre { get; set; } = string.Empty;

        public DateTime ReleaseDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int DurationMinutes { get; set; }

        [Column(TypeName = "decimal(3,1)")]
        public decimal Rating { get; set; }

        public string? TrailerUrl { get; set; }

        // Navigation properties
        public virtual ICollection<Screening> Screenings { get; set; } = new List<Screening>();
    }
}
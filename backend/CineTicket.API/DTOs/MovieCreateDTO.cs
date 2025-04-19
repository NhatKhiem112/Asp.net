using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.DTOs
{
    public class MovieCreateDTO
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(255)]
        public string PosterUrl { get; set; } = string.Empty;

        [MaxLength(255)]
        public string BackdropUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Genre { get; set; } = string.Empty;

        [Required]
        public DateTime ReleaseDate { get; set; }

        [Required]
        [Range(1, 500, ErrorMessage = "Duration must be between 1 and 500 minutes")]
        public int DurationMinutes { get; set; }

        [Range(0, 10, ErrorMessage = "Rating must be between 0 and 10")]
        [Column(TypeName = "decimal(3,1)")]
        public decimal Rating { get; set; }

        [MaxLength(255)] 
        public string? TrailerUrl { get; set; } 
    }
}
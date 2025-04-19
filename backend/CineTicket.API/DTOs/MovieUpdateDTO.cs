using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.DTOs
{
    public class MovieUpdateDTO
    {
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? PosterUrl { get; set; }

        [MaxLength(255)]
        public string? BackdropUrl { get; set; }

        [MaxLength(50)]
        public string? Genre { get; set; }

        public DateTime? ReleaseDate { get; set; }

        public int? DurationMinutes { get; set; }

        [Column(TypeName = "decimal(3,1)")]
        public decimal? Rating { get; set; }

        [MaxLength(255)] 
        public string? TrailerUrl { get; set; } 
    }
}
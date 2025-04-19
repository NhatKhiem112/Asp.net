using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class CinemaUpdateDTO
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? ImageUrl { get; set; }
    }
}
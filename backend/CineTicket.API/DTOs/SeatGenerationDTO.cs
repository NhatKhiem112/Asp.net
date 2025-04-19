using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class SeatGenerationDTO
    {
        [Required]
        [Range(1, 100, ErrorMessage = "Number of rows must be between 1 and 100")]
        public int Rows { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Number of seats per row must be between 1 and 100")]
        public int SeatsPerRow { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class SeatCreateDTO
    {
        [Required]
        public string Row { get; set; } = string.Empty;

        [Required]
        public int Number { get; set; }

        [MaxLength(50)]
        public string SeatType { get; set; } = "Standard"; // Standard, VIP, Handicap etc.
    }
}
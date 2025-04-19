using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class CreateBookingDto
    {
        [Required(ErrorMessage = "Screening ID is required")]
        public int ScreeningId { get; set; }

        [Required(ErrorMessage = "At least one seat must be selected")]
        [MinLength(1, ErrorMessage = "At least one seat must be selected")]
        [MaxLength(8, ErrorMessage = "Maximum 8 seats allowed per booking")]
        public List<int> SeatIds { get; set; } = new List<int>();
    }
}
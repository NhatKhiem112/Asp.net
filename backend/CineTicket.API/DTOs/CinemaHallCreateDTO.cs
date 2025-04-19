using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class CinemaHallCreateDTO
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int Capacity { get; set; }

        [MaxLength(100)]
        public string HallType { get; set; } = string.Empty; // Regular, IMAX, VIP, etc.

        [Required]
        public int CinemaId { get; set; }

        // Thêm tùy chọn tự động tạo ghế khi tạo phòng
        public bool AutoGenerateSeats { get; set; } = true;
    }
}
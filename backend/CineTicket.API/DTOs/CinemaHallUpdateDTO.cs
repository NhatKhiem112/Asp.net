using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class CinemaHallUpdateDTO
    {
        [MaxLength(50)]
        public string? Name { get; set; }

        public int? Capacity { get; set; }

        [MaxLength(100)]
        public string? HallType { get; set; }

        // Cờ để xác định có tạo lại ghế hay không khi thay đổi capacity
        public bool RegenerateSeats { get; set; } = false;

        // Lưu ý: Chúng ta không cho phép thay đổi CinemaId vì điều này có thể gây ra vấn đề về tính toàn vẹn dữ liệu
    }
}
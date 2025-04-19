using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.DTOs
{
    public class SeatUpdateDTO
    {
        // Row có thể được cập nhật (không bắt buộc)
        public string? Row { get; set; }

        // Number có thể được cập nhật (không bắt buộc)
        public int? Number { get; set; }

        // SeatType có thể được cập nhật (không bắt buộc)
        [MaxLength(50)]
        public string? SeatType { get; set; }

        // Không cho phép thay đổi CinemaHallId để đảm bảo tính toàn vẹn dữ liệu
        // Nếu muốn chuyển ghế sang phòng chiếu khác, nên xóa và tạo lại
    }
}
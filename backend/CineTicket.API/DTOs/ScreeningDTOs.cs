using System;
using System.Collections.Generic;

namespace CineTicket.API.DTOs
{
    public class AdminScreeningDTO
    {
        public int MovieId { get; set; }
        public int CinemaHallId { get; set; }
        public DateTime StartTime { get; set; }
        public decimal Price { get; set; }
    }

    // DTO cho cập nhật từng phần suất chiếu
    public class ScreeningUpdateDTO
    {
        // Tất cả trường đều là nullable để cho phép cập nhật từng phần
        public int? MovieId { get; set; }
        public int? CinemaHallId { get; set; }
        public DateTime? StartTime { get; set; }
        public decimal? Price { get; set; }
    }

    public class BulkScreeningDTO
    {
        public int MovieId { get; set; }
        public int CinemaHallId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<DateTime> ShowTimes { get; set; } = new List<DateTime>();
        public List<int> DaysOfWeek { get; set; } = new List<int>(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        public decimal Price { get; set; }
    }

    public class ScreeningResponseDTO
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal Price { get; set; }

        // Movie info
        public int MovieId { get; set; }
        public string MovieTitle { get; set; }
        public string PosterUrl { get; set; }
        public int DurationMinutes { get; set; }

        // Cinema info
        public int CinemaHallId { get; set; }
        public string CinemaHallName { get; set; }
        public string HallType { get; set; }
        public int CinemaId { get; set; }
        public string CinemaName { get; set; }

        // Booking info
        public int? BookedSeatsCount { get; set; }
        public int? AvailableSeats { get; set; }

        // Audit info
        public DateTime CreatedAt { get; set; }
    }
}

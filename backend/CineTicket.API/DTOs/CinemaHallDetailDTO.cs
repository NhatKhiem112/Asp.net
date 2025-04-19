using System;
using System.Collections.Generic;
using CineTicket.API.Models;

namespace CineTicket.API.DTOs
{
    public class CinemaHallDetailDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string HallType { get; set; } = string.Empty;
        public int CinemaId { get; set; }

        // Thông tin rút gọn của rạp (không bao gồm danh sách phòng)
        public CinemaBasicInfo Cinema { get; set; } = null!;

        // Số lượng ghế thay vì danh sách đầy đủ
        public int SeatsCount { get; set; }
        public List<SeatTypeCount> SeatsByType { get; set; } = new List<SeatTypeCount>();

        // Số lượng suất chiếu thay vì danh sách đầy đủ
        public int ScreeningsCount { get; set; }
        public int UpcomingScreeningsCount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Static method để chuyển đổi từ CinemaHall sang DTO
        public static CinemaHallDetailDTO FromCinemaHall(CinemaHall cinemaHall)
        {
            var dto = new CinemaHallDetailDTO
            {
                Id = cinemaHall.Id,
                Name = cinemaHall.Name,
                Capacity = cinemaHall.Capacity,
                HallType = cinemaHall.HallType,
                CinemaId = cinemaHall.CinemaId,
                CreatedAt = cinemaHall.CreatedAt,
                UpdatedAt = cinemaHall.UpdatedAt,
                SeatsCount = cinemaHall.Seats?.Count ?? 0,
                ScreeningsCount = cinemaHall.Screenings?.Count ?? 0,
                UpcomingScreeningsCount = cinemaHall.Screenings?.Count(s => s.StartTime > DateTime.UtcNow) ?? 0
            };

            // Chỉ add thông tin cinema nếu nó được load
            if (cinemaHall.Cinema != null)
            {
                dto.Cinema = new CinemaBasicInfo
                {
                    Id = cinemaHall.Cinema.Id,
                    Name = cinemaHall.Cinema.Name,
                    Address = cinemaHall.Cinema.Address,
                    ImageUrl = cinemaHall.Cinema.ImageUrl
                };
            }

            // Nhóm ghế theo loại và đếm
            if (cinemaHall.Seats != null && cinemaHall.Seats.Count > 0)
            {
                var seatGroups = cinemaHall.Seats
                    .GroupBy(s => s.SeatType)
                    .Select(g => new SeatTypeCount
                    {
                        Type = g.Key,
                        Count = g.Count()
                    })
                    .ToList();

                dto.SeatsByType = seatGroups;
            }

            return dto;
        }
    }

    public class CinemaBasicInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class SeatTypeCount
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
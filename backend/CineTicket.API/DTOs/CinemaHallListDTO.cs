using System;
using System.Collections.Generic;
using CineTicket.API.Models;

namespace CineTicket.API.DTOs
{
    public class CinemaHallListDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string HallType { get; set; } = string.Empty;
        public int CinemaId { get; set; }
        public CinemaBasicInfo Cinema { get; set; } = null!;
        public int SeatsCount { get; set; }
        public int ScreeningsCount { get; set; }
        public DateTime CreatedAt { get; set; }

        // Static method để chuyển đổi từ CinemaHall sang DTO
        public static CinemaHallListDTO FromCinemaHall(CinemaHall cinemaHall)
        {
            var dto = new CinemaHallListDTO
            {
                Id = cinemaHall.Id,
                Name = cinemaHall.Name,
                Capacity = cinemaHall.Capacity,
                HallType = cinemaHall.HallType,
                CinemaId = cinemaHall.CinemaId,
                SeatsCount = cinemaHall.Seats?.Count ?? 0,
                ScreeningsCount = cinemaHall.Screenings?.Count ?? 0,
                CreatedAt = cinemaHall.CreatedAt
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

            return dto;
        }

        // Static method để chuyển đổi danh sách CinemaHall sang danh sách DTO
        public static List<CinemaHallListDTO> FromCinemaHallList(IEnumerable<CinemaHall> cinemaHalls)
        {
            return cinemaHalls.Select(FromCinemaHall).ToList();
        }
    }
}
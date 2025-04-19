using System;
using System.Collections.Generic;
using CineTicket.API.Models;

namespace CineTicket.API.DTOs
{
    public class CinemaListDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;

        // Thông tin tóm tắt về phòng chiếu thay vì danh sách đầy đủ
        public int HallsCount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Static method để chuyển đổi từ Cinema sang DTO
        public static CinemaListDTO FromCinema(Cinema cinema)
        {
            return new CinemaListDTO
            {
                Id = cinema.Id,
                Name = cinema.Name,
                Address = cinema.Address,
                PhoneNumber = cinema.PhoneNumber,
                Description = cinema.Description,
                ImageUrl = cinema.ImageUrl,
                HallsCount = cinema.CinemaHalls?.Count ?? 0,
                CreatedAt = cinema.CreatedAt,
                UpdatedAt = cinema.UpdatedAt
            };
        }

        // Static method để chuyển đổi danh sách Cinema sang danh sách DTO
        public static List<CinemaListDTO> FromCinemaList(IEnumerable<Cinema> cinemas)
        {
            return cinemas.Select(FromCinema).ToList();
        }
    }
}
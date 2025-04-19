using System;
using System.ComponentModel.DataAnnotations;
using CineTicket.API.Models;

namespace CineTicket.API.DTOs
{
    public class CinemaDetailDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int HallsCount { get; set; }
        public int TotalSeatsCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Static method để chuyển đổi từ Cinema model sang DTO
        public static CinemaDetailDTO FromCinema(Cinema cinema)
        {
            return new CinemaDetailDTO
            {
                Id = cinema.Id,
                Name = cinema.Name,
                Address = cinema.Address,
                PhoneNumber = cinema.PhoneNumber,
                Description = cinema.Description,
                ImageUrl = cinema.ImageUrl,
                HallsCount = cinema.CinemaHalls.Count,
                TotalSeatsCount = cinema.CinemaHalls.Sum(h => h.Capacity),
                CreatedAt = cinema.CreatedAt,
                UpdatedAt = cinema.UpdatedAt
            };
        }
    }
}
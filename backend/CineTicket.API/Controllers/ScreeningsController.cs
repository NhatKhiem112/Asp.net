using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineTicket.API.Data;
using CineTicket.API.Models;
using CineTicket.API.Services;

namespace CineTicket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScreeningsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TimeZoneService _timeZoneService;
        private readonly ScreeningService _screeningService;

        public ScreeningsController(
            ApplicationDbContext context,
            TimeZoneService timeZoneService,
            ScreeningService screeningService)
        {
            _context = context;
            _timeZoneService = timeZoneService;
            _screeningService = screeningService;
        }

        // GET: api/Screenings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Screening>>> GetScreenings()
        {
            // Update screening statuses before returning results
            await _screeningService.UpdateExpiredScreenings();

            var screenings = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .Where(s => s.Status == "upcoming")
                .ToListAsync();

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            foreach (var screening in screenings)
            {
                screening.StartTime = _timeZoneService.ConvertToVietnamTime(screening.StartTime);
                screening.EndTime = _timeZoneService.ConvertToVietnamTime(screening.EndTime);
            }

            return screenings;
        }

        // GET: api/Screenings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Screening>> GetScreening(int id)
        {
            // Update screening statuses before returning results
            await _screeningService.UpdateExpiredScreenings();

            var screening = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id && s.Status == "upcoming");

            if (screening == null)
            {
                return NotFound();
            }

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            screening.StartTime = _timeZoneService.ConvertToVietnamTime(screening.StartTime);
            screening.EndTime = _timeZoneService.ConvertToVietnamTime(screening.EndTime);

            return screening;
        }

        // GET: api/Screenings/Movie/5
        [HttpGet("Movie/{movieId}")]
        public async Task<ActionResult<IEnumerable<Screening>>> GetScreeningsByMovie(int movieId)
        {
            // Update screening statuses before returning results
            await _screeningService.UpdateExpiredScreenings();

            var screenings = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .Where(s => s.MovieId == movieId && s.Status == "upcoming")
                .ToListAsync();

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            foreach (var screening in screenings)
            {
                screening.StartTime = _timeZoneService.ConvertToVietnamTime(screening.StartTime);
                screening.EndTime = _timeZoneService.ConvertToVietnamTime(screening.EndTime);
            }

            return screenings;
        }

        // GET: api/Screenings/Cinema/5
        [HttpGet("Cinema/{cinemaId}")]
        public async Task<ActionResult<IEnumerable<Screening>>> GetScreeningsByCinema(int cinemaId)
        {
            // Update screening statuses before returning results
            await _screeningService.UpdateExpiredScreenings();

            var screenings = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .Where(s => s.CinemaHall.CinemaId == cinemaId && s.Status == "upcoming")
                .ToListAsync();

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            foreach (var screening in screenings)
            {
                screening.StartTime = _timeZoneService.ConvertToVietnamTime(screening.StartTime);
                screening.EndTime = _timeZoneService.ConvertToVietnamTime(screening.EndTime);
            }

            return screenings;
        }

        // GET: api/Screenings/5/Seats
        [HttpGet("{id}/Seats")]
        public async Task<ActionResult<object>> GetScreeningSeats(int id)
        {
            // Update screening statuses before returning results
            await _screeningService.UpdateExpiredScreenings();

            var screening = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id && s.Status == "upcoming");

            if (screening == null)
            {
                return NotFound("Screening not found or has expired");
            }

            // Lấy tất cả các ghế trong phòng chiếu
            var seats = await _context.Seats
                .Where(s => s.CinemaHallId == screening.CinemaHallId)
                .OrderBy(s => s.Row)
                .ThenBy(s => s.Number)
                .ToListAsync();

            // Lấy danh sách các ghế đã được đặt cho suất chiếu này
            var bookedSeatIds = await _context.BookingSeats
                .Where(bs => bs.Booking.ScreeningId == id && bs.Booking.BookingStatus != "Cancelled")
                .Select(bs => bs.SeatId)
                .ToListAsync();

            // Tạo kết quả bao gồm thông tin về ghế và trạng thái đặt
            var seatStatusList = seats.Select(seat => new
            {
                seat.Id,
                seat.Row,
                seat.Number,
                seat.SeatType,
                seat.CinemaHallId,
                IsBooked = bookedSeatIds.Contains(seat.Id)
            }).ToList();

            // Nhóm ghế theo hàng để dễ hiển thị trên UI
            var seatsByRow = seatStatusList
                .GroupBy(s => s.Row)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    Row = g.Key,
                    Seats = g.OrderBy(s => s.Number).ToList()
                })
                .ToList();

            // Thông tin về suất chiếu
            var screeningInfo = new
            {
                Id = screening.Id,
                MovieTitle = screening.Movie.Title,
                MoviePoster = screening.Movie.PosterUrl,
                CinemaName = screening.CinemaHall.Cinema.Name,
                HallName = screening.CinemaHall.Name,
                StartTime = screening.StartTime,
                EndTime = screening.EndTime,
                Price = screening.Price
            };

            return new
            {
                Screening = screeningInfo,
                SeatsByRow = seatsByRow,
                TotalSeats = seats.Count,
                AvailableSeats = seats.Count - bookedSeatIds.Count,
                BookedSeats = bookedSeatIds.Count
            };
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineTicket.API.Data;
using CineTicket.API.Models;
using CineTicket.API.DTOs;
using CineTicket.API.Services;

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TimeZoneService _timeZoneService;

        public BookingsController(ApplicationDbContext context, TimeZoneService timeZoneService)
        {
            _context = context;
            _timeZoneService = timeZoneService;
        }

        // GET: api/admin/bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings(
            [FromQuery] int? userId = null,
            [FromQuery] int? screeningId = null,
            [FromQuery] int? movieId = null,
            [FromQuery] int? cinemaId = null,
            [FromQuery] string? bookingStatus = null,
            [FromQuery] string? paymentStatus = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.CinemaHall)
                        .ThenInclude(ch => ch.Cinema)
                .Include(b => b.BookingSeats)
                    .ThenInclude(bs => bs.Seat)
                .AsQueryable();

            // Lọc theo người dùng
            if (userId.HasValue)
            {
                query = query.Where(b => b.UserId == userId);
            }

            // Lọc theo suất chiếu
            if (screeningId.HasValue)
            {
                query = query.Where(b => b.ScreeningId == screeningId);
            }

            // Lọc theo phim
            if (movieId.HasValue)
            {
                query = query.Where(b => b.Screening.MovieId == movieId);
            }

            // Lọc theo rạp
            if (cinemaId.HasValue)
            {
                query = query.Where(b => b.Screening.CinemaHall.CinemaId == cinemaId);
            }

            // Lọc theo trạng thái đặt vé
            if (!string.IsNullOrEmpty(bookingStatus))
            {
                query = query.Where(b => b.BookingStatus == bookingStatus);
            }

            // Lọc theo trạng thái thanh toán
            if (!string.IsNullOrEmpty(paymentStatus))
            {
                query = query.Where(b => b.PaymentStatus == paymentStatus);
            }

            // Lọc theo phương thức thanh toán
            if (!string.IsNullOrEmpty(paymentMethod))
            {
                query = query.Where(b => b.PaymentMethod == paymentMethod);
            }

            // Tìm kiếm theo thời gian
            if (startDate.HasValue)
            {
                var utcStartDate = _timeZoneService.ConvertToUtc(startDate.Value);
                query = query.Where(b => b.CreatedAt >= utcStartDate);
            }

            if (endDate.HasValue)
            {
                var utcEndDate = _timeZoneService.ConvertToUtc(endDate.Value).AddDays(1);
                query = query.Where(b => b.CreatedAt < utcEndDate);
            }

            // Tính tổng số đơn đặt vé
            var totalBookings = await query.CountAsync();

            // Phân trang
            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            foreach (var booking in bookings)
            {
                booking.CreatedAt = _timeZoneService.ConvertToVietnamTime(booking.CreatedAt);
                if (booking.PaidAt.HasValue)
                {
                    booking.PaidAt = _timeZoneService.ConvertToVietnamTime(booking.PaidAt.Value);
                }
                if (booking.Screening != null)
                {
                    booking.Screening.StartTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.StartTime);
                    booking.Screening.EndTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.EndTime);
                }
            }

            // Thêm thông tin phân trang vào header
            Response.Headers["X-Total-Count"] = totalBookings.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = Math.Ceiling((double)totalBookings / pageSize).ToString();

            return bookings;
        }

        // GET: api/admin/bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.CinemaHall)
                        .ThenInclude(ch => ch.Cinema)
                .Include(b => b.BookingSeats)
                    .ThenInclude(bs => bs.Seat)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound();
            }

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            booking.CreatedAt = _timeZoneService.ConvertToVietnamTime(booking.CreatedAt);
            if (booking.PaidAt.HasValue)
            {
                booking.PaidAt = _timeZoneService.ConvertToVietnamTime(booking.PaidAt.Value);
            }
            if (booking.Screening != null)
            {
                booking.Screening.StartTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.StartTime);
                booking.Screening.EndTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.EndTime);
            }

            return booking;
        }

        // PUT: api/admin/bookings/id/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, AdminBookingStatusUpdateDTO statusUpdate)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." }); // Failure message
            }

            // Cập nhật trạng thái đặt vé và thanh toán
            if (!string.IsNullOrEmpty(statusUpdate.BookingStatus))
            {
                booking.BookingStatus = statusUpdate.BookingStatus;
            }

            if (!string.IsNullOrEmpty(statusUpdate.PaymentStatus))
            {
                booking.PaymentStatus = statusUpdate.PaymentStatus;

                // Nếu cập nhật trạng thái thanh toán thành "Completed" hoặc "Paid", 
                // và chưa có thời gian thanh toán, thì cập nhật thời gian thanh toán
                if ((statusUpdate.PaymentStatus == "Completed" || statusUpdate.PaymentStatus == "Paid")
                    && booking.PaidAt == null)
                {
                    booking.PaidAt = _timeZoneService.GetCurrentVietnamTime();
                }
            }

            if (!string.IsNullOrEmpty(statusUpdate.PaymentReference))
            {
                booking.PaymentReference = statusUpdate.PaymentReference;
            }

            if (!string.IsNullOrEmpty(statusUpdate.PaymentMethod))
            {
                booking.PaymentMethod = statusUpdate.PaymentMethod;
            }

            if (!string.IsNullOrEmpty(statusUpdate.TransactionId))
            {
                booking.TransactionId = statusUpdate.TransactionId;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookingExists(id))
                {
                    return NotFound(new { message = "Booking not found." }); // Failure message
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Booking status updated successfully." }); // Success message
        }

        // DELETE: api/admin/bookings/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingSeats)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." }); // Failure message
            }

            // Xóa các BookingSeat liên quan
            _context.BookingSeats.RemoveRange(booking.BookingSeats);

            // Xóa booking
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking deleted successfully." }); // Success message
        }
        // GET: api/admin/bookings/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetBookingStatistics()
        {
            var totalBookings = await _context.Bookings.CountAsync();
            var pendingBookings = await _context.Bookings.CountAsync(b => b.BookingStatus == "Pending");
            var confirmedBookings = await _context.Bookings.CountAsync(b => b.BookingStatus == "Confirmed");
            var cancelledBookings = await _context.Bookings.CountAsync(b => b.BookingStatus == "Cancelled");

            // Thống kê theo thời gian
            var today = DateTime.UtcNow.Date;
            var bookingsToday = await _context.Bookings.CountAsync(b => b.CreatedAt >= today);
            var bookingsThisWeek = await _context.Bookings.CountAsync(b => b.CreatedAt >= today.AddDays(-7));
            var bookingsThisMonth = await _context.Bookings.CountAsync(b => b.CreatedAt >= today.AddDays(-30));

            // Thống kê doanh thu theo thời gian
            var revenueToday = await _context.Bookings
                .Where(b => (b.PaymentStatus == "Completed" || b.PaymentStatus == "Paid") && b.CreatedAt >= today)
                .SumAsync(b => b.TotalAmount);

            var revenueThisWeek = await _context.Bookings
                .Where(b => (b.PaymentStatus == "Completed" || b.PaymentStatus == "Paid") && b.CreatedAt >= today.AddDays(-7))
                .SumAsync(b => b.TotalAmount);

            var revenueThisMonth = await _context.Bookings
                .Where(b => (b.PaymentStatus == "Completed" || b.PaymentStatus == "Paid") && b.CreatedAt >= today.AddDays(-30))
                .SumAsync(b => b.TotalAmount);

            // Số vé đã bán
            var totalTickets = await _context.BookingSeats
                .Where(bs => bs.Booking.BookingStatus != "Cancelled")
                .CountAsync();

            // Top phim được đặt vé nhiều nhất
            var topMovies = await _context.Movies
                .OrderByDescending(m => m.Screenings
                    .SelectMany(s => s.Bookings)
                    .Count(b => b.BookingStatus != "Cancelled"))
                .Take(5)
                .Select(m => new
                {
                    m.Id,
                    m.Title,
                    BookingCount = m.Screenings
                        .SelectMany(s => s.Bookings)
                        .Count(b => b.BookingStatus != "Cancelled")
                })
                .ToListAsync();

            return new
            {
                totalBookings,
                bookingStatus = new
                {
                    pending = pendingBookings,
                    confirmed = confirmedBookings,
                    cancelled = cancelledBookings
                },
                paymentStatus = new
                {
                    pending = await _context.Bookings.CountAsync(b => b.PaymentStatus == "Pending"),
                    completed = await _context.Bookings.CountAsync(b => b.PaymentStatus == "Completed" || b.PaymentStatus == "Paid"),
                    failed = await _context.Bookings.CountAsync(b => b.PaymentStatus == "Failed")
                },
                paymentMethods = new
                {
                    creditcard = await _context.Bookings.CountAsync(b =>
                        b.PaymentMethod == "creditcard" ||
                        b.PaymentMethod == "visa" ||
                        b.PaymentMethod == "mastercard"),
                    banking = await _context.Bookings.CountAsync(b =>
                        b.PaymentMethod == "banking" ||
                        b.PaymentMethod == "banktransfer"),
                    cash = await _context.Bookings.CountAsync(b =>
                        b.PaymentMethod == "cash" ||
                        b.PaymentMethod == "atcounter"),
                    other = await _context.Bookings.CountAsync(b =>
                        b.PaymentMethod != null &&
                        b.PaymentMethod != "creditcard" &&
                        b.PaymentMethod != "visa" &&
                        b.PaymentMethod != "mastercard" &&
                        b.PaymentMethod != "banking" &&
                        b.PaymentMethod != "banktransfer" &&
                        b.PaymentMethod != "cash" &&
                        b.PaymentMethod != "atcounter")
                },
                bookingsByTime = new
                {
                    today = bookingsToday,
                    thisWeek = bookingsThisWeek,
                    thisMonth = bookingsThisMonth
                },
                totalRevenue = await _context.Bookings
                    .Where(b => b.PaymentStatus == "Completed" || b.PaymentStatus == "Paid")
                    .SumAsync(b => b.TotalAmount),
                revenueByTime = new
                {
                    today = revenueToday,
                    thisWeek = revenueThisWeek,
                    thisMonth = revenueThisMonth
                },
                totalTickets,
                topMovies
            };
        }

        private bool BookingExists(int id)
        {
            return _context.Bookings.Any(e => e.Id == id);
        }
    }
}

// Data Transfer Objects
namespace CineTicket.API.DTOs
{
    public class AdminBookingStatusUpdateDTO
    {
        public string? BookingStatus { get; set; }
        public string? PaymentStatus { get; set; }
        public string? PaymentReference { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
    }
}
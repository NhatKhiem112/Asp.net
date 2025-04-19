using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineTicket.API.Data;
using CineTicket.API.Models;
using CineTicket.API.Services;

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TimeZoneService _timeZoneService;

        public DashboardController(ApplicationDbContext context, TimeZoneService timeZoneService)
        {
            _context = context;
            _timeZoneService = timeZoneService;
        }

        // GET: api/admin/dashboard/summary
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetDashboardSummary()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var yesterday = today.AddDays(-1);
            var lastWeek = today.AddDays(-7);
            var lastMonth = today.AddMonths(-1);

            // Thống kê người dùng
            var totalUsers = await _context.Users.CountAsync();
            var newUsersToday = await _context.Users.CountAsync(u => u.CreatedAt >= today);
            var newUsersThisWeek = await _context.Users.CountAsync(u => u.CreatedAt >= lastWeek);
            var newUsersThisMonth = await _context.Users.CountAsync(u => u.CreatedAt >= lastMonth);

            // Thống kê đặt vé
            var totalBookings = await _context.Bookings.CountAsync();
            var bookingsToday = await _context.Bookings.CountAsync(b => b.CreatedAt >= today);
            var bookingsYesterday = await _context.Bookings.CountAsync(b => b.CreatedAt >= yesterday && b.CreatedAt < today);
            var bookingsTrend = bookingsToday - bookingsYesterday; // Positive means increase, negative means decrease

            // Thống kê doanh thu
            var totalRevenue = await _context.Bookings
                .Where(b => b.PaymentStatus == "Completed")
                .SumAsync(b => b.TotalAmount);

            var revenueToday = await _context.Bookings
                .Where(b => b.PaymentStatus == "Completed" && b.CreatedAt >= today)
                .SumAsync(b => b.TotalAmount);

            var revenueYesterday = await _context.Bookings
                .Where(b => b.PaymentStatus == "Completed" && b.CreatedAt >= yesterday && b.CreatedAt < today)
                .SumAsync(b => b.TotalAmount);

            var revenueTrend = revenueToday - revenueYesterday; // Positive means increase, negative means decrease

            // Thống kê suất chiếu
            var totalScreenings = await _context.Screenings.CountAsync();
            var upcomingScreenings = await _context.Screenings.CountAsync(s => s.StartTime > now);
            var screeningsToday = await _context.Screenings.CountAsync(s => s.StartTime >= today && s.StartTime < today.AddDays(1));

            // Thống kê rạp và phòng chiếu
            var totalCinemas = await _context.Cinemas.CountAsync();
            var totalCinemaHalls = await _context.CinemaHalls.CountAsync();

            // Thống kê phim
            var totalMovies = await _context.Movies.CountAsync();
            var upcomingMovies = await _context.Movies.CountAsync(m => m.ReleaseDate > now);

            // Top phim đặt vé nhiều nhất trong tháng
            var topMovies = await _context.Movies
                .Where(m => m.Screenings.Any(s => s.Bookings.Any(b => b.CreatedAt >= lastMonth)))
                .OrderByDescending(m => m.Screenings
                    .SelectMany(s => s.Bookings)
                    .Count(b => b.CreatedAt >= lastMonth && b.BookingStatus != "Cancelled"))
                .Take(5)
                .Select(m => new
                {
                    m.Id,
                    m.Title,
                    m.PosterUrl,
                    BookingCount = m.Screenings
                        .SelectMany(s => s.Bookings)
                        .Count(b => b.CreatedAt >= lastMonth && b.BookingStatus != "Cancelled")
                })
                .ToListAsync();

            // Top rạp chiếu phim có nhiều đặt vé nhất tháng này
            var topCinemas = await _context.Cinemas
                .OrderByDescending(c => c.CinemaHalls
                    .SelectMany(ch => ch.Screenings)
                    .SelectMany(s => s.Bookings)
                    .Count(b => b.CreatedAt >= lastMonth && b.BookingStatus != "Cancelled"))
                .Take(5)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.ImageUrl,
                    BookingCount = c.CinemaHalls
                        .SelectMany(ch => ch.Screenings)
                        .SelectMany(s => s.Bookings)
                        .Count(b => b.CreatedAt >= lastMonth && b.BookingStatus != "Cancelled")
                })
                .ToListAsync();

            // Thống kê đặt vé theo trạng thái
            var pendingBookings = await _context.Bookings.CountAsync(b => b.BookingStatus == "Pending");
            var confirmedBookings = await _context.Bookings.CountAsync(b => b.BookingStatus == "Confirmed");
            var cancelledBookings = await _context.Bookings.CountAsync(b => b.BookingStatus == "Cancelled");

            // Thống kê thanh toán theo trạng thái
            var pendingPayments = await _context.Bookings.CountAsync(b => b.PaymentStatus == "Pending");
            var completedPayments = await _context.Bookings.CountAsync(b => b.PaymentStatus == "Completed");
            var failedPayments = await _context.Bookings.CountAsync(b => b.PaymentStatus == "Failed");

            // Doanh thu theo tháng trong 6 tháng gần đây
            var revenueByMonth = new List<object>();
            for (int i = 5; i >= 0; i--)
            {
                var monthStart = today.AddMonths(-i).AddDays(1 - today.Day);
                var monthEnd = monthStart.AddMonths(1);

                var monthlyRevenue = await _context.Bookings
                    .Where(b => b.PaymentStatus == "Completed" && b.CreatedAt >= monthStart && b.CreatedAt < monthEnd)
                    .SumAsync(b => b.TotalAmount);

                revenueByMonth.Add(new
                {
                    Month = monthStart.ToString("MMM yyyy"),
                    Revenue = monthlyRevenue
                });
            }

            // Trả về tất cả thống kê
            return new
            {
                users = new
                {
                    total = totalUsers,
                    newToday = newUsersToday,
                    newThisWeek = newUsersThisWeek,
                    newThisMonth = newUsersThisMonth
                },
                bookings = new
                {
                    total = totalBookings,
                    today = bookingsToday,
                    yesterday = bookingsYesterday,
                    trend = bookingsTrend,
                    byStatus = new
                    {
                        pending = pendingBookings,
                        confirmed = confirmedBookings,
                        cancelled = cancelledBookings
                    }
                },
                revenue = new
                {
                    total = totalRevenue,
                    today = revenueToday,
                    yesterday = revenueYesterday,
                    trend = revenueTrend,
                    byMonth = revenueByMonth,
                    byPaymentStatus = new
                    {
                        pending = pendingPayments,
                        completed = completedPayments,
                        failed = failedPayments
                    }
                },
                screenings = new
                {
                    total = totalScreenings,
                    upcoming = upcomingScreenings,
                    today = screeningsToday
                },
                cinemas = new
                {
                    total = totalCinemas,
                    halls = totalCinemaHalls
                },
                movies = new
                {
                    total = totalMovies,
                    upcoming = upcomingMovies
                },
                topPerformers = new
                {
                    movies = topMovies,
                    cinemas = topCinemas
                }
            };
        }

        // GET: api/admin/dashboard/activity
        [HttpGet("activity")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentActivity(int count = 10)
        {
            var now = DateTime.UtcNow;

            // Lấy 10 đơn đặt vé gần đây nhất
            var recentBookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .OrderByDescending(b => b.CreatedAt)
                .Take(count)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    UserName = $"{b.User.FirstName} {b.User.LastName}",
                    b.User.Email,
                    MovieTitle = b.Screening.Movie.Title,
                    b.CreatedAt,
                    b.TotalAmount,
                    b.BookingStatus,
                    b.PaymentStatus,
                    Type = "booking",
                    TimeAgo = EF.Functions.DateDiffSecond(b.CreatedAt, now)
                })
                .ToListAsync();

            // Chuyển đổi múi giờ
            foreach (dynamic booking in recentBookings)
            {
                booking.CreatedAt = _timeZoneService.ConvertToVietnamTime((DateTime)booking.CreatedAt);
            }

            // Sắp xếp lại theo thời gian gần đây nhất
            var activity = recentBookings
                .OrderByDescending(a => ((dynamic)a).CreatedAt)
                .Take(count)
                .ToList();

            return activity;
        }
    }
}
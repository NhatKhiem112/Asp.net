using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineTicket.API.Data;
using CineTicket.API.Models;
using CineTicket.API.Services;
using CineTicket.API.DTOs;

namespace CineTicket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TimeZoneService _timeZoneService;

        public BookingsController(ApplicationDbContext context, TimeZoneService timeZoneService)
        {
            _context = context;
            _timeZoneService = timeZoneService;
        }

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetUserBookings()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var bookings = await _context.Bookings
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.CinemaHall)
                        .ThenInclude(ch => ch.Cinema)
                .Include(b => b.BookingSeats)
                    .ThenInclude(bs => bs.Seat)
                .Where(b => b.UserId == userId)
                .ToListAsync();

            // Chuyển đổi thời gian sang múi giờ Việt Nam trước khi trả về
            foreach (var booking in bookings)
            {
                booking.CreatedAt = _timeZoneService.ConvertToVietnamTime(booking.CreatedAt);
                if (booking.Screening != null)
                {
                    booking.Screening.StartTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.StartTime);
                    booking.Screening.EndTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.EndTime);
                }
            }

            return bookings;
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetBooking(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var booking = await _context.Bookings
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

            // Check if the booking belongs to the current user or if the user is an admin
            if (booking.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            booking.CreatedAt = _timeZoneService.ConvertToVietnamTime(booking.CreatedAt);
            if (booking.Screening != null)
            {
                booking.Screening.StartTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.StartTime);
                booking.Screening.EndTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.EndTime);
            }

            return booking;
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking(CreateBookingDto bookingDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            // Check if screening exists
            var screening = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                .FirstOrDefaultAsync(s => s.Id == bookingDto.ScreeningId);

            if (screening == null)
            {
                return BadRequest("Screening not found");
            }

            // Check if screening has already started
            var currentVietnamTime = _timeZoneService.GetCurrentVietnamTime();
            var screeningStartTime = _timeZoneService.ConvertToVietnamTime(screening.StartTime);
            var timeDifference = (currentVietnamTime - screeningStartTime).TotalMinutes;
            if (timeDifference >= 15)
            {
                return BadRequest("Cannot book tickets for a screening that has already started");
            }

            // Check if seats are available
            var existingBookings = await _context.Bookings
                .Where(b => b.ScreeningId == bookingDto.ScreeningId && b.BookingStatus != "Cancelled")
                .SelectMany(b => b.BookingSeats)
                .Select(bs => bs.SeatId)
                .ToListAsync();

            var unavailableSeats = bookingDto.SeatIds
                .Intersect(existingBookings)
                .ToList();

            if (unavailableSeats.Any())
            {
                return BadRequest($"Seats {string.Join(", ", unavailableSeats)} are already booked");
            }

            // Verify seats belong to the proper cinema hall
            var seats = await _context.Seats
                .Where(s => bookingDto.SeatIds.Contains(s.Id) && s.CinemaHallId == screening.CinemaHallId)
                .ToListAsync();

            if (seats.Count != bookingDto.SeatIds.Count)
            {
                return BadRequest("One or more seats not found or do not belong to the cinema hall");
            }

            var totalAmount = screening.Price * seats.Count;

            var booking = new Booking
            {
                UserId = userId,
                ScreeningId = bookingDto.ScreeningId,
                CreatedAt = _timeZoneService.GetCurrentVietnamTime(),
                BookingStatus = "Pending", // Changed from Confirmed to Pending until payment
                PaymentStatus = "Pending",
                TotalAmount = totalAmount
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Now that we have the booking ID, create the booking seats
            foreach (var seat in seats)
            {
                _context.BookingSeats.Add(new BookingSeat
                {
                    BookingId = booking.Id,
                    SeatId = seat.Id
                });
            }

            await _context.SaveChangesAsync();

            // Get the complete booking information for response
            var createdBooking = await _context.Bookings
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.CinemaHall)
                        .ThenInclude(ch => ch.Cinema)
                .Include(b => b.BookingSeats)
                    .ThenInclude(bs => bs.Seat)
                .FirstOrDefaultAsync(b => b.Id == booking.Id);

            if (createdBooking == null)
            {
                return NotFound("Booking was created but could not be retrieved");
            }

            // Convert times to Vietnam timezone
            createdBooking.CreatedAt = _timeZoneService.ConvertToVietnamTime(createdBooking.CreatedAt);
            if (createdBooking.Screening != null)
            {
                createdBooking.Screening.StartTime = _timeZoneService.ConvertToVietnamTime(createdBooking.Screening.StartTime);
                createdBooking.Screening.EndTime = _timeZoneService.ConvertToVietnamTime(createdBooking.Screening.EndTime);
            }

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, createdBooking);
        }

        // POST: api/Bookings/Payment
        [HttpPost("payment")]
        public async Task<IActionResult> ProcessPayment(PaymentDto paymentDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == paymentDto.BookingId);

            if (booking == null)
            {
                return NotFound("Booking not found");
            }

            // Check if the booking belongs to the current user
            if (booking.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            // Verify payment amount
            if (booking.TotalAmount != paymentDto.Amount)
            {
                return BadRequest("Payment amount does not match booking total");
            }

            // Check if booking is already paid
            if (booking.PaymentStatus == "Paid")
            {
                return BadRequest("Booking is already paid");
            }

            // Check if booking is cancelled
            if (booking.BookingStatus == "Cancelled")
            {
                return BadRequest("Cannot process payment for a cancelled booking");
            }

            // TODO: Integrate with actual payment gateway
            // This is a simplified mock payment process
            bool paymentSuccessful = await ProcessPaymentWithGateway(paymentDto);

            if (!paymentSuccessful)
            {
                return StatusCode(500, "Payment processing failed");
            }

            // Update booking status
            booking.PaymentStatus = "Paid";
            booking.BookingStatus = "Confirmed";
            booking.TransactionId = paymentDto.TransactionReference;
            booking.PaymentMethod = paymentDto.PaymentMethod;
            booking.PaidAt = _timeZoneService.GetCurrentVietnamTime();

            await _context.SaveChangesAsync();

            // Return updated booking
            var updatedBooking = await _context.Bookings
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .Include(b => b.BookingSeats)
                    .ThenInclude(bs => bs.Seat)
                .FirstOrDefaultAsync(b => b.Id == booking.Id);

            return Ok(updatedBooking);
        }

        // Mock payment gateway integration
        private async Task<bool> ProcessPaymentWithGateway(PaymentDto paymentDto)
        {
            // In a real application, this would integrate with a payment gateway
            // For demonstration purposes, we'll simulate a successful payment
            await Task.Delay(500); // Simulate network delay

            // For educational project, always return success except for specific test cases
            switch (paymentDto.PaymentMethod.ToLower())
            {
                case "creditcard":
                case "visa":
                case "mastercard":
                    // Simulated credit card processing
                    return true;

                case "banking":
                case "banktransfer":
                    // Simulated bank transfer
                    return true;

                case "cash":
                case "atcounter":
                    // Payment at counter - always successful 
                    return true;

                case "test_fail": // Special case for testing failure scenario
                    return false;

                default:
                    // For any other payment method, return success
                    return true;
            }
        }

        // PUT: api/Bookings/5/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            // Check if the booking belongs to the current user or if the user is an admin
            if (booking.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            // Check if the booking can be cancelled
            if (booking.BookingStatus == "Cancelled")
            {
                return BadRequest("Booking is already cancelled");
            }

            // Check if the screening has already happened
            var screening = await _context.Screenings.FindAsync(booking.ScreeningId);
            if (screening != null && screening.StartTime <= _timeZoneService.GetCurrentVietnamTime())
            {
                return BadRequest("Cannot cancel a booking for a screening that has already started");
            }

            // Cancel the booking
            booking.BookingStatus = "Cancelled";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Bookings/Admin
        [HttpGet("Admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .Include(b => b.Screening)
                    .ThenInclude(s => s.CinemaHall)
                        .ThenInclude(ch => ch.Cinema)
                .Include(b => b.BookingSeats)
                    .ThenInclude(bs => bs.Seat)
                .ToListAsync();

            // Chuyển đổi thời gian sang múi giờ Việt Nam
            foreach (var booking in bookings)
            {
                booking.CreatedAt = _timeZoneService.ConvertToVietnamTime(booking.CreatedAt);
                if (booking.Screening != null)
                {
                    booking.Screening.StartTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.StartTime);
                    booking.Screening.EndTime = _timeZoneService.ConvertToVietnamTime(booking.Screening.EndTime);
                }
            }

            return bookings;
        }

        // POST: api/Bookings/SimplePayment
        [HttpPost("simple-payment")]
        public async Task<IActionResult> ProcessSimplePayment(SimplifiedPaymentDto paymentDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == paymentDto.BookingId);

            if (booking == null)
            {
                return NotFound("Booking not found");
            }

            // Check if the booking belongs to the current user
            if (booking.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            // Check if booking is already paid
            if (booking.PaymentStatus == "Paid")
            {
                return BadRequest("Booking is already paid");
            }

            // Check if booking is cancelled
            if (booking.BookingStatus == "Cancelled")
            {
                return BadRequest("Cannot process payment for a cancelled booking");
            }

            // Tạo PaymentDto từ SimplifiedPaymentDto
            var fullPaymentDto = new PaymentDto
            {
                BookingId = paymentDto.BookingId,
                PaymentMethod = paymentDto.PaymentMethod,
                Amount = booking.TotalAmount,
                TransactionReference = GenerateTransactionReference()
            };

            // Gọi xử lý thanh toán
            bool paymentSuccessful = await ProcessPaymentWithGateway(fullPaymentDto);

            if (!paymentSuccessful)
            {
                return StatusCode(500, "Payment processing failed");
            }

            // Update booking status
            booking.PaymentStatus = "Paid";
            booking.BookingStatus = "Confirmed";
            booking.TransactionId = fullPaymentDto.TransactionReference;
            booking.PaymentMethod = paymentDto.PaymentMethod;
            booking.PaidAt = _timeZoneService.GetCurrentVietnamTime();

            await _context.SaveChangesAsync();

            // Return updated booking
            var updatedBooking = await _context.Bookings
                .Include(b => b.Screening)
                    .ThenInclude(s => s.Movie)
                .Include(b => b.BookingSeats)
                    .ThenInclude(bs => bs.Seat)
                .FirstOrDefaultAsync(b => b.Id == booking.Id);

            return Ok(updatedBooking);
        }

        // Generate a mock transaction reference for educational purposes
        private string GenerateTransactionReference()
        {
            return $"TRX-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8)}";
        }
    }
}
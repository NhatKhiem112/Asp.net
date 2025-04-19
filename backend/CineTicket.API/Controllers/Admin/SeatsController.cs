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

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SeatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SeatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/seats
        // Lấy danh sách ghế với nhiều tùy chọn lọc và phân trang
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Seat>>> GetSeats(
            [FromQuery] int? cinemaHallId = null,
            [FromQuery] string? seatType = null,
            [FromQuery] string? row = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Seats
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .AsQueryable();

            // Lọc theo phòng chiếu
            if (cinemaHallId.HasValue)
            {
                query = query.Where(s => s.CinemaHallId == cinemaHallId.Value);
            }

            // Lọc theo loại ghế
            if (!string.IsNullOrEmpty(seatType))
            {
                query = query.Where(s => s.SeatType.ToLower() == seatType.ToLower());
            }

            // Lọc theo hàng
            if (!string.IsNullOrEmpty(row))
            {
                query = query.Where(s => s.Row.ToLower() == row.ToLower());
            }

            // Tính tổng số ghế
            var totalSeats = await query.CountAsync();

            // Phân trang
            var seats = await query
                .OrderBy(s => s.CinemaHallId)
                .ThenBy(s => s.Row)
                .ThenBy(s => s.Number)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Thêm thông tin phân trang vào response headers
            Response.Headers.Append("X-Total-Count", totalSeats.ToString());
            Response.Headers.Append("X-Total-Pages", Math.Ceiling((double)totalSeats / pageSize).ToString());
            Response.Headers.Append("X-Current-Page", page.ToString());
            Response.Headers.Append("X-Page-Size", pageSize.ToString());

            // Chuyển đổi để không trả về circular references
            var result = seats.Select(s => new
            {
                s.Id,
                s.Row,
                s.Number,
                s.SeatType,
                s.CinemaHallId,
                CinemaHall = new
                {
                    s.CinemaHall.Id,
                    s.CinemaHall.Name,
                    Cinema = new
                    {
                        s.CinemaHall.Cinema.Id,
                        s.CinemaHall.Cinema.Name
                    }
                }
            });

            return Ok(result);
        }

        // GET: api/admin/seats/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Seat>> GetSeat(int id)
        {
            var seat = await _context.Seats
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (seat == null)
            {
                return NotFound("Seat not found");
            }

            // Chuyển đổi để không trả về circular references
            var result = new
            {
                seat.Id,
                seat.Row,
                seat.Number,
                seat.SeatType,
                seat.CinemaHallId,
                CinemaHall = new
                {
                    seat.CinemaHall.Id,
                    seat.CinemaHall.Name,
                    Cinema = new
                    {
                        seat.CinemaHall.Cinema.Id,
                        seat.CinemaHall.Cinema.Name
                    }
                },
                Bookings = seat.BookingSeats.Count
            };

            return Ok(result);
        }

        // PUT: api/admin/seats/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSeat(int id, SeatUpdateDTO seatDto)
        {
            var seat = await _context.Seats.FindAsync(id);
            if (seat == null)
            {
                return NotFound("Seat not found");
            }

            // Kiểm tra xem ghế có đang được đặt không
            var isBooked = await _context.BookingSeats.AnyAsync(bs => bs.SeatId == id);
            if (isBooked)
            {
                return BadRequest("Cannot update a seat that is currently booked");
            }

            // Kiểm tra thông tin trùng lặp nếu cập nhật Row và Number
            if (seatDto.Row != null && seatDto.Number.HasValue)
            {
                var existingSeat = await _context.Seats
                    .FirstOrDefaultAsync(s =>
                        s.CinemaHallId == seat.CinemaHallId &&
                        s.Row == seatDto.Row &&
                        s.Number == seatDto.Number &&
                        s.Id != id);

                if (existingSeat != null)
                {
                    return BadRequest($"Seat {seatDto.Row}-{seatDto.Number} already exists in this cinema hall");
                }
            }
            else if (seatDto.Row != null)
            {
                var existingSeat = await _context.Seats
                    .FirstOrDefaultAsync(s =>
                        s.CinemaHallId == seat.CinemaHallId &&
                        s.Row == seatDto.Row &&
                        s.Number == seat.Number &&
                        s.Id != id);

                if (existingSeat != null)
                {
                    return BadRequest($"Seat {seatDto.Row}-{seat.Number} already exists in this cinema hall");
                }
            }
            else if (seatDto.Number.HasValue)
            {
                var existingSeat = await _context.Seats
                    .FirstOrDefaultAsync(s =>
                        s.CinemaHallId == seat.CinemaHallId &&
                        s.Row == seat.Row &&
                        s.Number == seatDto.Number &&
                        s.Id != id);

                if (existingSeat != null)
                {
                    return BadRequest($"Seat {seat.Row}-{seatDto.Number} already exists in this cinema hall");
                }
            }

            // Cập nhật thông tin ghế
            if (seatDto.Row != null)
                seat.Row = seatDto.Row;

            if (seatDto.Number.HasValue)
                seat.Number = seatDto.Number.Value;

            if (seatDto.SeatType != null)
                seat.SeatType = seatDto.SeatType;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeatExists(id))
                {
                    return NotFound("Seat not found");
                }
                else
                {
                    throw;
                }
            }

            return Ok(new
            {
                message = "Seat updated successfully",
                seat = new
                {
                    seat.Id,
                    seat.Row,
                    seat.Number,
                    seat.SeatType,
                    seat.CinemaHallId
                }
            });
        }

        // DELETE: api/admin/seats/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSeat(int id)
        {
            var seat = await _context.Seats.FindAsync(id);
            if (seat == null)
            {
                return NotFound("Seat not found");
            }

            // Kiểm tra xem ghế có đang được đặt không
            var isBooked = await _context.BookingSeats.AnyAsync(bs => bs.SeatId == id);
            if (isBooked)
            {
                return BadRequest("Cannot delete a seat that is currently booked");
            }

            _context.Seats.Remove(seat);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Seat deleted successfully",
                seatId = id
            });
        }

        // DELETE: api/admin/seats/cinemahall/{cinemaHallId}
        [HttpDelete("cinemahall/{cinemaHallId}")]
        public async Task<IActionResult> DeleteAllSeatsInCinemaHall(int cinemaHallId)
        {
            // Kiểm tra xem phòng chiếu có tồn tại không
            var cinemaHall = await _context.CinemaHalls.FindAsync(cinemaHallId);
            if (cinemaHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Kiểm tra xem có lịch chiếu sắp tới không
            var hasUpcomingScreenings = await _context.Screenings
                .AnyAsync(s => s.CinemaHallId == cinemaHallId && s.StartTime > DateTime.UtcNow);

            if (hasUpcomingScreenings)
            {
                return BadRequest("Cannot clear seats when there are upcoming screenings");
            }

            // Kiểm tra xem có đặt chỗ không
            var hasBookings = await _context.BookingSeats
                .AnyAsync(bs => bs.Seat.CinemaHallId == cinemaHallId);

            if (hasBookings)
            {
                return BadRequest("Cannot clear seats when there are bookings associated with them");
            }

            var seats = await _context.Seats
                .Where(s => s.CinemaHallId == cinemaHallId)
                .ToListAsync();

            if (!seats.Any())
            {
                return BadRequest("This cinema hall has no seats to delete");
            }

            _context.Seats.RemoveRange(seats);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "All seats in the cinema hall deleted successfully",
                cinemaHallId,
                removedSeats = seats.Count
            });
        }

        // GET: api/admin/seats/types
        [HttpGet("types")]
        public ActionResult<IEnumerable<string>> GetSeatTypes()
        {
            return new List<string> { "Standard", "VIP", "Handicap", "Premium", "Couple" };
        }

        // GET: api/admin/seats/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetSeatStatistics()
        {
            var totalSeats = await _context.Seats.CountAsync();
            var seatsByType = await _context.Seats
                .GroupBy(s => s.SeatType)
                .Select(g => new
                {
                    Type = g.Key,
                    Count = g.Count(),
                    Percentage = totalSeats > 0 ? (double)g.Count() / totalSeats * 100 : 0
                })
                .ToListAsync();

            var seatsByCinema = await _context.Seats
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .GroupBy(s => s.CinemaHall.Cinema.Name)
                .Select(g => new
                {
                    CinemaName = g.Key,
                    SeatsCount = g.Count()
                })
                .OrderByDescending(g => g.SeatsCount)
                .ToListAsync();

            var seatsByCinemaHall = await _context.Seats
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .GroupBy(s => new { s.CinemaHall.Id, CinemaHallName = s.CinemaHall.Name, CinemaName = s.CinemaHall.Cinema.Name })
                .Select(g => new
                {
                    CinemaName = g.Key.CinemaName,
                    CinemaHallName = g.Key.CinemaHallName,
                    CinemaHallId = g.Key.Id,
                    SeatsCount = g.Count()
                })
                .OrderByDescending(g => g.SeatsCount)
                .Take(10)
                .ToListAsync();

            // Tỷ lệ ghế đã đặt
            var bookedSeatsCount = await _context.BookingSeats.CountAsync();
            var bookingRatio = totalSeats > 0 ? (double)bookedSeatsCount / totalSeats * 100 : 0;

            return new
            {
                totalSeats,
                seatsByType,
                seatsByCinema,
                topCinemaHalls = seatsByCinemaHall,
                bookingRatio
            };
        }

        // POST: api/admin/seats
        [HttpPost]
        public async Task<ActionResult<Seat>> CreateSeat(SeatCreateDTO seatDto, [FromQuery] int cinemaHallId)
        {
            var cinemaHall = await _context.CinemaHalls.FindAsync(cinemaHallId);
            if (cinemaHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Kiểm tra trùng lặp ghế
            var existingSeat = await _context.Seats
                .FirstOrDefaultAsync(s => s.CinemaHallId == cinemaHallId &&
                                        s.Row == seatDto.Row &&
                                        s.Number == seatDto.Number);

            if (existingSeat != null)
            {
                return BadRequest($"Seat {seatDto.Row}-{seatDto.Number} already exists in this cinema hall");
            }

            // Tạo đối tượng Seat từ DTO
            var seat = new Seat
            {
                Row = seatDto.Row,
                Number = seatDto.Number,
                SeatType = seatDto.SeatType,
                CinemaHallId = cinemaHallId
            };

            _context.Seats.Add(seat);

            // Cập nhật capacity của cinema hall nếu cần
            cinemaHall.Capacity += 1;

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSeat), new { id = seat.Id }, new
            {
                message = "Seat added successfully",
                seat = new
                {
                    seat.Id,
                    seat.Row,
                    seat.Number,
                    seat.SeatType,
                    seat.CinemaHallId
                }
            });
        }

        // POST: api/admin/seats/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<Seat>>> CreateBulkSeats(BulkSeatsDto bulkSeatsDto, [FromQuery] int cinemaHallId)
        {
            var cinemaHall = await _context.CinemaHalls.FindAsync(cinemaHallId);
            if (cinemaHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Kiểm tra các thông số
            if (bulkSeatsDto.Rows <= 0 || bulkSeatsDto.SeatsPerRow <= 0 ||
                bulkSeatsDto.Rows * bulkSeatsDto.SeatsPerRow > 500)
            {
                return BadRequest("Invalid parameters for seat creation");
            }

            var seats = new List<Seat>();
            for (int row = 0; row < bulkSeatsDto.Rows; row++)
            {
                string rowLetter = row < 26 ? ((char)('A' + row)).ToString() : $"A{row - 26 + 1}";
                for (int number = 1; number <= bulkSeatsDto.SeatsPerRow; number++)
                {
                    var seat = new Seat
                    {
                        Row = rowLetter,
                        Number = number,
                        SeatType = bulkSeatsDto.SeatType,
                        CinemaHallId = cinemaHallId
                    };
                    seats.Add(seat);
                }
            }

            _context.Seats.AddRange(seats);

            // Cập nhật capacity của cinema hall
            cinemaHall.Capacity += seats.Count;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"{seats.Count} seats added successfully to cinema hall",
                cinemaHallId = cinemaHallId,
                seatsSummary = new
                {
                    totalSeats = seats.Count,
                    seatType = bulkSeatsDto.SeatType,
                    rowsCount = bulkSeatsDto.Rows,
                    seatsPerRow = bulkSeatsDto.SeatsPerRow
                }
            });
        }

        private bool SeatExists(int id)
        {
            return _context.Seats.Any(e => e.Id == id);
        }
    }
}
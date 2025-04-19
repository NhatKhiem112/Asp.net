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
using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CinemaHallsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CinemaHallsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/cinemahalls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CinemaHallListDTO>>> GetCinemaHalls([FromQuery] int? cinemaId = null, [FromQuery] string search = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // Lưu ý: Để lấy tất cả phòng chiếu của một rạp cụ thể, bạn cũng có thể sử dụng:
            // GET: api/admin/cinemas/{cinemaId}/halls

            var query = _context.CinemaHalls
                .Include(ch => ch.Cinema)
                .Include(ch => ch.Seats)      // Cần để đếm số ghế
                .Include(ch => ch.Screenings) // Cần để đếm số suất chiếu
                .AsQueryable();

            // Lọc theo cinema nếu có
            if (cinemaId.HasValue)
            {
                query = query.Where(ch => ch.CinemaId == cinemaId.Value);
            }

            // Tìm kiếm theo tên phòng chiếu
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(ch =>
                    ch.Name.ToLower().Contains(search) ||
                    ch.HallType.ToLower().Contains(search) ||
                    ch.Cinema.Name.ToLower().Contains(search));
            }

            // Tính tổng số phòng chiếu
            var totalHalls = await query.CountAsync();

            // Phân trang
            var halls = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Thêm thông tin phân trang vào header
            Response.Headers["X-Total-Count"] = totalHalls.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = Math.Ceiling((double)totalHalls / pageSize).ToString();

            // Chuyển đổi sang DTO để tránh vòng lặp tham chiếu và thông tin thừa
            return CinemaHallListDTO.FromCinemaHallList(halls);
        }

        // GET: api/admin/cinemahalls/id
        [HttpGet("{id}")]
        public async Task<ActionResult<CinemaHallDetailDTO>> GetCinemaHall(int id)
        {
            var cinemaHall = await _context.CinemaHalls
                .Include(ch => ch.Cinema)
                .Include(ch => ch.Seats)
                .Include(ch => ch.Screenings)
                .FirstOrDefaultAsync(ch => ch.Id == id);

            if (cinemaHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Chuyển đổi từ entity sang DTO để tránh vòng lặp tham chiếu
            var cinemaHallDetail = CinemaHallDetailDTO.FromCinemaHall(cinemaHall);

            return cinemaHallDetail;
        }

        // POST: api/admin/cinemahalls
        [HttpPost]
        public async Task<ActionResult<CinemaHall>> CreateCinemaHall(CinemaHallCreateDTO cinemaHallDto)
        {
            // Kiểm tra xem cinema có tồn tại không
            var cinema = await _context.Cinemas.FindAsync(cinemaHallDto.CinemaId);
            if (cinema == null)
            {
                return BadRequest($"Cinema with ID {cinemaHallDto.CinemaId} does not exist");
            }

            // Kiểm tra tên phòng chiếu có bị trùng trong cùng rạp không
            var nameExists = await _context.CinemaHalls
                .AnyAsync(h => h.CinemaId == cinemaHallDto.CinemaId
                             && h.Name.ToLower() == cinemaHallDto.Name.ToLower());
            if (nameExists)
            {
                return BadRequest($"A hall with name '{cinemaHallDto.Name}' already exists in this cinema");
            }

            // Tạo đối tượng CinemaHall từ DTO
            var cinemaHall = new CinemaHall
            {
                Name = cinemaHallDto.Name,
                Capacity = cinemaHallDto.Capacity,
                HallType = cinemaHallDto.HallType,
                CinemaId = cinemaHallDto.CinemaId
            };

            _context.CinemaHalls.Add(cinemaHall);
            await _context.SaveChangesAsync();

            // Tự động tạo ghế dựa trên capacity
            if (cinemaHallDto.AutoGenerateSeats)
            {
                // Tính toán số hàng và số ghế mỗi hàng
                int rows = (int)Math.Ceiling(Math.Sqrt(cinemaHall.Capacity));
                int seatsPerRow = (int)Math.Ceiling((double)cinemaHall.Capacity / rows);

                var seats = new List<Seat>();
                int seatCount = 0;

                // Tính toán phân bổ ghế: 4 hàng đầu là Standard, còn lại là VIP
                // Loại bỏ tham số middleRowStart và middleRowEnd không cần thiết

                for (int row = 1; row <= rows && seatCount < cinemaHall.Capacity; row++)
                {
                    for (int seatNum = 1; seatNum <= seatsPerRow && seatCount < cinemaHall.Capacity; seatNum++)
                    {
                        // Mặc định ghế là Standard
                        string seatType = "Standard";

                        // Xác định loại ghế: 4 hàng đầu là Standard, còn lại là VIP
                        if (row > 4) // Hàng từ E trở đi là VIP
                        {
                            seatType = "VIP";
                        }

                        var seat = new Seat
                        {
                            Row = GetRowLetter(row - 1),
                            Number = seatNum,
                            SeatType = seatType,
                            CinemaHallId = cinemaHall.Id
                        };

                        seats.Add(seat);
                        seatCount++;
                    }
                }

                _context.Seats.AddRange(seats);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction("GetCinemaHall", new { id = cinemaHall.Id }, new
            {
                message = "Cinema hall created successfully",
                cinemaHallId = cinemaHall.Id,
                name = cinemaHall.Name,
                seatsGenerated = cinemaHallDto.AutoGenerateSeats ? cinemaHall.Capacity : 0
            });
        }

        // PUT: api/admin/cinemahalls/id
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCinemaHall(int id, CinemaHallUpdateDTO cinemaHallDto)
        {
            // Lấy thông tin phòng chiếu hiện tại kèm theo ghế
            var existingHall = await _context.CinemaHalls
                .Include(ch => ch.Seats)
                .FirstOrDefaultAsync(ch => ch.Id == id);

            if (existingHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Lưu lại capacity cũ để so sánh sau
            var oldCapacity = existingHall.Capacity;
            var capacityChanged = cinemaHallDto.Capacity.HasValue && cinemaHallDto.Capacity.Value != oldCapacity;

            // Kiểm tra và cập nhật tên nếu được cung cấp
            if (cinemaHallDto.Name != null && cinemaHallDto.Name != existingHall.Name)
            {
                // Kiểm tra tên mới có trùng với phòng chiếu khác trong cùng rạp không
                var nameExists = await _context.CinemaHalls
                    .AnyAsync(h => h.CinemaId == existingHall.CinemaId
                                && h.Name.ToLower() == cinemaHallDto.Name.ToLower()
                                && h.Id != id);
                if (nameExists)
                {
                    return BadRequest($"A hall with name '{cinemaHallDto.Name}' already exists in this cinema");
                }

                existingHall.Name = cinemaHallDto.Name;
            }

            // Cập nhật sức chứa nếu được cung cấp
            if (cinemaHallDto.Capacity.HasValue)
            {
                existingHall.Capacity = cinemaHallDto.Capacity.Value;
            }

            // Cập nhật loại phòng nếu được cung cấp
            if (cinemaHallDto.HallType != null)
            {
                existingHall.HallType = cinemaHallDto.HallType;
            }

            // Xử lý tạo lại ghế nếu có yêu cầu và capacity đã thay đổi
            var seatsRegenerated = false;
            var originalSeatsCount = existingHall.Seats.Count;
            var seatsRegenerationMessage = string.Empty;

            if (capacityChanged && cinemaHallDto.RegenerateSeats)
            {
                // Kiểm tra xem có lịch chiếu sắp tới không
                var hasUpcomingScreenings = await _context.Screenings
                    .AnyAsync(s => s.CinemaHallId == id && s.StartTime > DateTime.UtcNow);

                if (hasUpcomingScreenings)
                {
                    return BadRequest("Cannot regenerate seats when there are upcoming screenings. Please reschedule or cancel screenings first.");
                }

                // Kiểm tra xem có đặt chỗ không
                var hasBookings = await _context.BookingSeats
                    .AnyAsync(bs => bs.Seat.CinemaHallId == id);

                if (hasBookings)
                {
                    return BadRequest("Cannot regenerate seats when there are bookings associated with them. Please cancel bookings first.");
                }

                // OK, an toàn để xóa và tạo lại ghế
                // Xóa ghế cũ
                _context.Seats.RemoveRange(existingHall.Seats);
                await _context.SaveChangesAsync();

                // Tính toán số hàng và số ghế mỗi hàng cho capacity mới
                int rows = (int)Math.Ceiling(Math.Sqrt(existingHall.Capacity));
                int seatsPerRow = (int)Math.Ceiling((double)existingHall.Capacity / rows);

                var seats = new List<Seat>();
                int seatCount = 0;

                // Tạo ghế mới
                for (int row = 1; row <= rows && seatCount < existingHall.Capacity; row++)
                {
                    for (int seatNum = 1; seatNum <= seatsPerRow && seatCount < existingHall.Capacity; seatNum++)
                    {
                        // Mặc định ghế là Standard
                        string seatType = "Standard";

                        // Xác định loại ghế: 4 hàng đầu là Standard, còn lại là VIP
                        if (row > 4) // Hàng từ E trở đi là VIP
                        {
                            seatType = "VIP";
                        }

                        var seat = new Seat
                        {
                            Row = GetRowLetter(row - 1),
                            Number = seatNum,
                            SeatType = seatType,
                            CinemaHallId = existingHall.Id
                        };

                        seats.Add(seat);
                        seatCount++;
                    }
                }

                _context.Seats.AddRange(seats);
                seatsRegenerated = true;
                seatsRegenerationMessage = $"Seats regenerated: {seats.Count} new seats created.";
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CinemaHallExists(id))
                {
                    return NotFound("Cinema hall not found");
                }
                else
                {
                    throw;
                }
            }

            return Ok(new
            {
                message = "Cinema hall updated successfully" + (seatsRegenerated ? ". " + seatsRegenerationMessage : ""),
                cinemaHallId = id,
                name = existingHall.Name,
                capacityChanged = capacityChanged,
                oldCapacity = oldCapacity,
                newCapacity = existingHall.Capacity,
                seatsRegenerated = seatsRegenerated,
                originalSeatsCount = originalSeatsCount,
                currentSeatsCount = seatsRegenerated ? existingHall.Capacity : originalSeatsCount
            });
        }

        // DELETE: api/admin/cinemahalls/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCinemaHall(int id)
        {
            var cinemaHall = await _context.CinemaHalls
                .Include(ch => ch.Screenings)
                .FirstOrDefaultAsync(ch => ch.Id == id);

            if (cinemaHall == null)
            {
                return NotFound();
            }

            // Kiểm tra xem phòng chiếu có lịch chiếu phim sắp tới không
            var hasUpcomingScreenings = cinemaHall.Screenings
                .Any(s => s.StartTime > DateTime.UtcNow);

            if (hasUpcomingScreenings)
            {
                return BadRequest("Cannot delete cinema hall with upcoming screenings");
            }

            _context.CinemaHalls.Remove(cinemaHall);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cinema hall deleted successfully",
                cinemaHallId = id,
                name = cinemaHall.Name
            });
        }

        // GET: api/admin/cinemahalls/id/seats
        [HttpGet("{id}/seats")]
        public async Task<ActionResult<object>> GetCinemaHallSeats(
            int id,
            [FromQuery] string? seatType = null,
            [FromQuery] string? row = null)
        {
            var cinemaHall = await _context.CinemaHalls
                .Include(ch => ch.Seats)
                .FirstOrDefaultAsync(ch => ch.Id == id);

            if (cinemaHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Lấy query danh sách ghế
            var query = cinemaHall.Seats.AsQueryable();

            // Áp dụng bộ lọc nếu có
            if (!string.IsNullOrEmpty(seatType))
            {
                query = query.Where(s => s.SeatType.ToLower() == seatType.ToLower());
            }

            if (!string.IsNullOrEmpty(row))
            {
                query = query.Where(s => s.Row.ToLower() == row.ToLower());
            }

            // Tính tổng số ghế
            var totalSeats = query.Count();

            // Lấy danh sách ghế đã tối ưu (không cần phân trang)
            var seats = query
                .OrderBy(s => s.Row)
                .ThenBy(s => s.Number)
                .Select(s => new
                {
                    s.Id,
                    s.Row,
                    s.Number,
                    s.SeatType
                })
                .ToList();

            // Tính toán phân bố ghế theo loại
            var seatsByType = cinemaHall.Seats
                .GroupBy(s => s.SeatType)
                .Select(g => new
                {
                    Type = g.Key,
                    Count = g.Count()
                })
                .ToList();

            // Tính toán thông tin hàng và cột để vẽ grid
            var rows = seats
                .Select(s => s.Row)
                .Distinct()
                .OrderBy(r => r)
                .ToList();

            var columns = seats
                .Select(s => s.Number)
                .Distinct()
                .OrderBy(n => n)
                .ToList();

            // Tối ưu cấu trúc dữ liệu cho frontend render sơ đồ
            var seatMap = rows.Select(row => new
            {
                Row = row,
                Seats = seats
                    .Where(s => s.Row == row)
                    .OrderBy(s => s.Number)
                    .ToList()
            }).ToList();

            // Trả về kết quả với định dạng phù hợp cho việc hiển thị sơ đồ
            return Ok(new
            {
                hallId = cinemaHall.Id,
                hallName = cinemaHall.Name,
                capacity = cinemaHall.Capacity,
                totalSeats = totalSeats,
                seatsByType,
                layoutInfo = new
                {
                    rowsCount = rows.Count,
                    columnsCount = columns.Count,
                    rows,
                    columns,
                    maxSeatsPerRow = seatMap.Max(r => r.Seats.Count)
                },
                seatMap
            });
        }

        // POST: api/admin/cinemahalls/id/seats/generate
        [HttpPost("{id}/seats/generate")]
        public async Task<ActionResult<IEnumerable<Seat>>> GenerateSeats(int id, [FromBody] SeatGenerationDTO generationDto)
        {
            var cinemaHall = await _context.CinemaHalls.FindAsync(id);
            if (cinemaHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Kiểm tra xem đã có ghế trong phòng chưa
            var existingSeats = await _context.Seats.Where(s => s.CinemaHallId == id).ToListAsync();
            if (existingSeats.Any())
            {
                return BadRequest("This cinema hall already has seats. Please clear existing seats first.");
            }

            // Kiểm tra xác thực các tham số
            int rows = generationDto.Rows;
            int seatsPerRow = generationDto.SeatsPerRow;

            if (rows <= 0 || seatsPerRow <= 0 || rows * seatsPerRow > 1000)
            {
                return BadRequest("Invalid seat generation parameters");
            }

            var seats = new List<Seat>();

            // Tính toán phân bổ ghế: 4 hàng đầu là Standard, còn lại là VIP
            // Loại bỏ các tham số phân bổ trước đây

            for (int row = 1; row <= rows; row++)
            {
                for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++)
                {
                    string rowLetter = GetRowLetter(row - 1);
                    string seatType = "Standard";  // Mặc định là Standard

                    // Xác định loại ghế: 4 hàng đầu là Standard, còn lại là VIP
                    if (row > 4) // Hàng từ E trở đi là VIP
                    {
                        seatType = "VIP";
                    }

                    seats.Add(new Seat
                    {
                        Row = rowLetter,
                        Number = seatNum,
                        SeatType = seatType,
                        CinemaHallId = id
                    });
                }
            }

            _context.Seats.AddRange(seats);
            cinemaHall.Capacity = seats.Count;
            await _context.SaveChangesAsync();

            // Thay đổi cách trả về kết quả - tóm tắt thay vì danh sách đầy đủ
            return Ok(new
            {
                message = "Seats generated successfully",
                cinemaHallId = id,
                totalSeats = seats.Count,
                seatsSummary = new
                {
                    standardSeats = seats.Count(s => s.SeatType == "Standard"),
                    vipSeats = seats.Count(s => s.SeatType == "VIP"),
                    rowsCount = rows,
                    seatsPerRow = seatsPerRow
                }
            });
        }

        // DELETE: api/admin/cinemahalls/id/seats
        [HttpDelete("{id}/seats")]
        public async Task<IActionResult> ClearCinemaHallSeats(int id)
        {
            var cinemaHall = await _context.CinemaHalls
                .Include(ch => ch.Seats)
                .FirstOrDefaultAsync(ch => ch.Id == id);

            if (cinemaHall == null)
            {
                return NotFound("Cinema hall not found");
            }

            // Kiểm tra xem có lịch chiếu sắp tới không
            var hasUpcomingScreenings = await _context.Screenings
                .AnyAsync(s => s.CinemaHallId == id && s.StartTime > DateTime.UtcNow);

            if (hasUpcomingScreenings)
            {
                return BadRequest("Cannot clear seats when there are upcoming screenings");
            }

            // Kiểm tra xem có đặt chỗ không
            var hasBookings = await _context.BookingSeats
                .AnyAsync(bs => bs.Seat.CinemaHallId == id);

            if (hasBookings)
            {
                return BadRequest("Cannot clear seats when there are bookings associated with them");
            }

            _context.Seats.RemoveRange(cinemaHall.Seats);

            // Lưu số lượng ghế bị xóa để hiển thị trong phản hồi
            var removedSeatsCount = cinemaHall.Seats.Count;

            cinemaHall.Capacity = 0;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "All seats cleared successfully",
                cinemaHallId = id,
                hallName = cinemaHall.Name,
                removedSeats = removedSeatsCount
            });
        }

        private bool CinemaHallExists(int id)
        {
            return _context.CinemaHalls.Any(e => e.Id == id);
        }

        // Phương thức hỗ trợ cho việc chuyển đổi số hàng thành chữ cái
        private string GetRowLetter(int rowIndex)
        {
            // Hỗ trợ đến 26*26 + 26 = 702 hàng (A, B, ... Z, AA, AB, ... ZZ)
            if (rowIndex < 26)
            {
                return ((char)('A' + rowIndex)).ToString();
            }
            else
            {
                int firstChar = (rowIndex / 26) - 1;
                int secondChar = rowIndex % 26;
                return ((char)('A' + firstChar)).ToString() + ((char)('A' + secondChar)).ToString();
            }
        }
    }
}
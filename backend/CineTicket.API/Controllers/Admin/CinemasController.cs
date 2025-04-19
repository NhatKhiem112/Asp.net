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
using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CinemasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;

        public CinemasController(ApplicationDbContext context, IWebHostEnvironment hostEnvironment)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
        }

        // GET: api/admin/cinemas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CinemaListDTO>>> GetCinemas([FromQuery] string search = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Cinemas
                .Include(c => c.CinemaHalls) // Bao gồm phòng chiếu để đếm
                .AsQueryable();

            // Tìm kiếm theo tên hoặc địa chỉ
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(search) ||
                    c.Address.ToLower().Contains(search));
            }

            // Tính tổng số rạp
            var totalCinemas = await query.CountAsync();

            // Phân trang
            var cinemas = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Thêm thông tin phân trang vào header
            Response.Headers["X-Total-Count"] = totalCinemas.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = Math.Ceiling((double)totalCinemas / pageSize).ToString();

            // Chuyển đổi từ entity sang DTO để tránh vòng lặp tham chiếu và giảm kích thước phản hồi
            var cinemaDTOs = CinemaListDTO.FromCinemaList(cinemas);

            return cinemaDTOs;
        }

        // GET: api/admin/cinemas/id
        [HttpGet("{id}")]
        public async Task<ActionResult<CinemaDetailDTO>> GetCinema(int id)
        {
            var cinema = await _context.Cinemas
                .Include(c => c.CinemaHalls)
                    .ThenInclude(ch => ch.Seats)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cinema == null)
            {
                return NotFound();
            }

            // Chuyển đổi từ Cinema model sang DTO để không trả về đầy đủ danh sách phòng
            var cinemaDetail = CinemaDetailDTO.FromCinema(cinema);

            return cinemaDetail;
        }

        // POST: api/admin/cinemas
        [HttpPost]
        public async Task<ActionResult<Cinema>> CreateCinema(Cinema cinema)
        {
            // Kiểm tra tên cinema đã tồn tại chưa
            if (await _context.Cinemas.AnyAsync(c => c.Name.ToLower() == cinema.Name.ToLower()))
            {
                return BadRequest("A cinema with this name already exists");
            }

            // Kiểm tra địa chỉ đã tồn tại chưa
            if (await _context.Cinemas.AnyAsync(c => c.Address.ToLower() == cinema.Address.ToLower()))
            {
                return BadRequest("A cinema with this address already exists");
            }

            _context.Cinemas.Add(cinema);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCinema), new { id = cinema.Id }, new
            {
                message = "Cinema created successfully",
                cinema = new
                {
                    cinema.Id,
                    cinema.Name,
                    cinema.Address,
                    cinema.PhoneNumber,
                    cinema.Description,
                    cinema.ImageUrl
                }
            });
        }

        // PUT: api/admin/cinemas/id
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCinema(int id, CinemaUpdateDTO cinemaDto)
        {
            // Lấy thông tin cinema cũ để cập nhật
            var existingCinema = await _context.Cinemas.FindAsync(id);
            if (existingCinema == null)
            {
                return NotFound();
            }

            // Kiểm tra tên nếu được cập nhật
            if (cinemaDto.Name != null && cinemaDto.Name != existingCinema.Name)
            {
                if (await _context.Cinemas.AnyAsync(c => c.Name.ToLower() == cinemaDto.Name.ToLower() && c.Id != id))
                {
                    return BadRequest("A cinema with this name already exists");
                }
            }

            // Kiểm tra địa chỉ nếu được cập nhật
            if (cinemaDto.Address != null && cinemaDto.Address != existingCinema.Address)
            {
                if (await _context.Cinemas.AnyAsync(c => c.Address.ToLower() == cinemaDto.Address.ToLower() && c.Id != id))
                {
                    return BadRequest("A cinema with this address already exists");
                }
            }

            // Chỉ cập nhật các trường không null từ DTO
            if (cinemaDto.Name != null)
                existingCinema.Name = cinemaDto.Name;

            if (cinemaDto.Address != null)
                existingCinema.Address = cinemaDto.Address;

            if (cinemaDto.PhoneNumber != null)
                existingCinema.PhoneNumber = cinemaDto.PhoneNumber;

            if (cinemaDto.Description != null)
                existingCinema.Description = cinemaDto.Description;

            // Xử lý ImageUrl
            if (cinemaDto.ImageUrl != null && existingCinema.ImageUrl != cinemaDto.ImageUrl)
            {
                // Nếu có ảnh cũ thuộc uploads folder, xóa nó
                if (!string.IsNullOrEmpty(existingCinema.ImageUrl) &&
                    existingCinema.ImageUrl.Contains("/content/uploads/"))
                {
                    DeleteImageFile(existingCinema.ImageUrl);
                }

                // Cập nhật URL ảnh mới
                existingCinema.ImageUrl = cinemaDto.ImageUrl;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CinemaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new
            {
                message = "Cinema updated successfully",
                cinemaId = id,
                name = existingCinema.Name
            });
        }

        // DELETE: api/admin/cinemas/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCinema(int id)
        {
            var cinema = await _context.Cinemas
                .Include(c => c.CinemaHalls)
                    .ThenInclude(ch => ch.Screenings)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cinema == null)
            {
                return NotFound();
            }

            // Kiểm tra xem rạp có lịch chiếu phim sắp tới không
            var hasUpcomingScreenings = cinema.CinemaHalls
                .SelectMany(ch => ch.Screenings)
                .Any(s => s.StartTime > DateTime.UtcNow);

            if (hasUpcomingScreenings)
            {
                return BadRequest("Cannot delete cinema with upcoming screenings");
            }

            // Xóa ảnh của cinema nếu có
            if (!string.IsNullOrEmpty(cinema.ImageUrl) && cinema.ImageUrl.Contains("/content/uploads/"))
            {
                DeleteImageFile(cinema.ImageUrl);
            }

            _context.Cinemas.Remove(cinema);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cinema deleted successfully",
                cinemaId = id,
                name = cinema.Name
            });
        }

        // GET: api/admin/cinemas/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetCinemaStatistics()
        {
            var totalCinemas = await _context.Cinemas.CountAsync();
            var totalCinemaHalls = await _context.CinemaHalls.CountAsync();

            // Sử dụng tổng Capacity thay vì đếm số ghế
            var totalSeats = await _context.CinemaHalls.SumAsync(h => h.Capacity);

            // Rạp có nhiều suất chiếu nhất
            var mostActiveVenue = await _context.Cinemas
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    ScreeningCount = c.CinemaHalls.SelectMany(ch => ch.Screenings).Count()
                })
                .OrderByDescending(c => c.ScreeningCount)
                .FirstOrDefaultAsync();

            // Rạp có nhiều đơn đặt vé nhất
            var mostBookedVenue = await _context.Cinemas
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    BookingCount = c.CinemaHalls
                        .SelectMany(ch => ch.Screenings)
                        .SelectMany(s => s.Bookings)
                        .Count(b => b.BookingStatus != "Cancelled")
                })
                .OrderByDescending(c => c.BookingCount)
                .FirstOrDefaultAsync();

            // Tính toán trung bình chỗ ngồi mỗi phòng
            double avgSeatsPerHall = totalCinemaHalls > 0 ? (double)totalSeats / totalCinemaHalls : 0;

            return new
            {
                totalCinemas,
                totalCinemaHalls,
                totalSeats,
                avgHallsPerCinema = totalCinemas > 0 ? (double)totalCinemaHalls / totalCinemas : 0,
                avgSeatsPerHall = avgSeatsPerHall,
                mostActiveVenue,
                mostBookedVenue
            };
        }

        // GET: api/admin/cinemas/id/halls
        [HttpGet("{cinemaId}/halls")]
        public async Task<ActionResult<IEnumerable<CinemaHallListDTO>>> GetCinemaHalls(
            int cinemaId,
            [FromQuery] string? search = null,
            [FromQuery] string? hallType = null,
            [FromQuery] string? sortBy = "name",
            [FromQuery] string? sortOrder = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Kiểm tra xem cinema có tồn tại không
            if (!await _context.Cinemas.AnyAsync(c => c.Id == cinemaId))
            {
                return NotFound("Cinema not found");
            }

            // Tạo query lấy danh sách phòng chiếu của cinema
            var query = _context.CinemaHalls
                .Where(ch => ch.CinemaId == cinemaId)
                .AsQueryable();

            // Lọc theo tên hoặc mô tả
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(ch => ch.Name.ToLower().Contains(search) ||
                                          ch.HallType.ToLower().Contains(search));
            }

            // Lọc theo loại phòng chiếu
            if (!string.IsNullOrEmpty(hallType))
            {
                query = query.Where(ch => ch.HallType.ToLower() == hallType.ToLower());
            }

            // Tính tổng số phòng chiếu thỏa mãn điều kiện
            var totalHalls = await query.CountAsync();

            // Sắp xếp
            query = sortBy?.ToLower() switch
            {
                "capacity" => sortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(ch => ch.Capacity)
                    : query.OrderBy(ch => ch.Capacity),
                "halltype" => sortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(ch => ch.HallType)
                    : query.OrderBy(ch => ch.HallType),
                "seats" => sortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(ch => ch.Seats.Count)
                    : query.OrderBy(ch => ch.Seats.Count),
                _ => sortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(ch => ch.Name)
                    : query.OrderBy(ch => ch.Name)
            };

            // Phân trang
            var halls = await query
                .Include(ch => ch.Seats)
                .Include(ch => ch.Screenings)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Thêm thông tin phân trang vào header
            Response.Headers["X-Total-Count"] = totalHalls.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = Math.Ceiling((double)totalHalls / pageSize).ToString();

            // Chuyển đổi từ entity sang DTO để tránh vòng lặp tham chiếu và giảm kích thước phản hồi
            var hallDTOs = CinemaHallListDTO.FromCinemaHallList(halls);

            return hallDTOs;
        }

        private bool CinemaExists(int id)
        {
            return _context.Cinemas.Any(e => e.Id == id);
        }

        private void DeleteImageFile(string imageUrl)
        {
            try
            {
                // Lấy tên file từ URL
                string fileName = Path.GetFileName(new Uri(imageUrl).LocalPath);

                // Đường dẫn đến file ảnh
                string filePath = Path.Combine(_hostEnvironment.ContentRootPath, "content", "uploads", fileName);

                // Kiểm tra và xóa file nếu tồn tại
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch (Exception)
            {
                // Ghi log lỗi nếu cần thiết
                // Không throw exception vì việc xóa ảnh không nên làm ảnh hưởng đến quá trình chính
            }
        }
    }
}
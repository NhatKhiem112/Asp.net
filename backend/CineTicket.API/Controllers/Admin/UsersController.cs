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
using System.Security.Cryptography;
using System.Text;

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers([FromQuery] string? search = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Users.AsQueryable();

            // Tìm kiếm theo tên hoặc email
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(u =>
                    u.FirstName.ToLower().Contains(search) ||
                    u.LastName.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search));
            }

            // Tính tổng số người dùng
            var totalUsers = await query.CountAsync();

            // Phân trang
            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Ẩn password hash trong response
            foreach (var u in users)
            {
                u.PasswordHash = string.Empty;
            }

            // Thêm thông tin phân trang vào header
            Response.Headers["X-Total-Count"] = totalUsers.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = Math.Ceiling((double)totalUsers / pageSize).ToString();

            return users;
        }

        // GET: api/admin/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Bookings)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            // Ẩn password hash trong response
            user.PasswordHash = string.Empty;

            return user;
        }

        // POST: api/admin/users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(AdminCreateUserDTO userDto)
        {
            // Kiểm tra email đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
            {
                return BadRequest("Email already exists");
            }

            // Tạo user mới
            var user = new User
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email,
                PhoneNumber = userDto.PhoneNumber,
                Role = userDto.Role,
                CreatedAt = DateTime.UtcNow,
                PasswordHash = HashPassword(userDto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Ẩn password hash trong response
            user.PasswordHash = string.Empty;

            // Trả về thông báo thành công kèm thông tin người dùng đã tạo
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
            {
                message = "User created successfully",
                user = new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.PhoneNumber,
                    user.Role,
                    user.CreatedAt
                }
            });
        }

        // PUT: api/admin/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, AdminUpdateUserDTO userDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Kiểm tra nếu email đã tồn tại (và không phải email của user hiện tại)
            if (!string.IsNullOrEmpty(userDto.Email) &&
                user.Email != userDto.Email &&
                await _context.Users.AnyAsync(u => u.Email == userDto.Email))
            {
                return BadRequest("Email already exists");
            }

            // Cập nhật thông tin user
            if (!string.IsNullOrEmpty(userDto.FirstName))
                user.FirstName = userDto.FirstName;

            if (!string.IsNullOrEmpty(userDto.LastName))
                user.LastName = userDto.LastName;

            if (!string.IsNullOrEmpty(userDto.Email))
                user.Email = userDto.Email;

            if (!string.IsNullOrEmpty(userDto.PhoneNumber))
                user.PhoneNumber = userDto.PhoneNumber;

            if (!string.IsNullOrEmpty(userDto.Role))
                user.Role = userDto.Role;

            if (!string.IsNullOrEmpty(userDto.Password))
                user.PasswordHash = HashPassword(userDto.Password);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Trả về thông báo thành công thay vì NoContent
            return Ok(new
            {
                message = "User updated successfully",
                userId = id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                role = user.Role
            });
        }

        // DELETE: api/admin/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Kiểm tra xem user có phải là admin cuối cùng không
            if (user.Role == "Admin" && await _context.Users.CountAsync(u => u.Role == "Admin") <= 1)
            {
                return BadRequest("Cannot delete the last admin user");
            }

            // Kiểm tra xem user có booking nào đang hoạt động không
            var hasActiveBookings = await _context.Bookings
                .AnyAsync(b => b.UserId == id && b.BookingStatus != "Cancelled" && b.Screening.StartTime > DateTime.UtcNow);

            if (hasActiveBookings)
            {
                return BadRequest("User has active bookings. Cannot delete");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            // Trả về thông báo thành công
            return Ok(new
            {
                message = "User deleted successfully",
                userId = id,
                email = user.Email
            });
        }

        // GET: api/admin/users/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetUserStatistics()
        {
            var totalUsers = await _context.Users.CountAsync();
            var newUsers = await _context.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30));
            var activeUsers = await _context.Users
                .Where(u => u.Bookings.Any(b => b.CreatedAt >= DateTime.UtcNow.AddDays(-30)))
                .CountAsync();

            return new
            {
                totalUsers,
                newUsers,
                activeUsers,
                adminUsers = await _context.Users.CountAsync(u => u.Role == "Admin"),
                regularUsers = await _context.Users.CountAsync(u => u.Role == "User")
            };
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}

// Data Transfer Objects for Admin User management
namespace CineTicket.API.DTOs
{
    public class AdminCreateUserDTO
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "User"; // Default to "User"
    }

    public class AdminUpdateUserDTO
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
    }
}
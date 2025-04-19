using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CineTicket.API.DTOs;
using CineTicket.API.Models;
using CineTicket.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CineTicket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/users/me
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserDTO
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Username = user.Username,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }

        // PUT: api/users/profile
        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDTO profileDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties
            if (!string.IsNullOrEmpty(profileDto.FirstName))
                user.FirstName = profileDto.FirstName;

            if (!string.IsNullOrEmpty(profileDto.LastName))
                user.LastName = profileDto.LastName;

            if (!string.IsNullOrEmpty(profileDto.PhoneNumber))
                user.PhoneNumber = profileDto.PhoneNumber;

            if (!string.IsNullOrEmpty(profileDto.Username) && user.Username != profileDto.Username)
            {
                // Check if username is already taken
                var usernameExists = await _context.Users.AnyAsync(u => u.Username == profileDto.Username && u.Id != userId);
                if (usernameExists)
                {
                    return BadRequest("Username already exists");
                }

                user.Username = profileDto.Username;
            }

            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating profile: {ex.Message}");
            }

            return Ok(new UserDTO
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Username = user.Username,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            });
        }
    }

    // DTOs for User data
    public class UserDTO
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateProfileDTO
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Username { get; set; }
    }
}
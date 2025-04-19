using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using CineTicket.API.Data;
using CineTicket.API.DTOs;
using CineTicket.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CineTicket.API.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly TimeZoneService _timeZoneService;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, TimeZoneService timeZoneService)
        {
            _context = context;
            _configuration = configuration;
            _timeZoneService = timeZoneService;
        }

        public async Task<AuthResponseDTO?> Register(RegisterDTO registerDto)
        {
            // Check if user with the same email already exists
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return null;
            }

            // Create new user
            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = HashPassword(registerDto.Password),
                PhoneNumber = registerDto.PhoneNumber,
                CreatedAt = _timeZoneService.GetCurrentVietnamTime(),
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate and return JWT token
            var token = GenerateJwtToken(user);
            return new AuthResponseDTO
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Token = token,
                Role = user.Role
            };
        }

        public async Task<AuthResponseDTO?> Login(LoginDTO loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
            {
                return null;
            }

            // Verify password
            if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            // Generate and return JWT token
            var token = GenerateJwtToken(user);
            return new AuthResponseDTO
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Token = token,
                Role = user.Role
            };
        }

        public async Task<bool> ChangePassword(int userId, ChangePasswordDTO changePasswordDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return false;
            }

            // Verify current password
            if (!VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            // Update password
            user.PasswordHash = HashPassword(changePasswordDto.NewPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAccount(int userId, string password)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return false;
            }

            // Verify password for security
            if (!VerifyPassword(password, user.PasswordHash))
            {
                return false;
            }

            // Check if the user has any active bookings (non-cancelled)
            var hasActiveBookings = await _context.Bookings
                .AnyAsync(b => b.UserId == userId && b.BookingStatus != "Cancelled" && b.Screening.StartTime > DateTime.UtcNow);

            if (hasActiveBookings)
            {
                // Optional: You might want to handle this case differently, like auto-cancelling the bookings
                return false;
            }

            // Remove user
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            var hashedInput = HashPassword(password);
            return hashedInput.Equals(hashedPassword);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Role, user.Role),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["JWT:Key"] ?? "SuperSecretKeyForJWTTokenGeneration123!@#"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims: claims,
                expires: _timeZoneService.GetCurrentVietnamTime().AddMinutes(Convert.ToDouble(_configuration["JWT:ExpiryInMinutes"] ?? "60")),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
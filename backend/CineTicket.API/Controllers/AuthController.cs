using System.Security.Claims;
using System.Threading.Tasks;
using CineTicket.API.DTOs;
using CineTicket.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineTicket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO registerDto)
        {
            var result = await _authService.Register(registerDto);
            if (result == null)
            {
                return BadRequest("Email already exists");
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO loginDto)
        {
            var result = await _authService.Login(loginDto);
            if (result == null)
            {
                return Unauthorized("Invalid email or password");
            }

            return Ok(result);
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDTO changePasswordDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            var result = await _authService.ChangePassword(userId, changePasswordDto);
            if (!result)
            {
                return BadRequest("Current password is incorrect");
            }

            return Ok("Password changed successfully");
        }

        [Authorize]
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount(DeleteAccountDTO deleteAccountDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized();
            }

            // Check if user is trying to delete an admin account
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Admin")
            {
                // You might want to implement special logic for admin deletion
                // For example, require a "master" password or allow only through a special endpoint
                return BadRequest("Admin accounts cannot be deleted through this endpoint");
            }

            var result = await _authService.DeleteAccount(userId, deleteAccountDto.Password);
            if (!result)
            {
                return BadRequest("Failed to delete account. Password may be incorrect or you have active bookings.");
            }

            return Ok("Account deleted successfully");
        }
    }
}
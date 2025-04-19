using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ImagesController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostEnvironment;
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
        private const int MaxFileSize = 5 * 1024 * 1024; // 5MB

        public ImagesController(IWebHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Kiểm tra kích thước file
            if (file.Length > MaxFileSize)
            {
                return BadRequest($"File size exceeds the limit of {MaxFileSize / (1024 * 1024)}MB");
            }

            // Kiểm tra định dạng file
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(fileExtension))
            {
                return BadRequest($"Invalid file type. Allowed types: {string.Join(", ", AllowedExtensions)}");
            }

            try
            {
                // Tạo thư mục uploads nếu chưa tồn tại
                string uploadsFolder = Path.Combine(_hostEnvironment.ContentRootPath, "content", "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Tạo tên file duy nhất để tránh trùng lặp
                string uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Lưu file
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Tạo URL cho hình ảnh
                string baseUrl = $"{Request.Scheme}://{Request.Host}";
                string imageUrl = $"{baseUrl}/content/uploads/{uniqueFileName}";

                return Ok(new { imageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{fileName}")]
        public IActionResult DeleteImage(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return BadRequest("File name is required");
            }

            try
            {
                string uploadsFolder = Path.Combine(_hostEnvironment.ContentRootPath, "content", "uploads");
                string filePath = Path.Combine(uploadsFolder, fileName);

                // Kiểm tra xem file có tồn tại không
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound("File not found");
                }

                // Xóa file
                System.IO.File.Delete(filePath);

                return Ok(new { message = "File deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
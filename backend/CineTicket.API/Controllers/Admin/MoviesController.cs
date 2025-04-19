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
using CineTicket.API.Services;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TimeZoneService _timeZoneService;
        private readonly IWebHostEnvironment _hostEnvironment;

        public MoviesController(ApplicationDbContext context, TimeZoneService timeZoneService, IWebHostEnvironment hostEnvironment)
        {
            _context = context;
            _timeZoneService = timeZoneService;
            _hostEnvironment = hostEnvironment;
        }

        // GET: api/admin/movies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMovies([FromQuery] string search = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Movies.AsQueryable();

            // Tìm kiếm theo tiêu đề hoặc thể loại
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(m =>
                    m.Title.ToLower().Contains(search) ||
                    m.Genre.ToLower().Contains(search) ||
                    m.Description.ToLower().Contains(search));
            }

            // Tính tổng số phim
            var totalMovies = await query.CountAsync();

            // Phân trang
            var movies = await query
                .OrderByDescending(m => m.ReleaseDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Thêm thông tin phân trang vào header
            Response.Headers["X-Total-Count"] = totalMovies.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = Math.Ceiling((double)totalMovies / pageSize).ToString();

            // Trả về kết quả mà không thực hiện chuyển đổi
            var result = movies.Select(m => new
            {
                m.Id,
                m.Title,
                m.Description,
                m.Genre,
                m.ReleaseDate,
                m.DurationMinutes,
                m.Rating,
                m.PosterUrl,
                m.BackdropUrl,
                m.CreatedAt,
                m.UpdatedAt
            }).ToList();

            return result;
        }

        // GET: api/admin/movies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMovie(int id)
        {
            var movie = await _context.Movies
                .Include(m => m.Screenings)
                    .ThenInclude(s => s.CinemaHall)
                        .ThenInclude(ch => ch.Cinema)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
            {
                return NotFound();
            }

            // Chuyển đổi thời gian của lịch chiếu sang múi giờ Việt Nam
            foreach (var screening in movie.Screenings)
            {
                screening.StartTime = _timeZoneService.ConvertToVietnamTime(screening.StartTime);
                screening.EndTime = _timeZoneService.ConvertToVietnamTime(screening.EndTime);
            }

            // Trả về movie với thời gian không thực hiện chuyển đổi
            return new
            {
                Id = movie.Id,
                Title = movie.Title,
                Description = movie.Description,
                Genre = movie.Genre,
                ReleaseDate = movie.ReleaseDate,
                DurationMinutes = movie.DurationMinutes,
                Rating = movie.Rating,
                PosterUrl = movie.PosterUrl,
                BackdropUrl = movie.BackdropUrl,
                CreatedAt = movie.CreatedAt,
                UpdatedAt = movie.UpdatedAt,
                Screenings = movie.Screenings.Select(s => new
                {
                    s.Id,
                    s.StartTime,
                    s.EndTime,
                    s.Price,
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
                }).ToList()
            };
        }

        // POST: api/admin/movies
        [HttpPost]
        public async Task<ActionResult<Movie>> CreateMovie(MovieCreateDTO movieDto)
        {
            // Kiểm tra xem đã có phim nào có tên giống không (không phân biệt chữ hoa/chữ thường)
            if (await _context.Movies.AnyAsync(m => m.Title.ToLower() == movieDto.Title.ToLower()))
            {
                return BadRequest("A movie with this title already exists");
            }

            // Tạo đối tượng Movie từ DTO
            var movie = new Movie
            {
                Title = movieDto.Title,
                Description = movieDto.Description,
                PosterUrl = movieDto.PosterUrl,
                BackdropUrl = movieDto.BackdropUrl,
                Genre = movieDto.Genre,
                ReleaseDate = movieDto.ReleaseDate,
                DurationMinutes = movieDto.DurationMinutes,
                Rating = movieDto.Rating,
                TrailerUrl = ConvertToEmbedUrl(movieDto.TrailerUrl)
            };

            // Đặt thời gian tạo theo múi giờ Việt Nam
            movie.CreatedAt = _timeZoneService.GetCurrentVietnamTimeAsUtc();

            // Đảm bảo cả updated cũng là null, không phải UTC
            movie.UpdatedAt = null;

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, new
            {
                message = "Movie created successfully",
                movie = new
                {
                    movie.Id,
                    movie.Title,
                    movie.Description,
                    movie.Genre,
                    movie.ReleaseDate,
                    Duration = movie.DurationMinutes,
                    movie.Rating,
                    movie.PosterUrl,
                    CoverUrl = movie.BackdropUrl,
                    TrailerUrl = movie.TrailerUrl,
                    CreatedAt = movie.CreatedAt // Trả về thời gian tạo đã điều chỉnh
                }
            });
        }

        // PUT: api/admin/movies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(int id, MovieUpdateDTO movieDto)
        {
            // Lấy phim hiện tại
            var existingMovie = await _context.Movies.FindAsync(id);
            if (existingMovie == null)
            {
                return NotFound();
            }

            // Kiểm tra tên phim nếu có thay đổi
            if (movieDto.Title != null && existingMovie.Title != movieDto.Title)
            {
                // Kiểm tra xem đã có phim khác nào có tên giống không (không phân biệt chữ hoa/chữ thường)
                if (await _context.Movies.AnyAsync(m => m.Title.ToLower() == movieDto.Title.ToLower() && m.Id != id))
                {
                    return BadRequest("A movie with this title already exists");
                }

                // Cập nhật tiêu đề
                existingMovie.Title = movieDto.Title;
            }

            // Cập nhật các trường khác nếu được cung cấp
            if (movieDto.Description != null)
                existingMovie.Description = movieDto.Description;

            if (movieDto.Genre != null)
                existingMovie.Genre = movieDto.Genre;

            // Xử lý PosterUrl
            if (movieDto.PosterUrl != null && existingMovie.PosterUrl != movieDto.PosterUrl)
            {
                // Nếu có ảnh cũ thuộc uploads folder, xóa nó
                if (!string.IsNullOrEmpty(existingMovie.PosterUrl) &&
                    existingMovie.PosterUrl.Contains("/content/uploads/"))
                {
                    DeleteImageFile(existingMovie.PosterUrl);
                }

                // Cập nhật URL ảnh mới
                existingMovie.PosterUrl = movieDto.PosterUrl;
            }

            // Xử lý BackdropUrl
            if (movieDto.BackdropUrl != null && existingMovie.BackdropUrl != movieDto.BackdropUrl)
            {
                // Nếu có ảnh cũ thuộc uploads folder, xóa nó
                if (!string.IsNullOrEmpty(existingMovie.BackdropUrl) &&
                    existingMovie.BackdropUrl.Contains("/content/uploads/"))
                {
                    DeleteImageFile(existingMovie.BackdropUrl);
                }

                // Cập nhật URL ảnh mới
                existingMovie.BackdropUrl = movieDto.BackdropUrl;
            }

            if (movieDto.ReleaseDate.HasValue)
                existingMovie.ReleaseDate = movieDto.ReleaseDate.Value;

            if (movieDto.DurationMinutes.HasValue)
                existingMovie.DurationMinutes = movieDto.DurationMinutes.Value;

            if (movieDto.Rating.HasValue)
                existingMovie.Rating = movieDto.Rating.Value;

            // Cập nhật TrailerUrl với việc chuyển đổi sang định dạng nhúng
            if (movieDto.TrailerUrl != null)
                existingMovie.TrailerUrl = ConvertToEmbedUrl(movieDto.TrailerUrl); // Gọi phương thức chuyển đổi ở đây

            // Cập nhật thời gian theo múi giờ Việt Nam
            existingMovie.UpdatedAt = _timeZoneService.GetCurrentVietnamTimeAsUtc();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieExists(id))
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
                message = "Movie updated successfully",
                movieId = id,
                title = existingMovie.Title,
                updatedAt = existingMovie.UpdatedAt
            });
        }

        // DELETE: api/admin/movies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies
                .Include(m => m.Screenings)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
            {
                return NotFound();
            }

            // Kiểm tra xem phim có lịch chiếu sắp tới không
            var hasUpcomingScreenings = movie.Screenings
                .Any(s => s.StartTime > DateTime.UtcNow);

            if (hasUpcomingScreenings)
            {
                return BadRequest("Cannot delete movie with upcoming screenings");
            }

            // Xóa ảnh poster nếu có
            if (!string.IsNullOrEmpty(movie.PosterUrl) && movie.PosterUrl.Contains("/content/uploads/"))
            {
                DeleteImageFile(movie.PosterUrl);
            }

            // Xóa ảnh backdrop nếu có
            if (!string.IsNullOrEmpty(movie.BackdropUrl) && movie.BackdropUrl.Contains("/content/uploads/"))
            {
                DeleteImageFile(movie.BackdropUrl);
            }

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Movie deleted successfully",
                movieId = id,
                title = movie.Title
            });
        }

        // GET: api/admin/movies/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetMovieStatistics()
        {
            var totalMovies = await _context.Movies.CountAsync();
            var upcomingMovies = await _context.Movies.CountAsync(m => m.ReleaseDate > DateTime.UtcNow);

            // Phim có nhiều suất chiếu nhất
            var mostScreenedMovie = await _context.Movies
                .OrderByDescending(m => m.Screenings.Count)
                .Select(m => new { m.Id, m.Title, ScreeningCount = m.Screenings.Count })
                .FirstOrDefaultAsync();

            // Phim được đặt vé nhiều nhất
            var mostBookedMovie = await _context.Movies
                .OrderByDescending(m => m.Screenings.SelectMany(s => s.Bookings).Count(b => b.BookingStatus != "Cancelled"))
                .Select(m => new
                {
                    m.Id,
                    m.Title,
                    BookingCount = m.Screenings.SelectMany(s => s.Bookings).Count(b => b.BookingStatus != "Cancelled")
                })
                .FirstOrDefaultAsync();

            // Thống kê theo thể loại
            var genreStats = await _context.Movies
                .GroupBy(m => m.Genre)
                .Select(g => new { Genre = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .ToListAsync();

            return new
            {
                totalMovies,
                upcomingMovies,
                mostScreenedMovie,
                mostBookedMovie,
                genreStats
            };
        }

        // POST: api/admin/movies/bulk-upload
        [HttpPost("bulk-upload")]
        public async Task<ActionResult<IEnumerable<Movie>>> BulkUploadMovies(List<MovieCreateDTO> movieDtos)
        {
            if (movieDtos == null || !movieDtos.Any())
            {
                return BadRequest("No movies provided");
            }

            // Kiểm tra tên phim trùng lặp trong danh sách đang tải lên
            var duplicateInBatch = movieDtos
                .GroupBy(m => m.Title.ToLower())
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .FirstOrDefault();

            if (duplicateInBatch != null)
            {
                return BadRequest($"Duplicate movie title found in the upload batch: '{duplicateInBatch}'");
            }

            // Kiểm tra tên phim trùng lặp với phim đã có trong DB
            var existingTitles = await _context.Movies
                .Where(m => movieDtos.Select(nm => nm.Title.ToLower()).Contains(m.Title.ToLower()))
                .Select(m => m.Title)
                .ToListAsync();

            if (existingTitles.Any())
            {
                return BadRequest($"Movies with the following titles already exist: {string.Join(", ", existingTitles)}");
            }

            // Chuyển đổi từ DTO sang Movie và đặt thời gian tạo
            var vietnamNow = _timeZoneService.GetCurrentVietnamTimeAsUtc();
            var movies = movieDtos.Select(dto => new Movie
            {
                Title = dto.Title,
                Description = dto.Description,
                PosterUrl = dto.PosterUrl,
                BackdropUrl = dto.BackdropUrl,
                Genre = dto.Genre,
                ReleaseDate = dto.ReleaseDate,
                DurationMinutes = dto.DurationMinutes,
                Rating = dto.Rating,
                CreatedAt = vietnamNow,
                UpdatedAt = null
            }).ToList();

            _context.Movies.AddRange(movies);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"{movies.Count} movies uploaded successfully",
                movies = movies.Select(m => new
                {
                    m.Id,
                    m.Title,
                    m.Genre,
                    m.ReleaseDate,
                    m.CreatedAt
                })
            });
        }

        private bool MovieExists(int id)
        {
            return _context.Movies.Any(e => e.Id == id);
        }

        /// <summary>
        /// Xóa file hình ảnh từ thư mục uploads dựa trên URL
        /// </summary>
        /// <param name="imageUrl">URL của hình ảnh</param>
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

        // Chuyển đổi URL Youtube thành định dạng nhúng
        private string ConvertToEmbedUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return url; // Trả về null hoặc chuỗi rỗng nếu không có URL
            }

            // Kiểm tra xem URL có phải là định dạng YouTube không
            if (url.Contains("youtube.com/watch?v="))
            {
                // Chuyển đổi sang định dạng nhúng
                return url.Replace("watch?v=", "embed/");
            }

            return url; // Trả về URL gốc nếu không phải là YouTube
        }
    }
}
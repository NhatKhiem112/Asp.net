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

namespace CineTicket.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ScreeningsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TimeZoneService _timeZoneService;
        private readonly ScreeningService _screeningService;

        public ScreeningsController(
            ApplicationDbContext context,
            TimeZoneService timeZoneService,
            ScreeningService screeningService)
        {
            _context = context;
            _timeZoneService = timeZoneService;
            _screeningService = screeningService;
        }

        // GET: api/admin/screenings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScreeningResponseDTO>>> GetScreenings(
            [FromQuery] int? movieId = null,
            [FromQuery] int? cinemaId = null,
            [FromQuery] int? cinemaHallId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Update screening statuses before returning results
            await _screeningService.UpdateExpiredScreenings();

            var query = _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .AsQueryable();

            // Lọc theo phim
            if (movieId.HasValue)
            {
                query = query.Where(s => s.MovieId == movieId);
            }

            // Lọc theo rạp
            if (cinemaId.HasValue)
            {
                query = query.Where(s => s.CinemaHall.CinemaId == cinemaId);
            }

            // Lọc theo phòng chiếu
            if (cinemaHallId.HasValue)
            {
                query = query.Where(s => s.CinemaHallId == cinemaHallId);
            }

            // Lọc theo ngày bắt đầu
            if (startDate.HasValue)
            {
                DateTime filterStartDate = startDate.Value.Date;
                query = query.Where(s => s.StartTime >= filterStartDate);
            }

            // Lọc theo ngày kết thúc
            if (endDate.HasValue)
            {
                DateTime filterEndDate = endDate.Value.Date.AddDays(1).AddSeconds(-1); // End of the day
                query = query.Where(s => s.StartTime <= filterEndDate);
            }

            // Tính tổng số lịch chiếu
            var totalScreenings = await query.CountAsync();

            // Phân trang
            var screenings = await query
                .OrderBy(s => s.StartTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Lấy thông tin số ghế đã đặt cho mỗi suất chiếu
            var screeningIds = screenings.Select(s => s.Id).ToList();
            var bookedSeatsDict = await _context.BookingSeats
                .Where(bs => screeningIds.Contains(bs.Booking.ScreeningId) && bs.Booking.BookingStatus != "Cancelled")
                .GroupBy(bs => bs.Booking.ScreeningId)
                .ToDictionaryAsync(g => g.Key, g => g.Count());

            // Lấy số ghế trong mỗi phòng chiếu
            var hallIds = screenings.Select(s => s.CinemaHallId).Distinct().ToList();
            var seatsCountDict = await _context.Seats
                .Where(s => hallIds.Contains(s.CinemaHallId))
                .GroupBy(s => s.CinemaHallId)
                .ToDictionaryAsync(g => g.Key, g => g.Count());

            // Chuyển đổi từ Entity sang DTO để trả về dữ liệu gọn hơn
            var screeningDtos = screenings.Select(s => new ScreeningResponseDTO
            {
                Id = s.Id,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Price = s.Price,

                // Movie info
                MovieId = s.MovieId,
                MovieTitle = s.Movie.Title,
                PosterUrl = s.Movie.PosterUrl,
                DurationMinutes = s.Movie.DurationMinutes,

                // Cinema info
                CinemaHallId = s.CinemaHallId,
                CinemaHallName = s.CinemaHall.Name,
                HallType = s.CinemaHall.HallType,
                CinemaId = s.CinemaHall.CinemaId,
                CinemaName = s.CinemaHall.Cinema.Name,

                // Booking info
                BookedSeatsCount = bookedSeatsDict.ContainsKey(s.Id) ? bookedSeatsDict[s.Id] : 0,
                AvailableSeats = seatsCountDict.ContainsKey(s.CinemaHallId)
                    ? seatsCountDict[s.CinemaHallId] - (bookedSeatsDict.ContainsKey(s.Id) ? bookedSeatsDict[s.Id] : 0)
                    : null,

                // Audit info
                CreatedAt = s.CreatedAt
            }).ToList();

            // Thêm thông tin phân trang vào header
            Response.Headers["X-Total-Count"] = totalScreenings.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = Math.Ceiling((double)totalScreenings / pageSize).ToString();

            return screeningDtos;
        }

        // GET: api/admin/screenings/id
        [HttpGet("{id}")]
        public async Task<ActionResult<ScreeningResponseDTO>> GetScreening(int id)
        {
            // Update screening statuses before returning results
            await _screeningService.UpdateExpiredScreenings();

            var screening = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
            {
                return NotFound();
            }

            // Tính số ghế đã đặt cho suất chiếu
            var bookedSeatsCount = await _context.BookingSeats
                .Where(bs => bs.Booking.ScreeningId == id && bs.Booking.BookingStatus != "Cancelled")
                .CountAsync();

            // Lấy tổng số ghế trong phòng chiếu
            var totalSeats = await _context.Seats
                .Where(s => s.CinemaHallId == screening.CinemaHallId)
                .CountAsync();

            // Chuyển đổi từ Entity sang DTO
            var screeningDto = new ScreeningResponseDTO
            {
                Id = screening.Id,
                StartTime = screening.StartTime,
                EndTime = screening.EndTime,
                Price = screening.Price,

                // Movie info
                MovieId = screening.MovieId,
                MovieTitle = screening.Movie.Title,
                PosterUrl = screening.Movie.PosterUrl,
                DurationMinutes = screening.Movie.DurationMinutes,

                // Cinema info
                CinemaHallId = screening.CinemaHallId,
                CinemaHallName = screening.CinemaHall.Name,
                HallType = screening.CinemaHall.HallType,
                CinemaId = screening.CinemaHall.CinemaId,
                CinemaName = screening.CinemaHall.Cinema.Name,

                // Booking info
                BookedSeatsCount = bookedSeatsCount,
                AvailableSeats = totalSeats - bookedSeatsCount,

                // Audit info
                CreatedAt = screening.CreatedAt
            };

            return screeningDto;
        }

        // POST: api/admin/screenings
        [HttpPost]
        public async Task<ActionResult<ScreeningResponseDTO>> CreateScreening(AdminScreeningDTO screeningDTO)
        {
            // Kiểm tra phim tồn tại
            var movie = await _context.Movies.FindAsync(screeningDTO.MovieId);
            if (movie == null)
            {
                return BadRequest("Movie not found");
            }

            // Kiểm tra thời lượng phim phải lớn hơn 0
            if (movie.DurationMinutes <= 0)
            {
                return BadRequest($"Movie duration must be greater than 0 minutes. Current duration: {movie.DurationMinutes} minutes");
            }

            // Kiểm tra phòng chiếu tồn tại
            var cinemaHall = await _context.CinemaHalls.FindAsync(screeningDTO.CinemaHallId);
            if (cinemaHall == null)
            {
                return BadRequest("Cinema hall not found");
            }

            // Chúng ta sẽ giữ nguyên múi giờ Việt Nam và lưu vào database
            // Chuyển đổi thời gian nếu input không phải là giờ Việt Nam
            var vnStartTime = screeningDTO.StartTime;
            if (screeningDTO.StartTime.Kind == DateTimeKind.Utc)
            {
                vnStartTime = _timeZoneService.ConvertToVietnamTime(screeningDTO.StartTime);
            }

            // Đảm bảo Kind là Unspecified để tránh chuyển đổi khi lưu vào database
            var startTime = DateTime.SpecifyKind(vnStartTime, DateTimeKind.Unspecified);
            var endTime = startTime.AddMinutes(movie.DurationMinutes);

            // Kiểm tra thời gian bắt đầu không được nhỏ hơn thời gian hiện tại tại Việt Nam (UTC+7)
            var vietnamNow = _timeZoneService.GetCurrentVietnamTime();
            if (startTime <= vietnamNow)
            {
                return BadRequest($"Screening start time must be later than current time in Vietnam (UTC+7). Current time: {vietnamNow:yyyy-MM-dd HH:mm:ss}, Requested start time: {startTime:yyyy-MM-dd HH:mm:ss}");
            }

            Console.WriteLine($"Movie: {movie.Title}, Duration: {movie.DurationMinutes} minutes");
            Console.WriteLine($"Start Time (VN): {startTime}, End Time (VN): {endTime}");

            // Kiểm tra ngày chiếu phải sau hoặc bằng ngày phát hành phim
            if (startTime.Date < movie.ReleaseDate.Date)
            {
                return BadRequest($"Screening date must be on or after movie release date ({movie.ReleaseDate:yyyy-MM-dd})");
            }

            // Kiểm tra xung đột lịch chiếu trong cùng phòng
            var conflictingScreening = await _context.Screenings
                .FirstOrDefaultAsync(s =>
                    s.CinemaHallId == screeningDTO.CinemaHallId &&
                    ((s.StartTime <= startTime && s.EndTime > startTime) ||
                     (s.StartTime < endTime && s.EndTime >= endTime) ||
                     (s.StartTime >= startTime && s.EndTime <= endTime)));

            if (conflictingScreening != null)
            {
                return BadRequest($"Time conflict with existing screening: {conflictingScreening.Movie.Title} " +
                    $"({conflictingScreening.StartTime:yyyy-MM-dd HH:mm} - {conflictingScreening.EndTime:yyyy-MM-dd HH:mm})");
            }

            // Tạo lịch chiếu mới
            var screening = new Screening
            {
                MovieId = screeningDTO.MovieId,
                CinemaHallId = screeningDTO.CinemaHallId,
                StartTime = startTime,
                /* 
                 * EndTime là trường rất quan trọng trong hệ thống rạp chiếu phim vì:
                 * 1. Dùng để kiểm tra xung đột lịch chiếu giữa các suất trong cùng phòng
                 * 2. Quản lý việc phòng chiếu có đang được sử dụng hay không
                 * 3. Hỗ trợ nhân viên biết thời điểm phòng sẽ trống để chuẩn bị cho suất tiếp theo
                 * 4. Giúp tính toán thời gian dọn dẹp, chuẩn bị giữa các suất chiếu
                 * 5. Mặc dù người xem không thấy, nhưng hệ thống quản lý cần biết chính xác
                 */
                EndTime = endTime,
                Price = screeningDTO.Price,
                Status = "upcoming"
            };

            _context.Screenings.Add(screening);
            await _context.SaveChangesAsync();

            // Tải thêm thông tin phim và phòng chiếu cho response
            await _context.Entry(screening)
                .Reference(s => s.Movie)
                .LoadAsync();

            await _context.Entry(screening)
                .Reference(s => s.CinemaHall)
                .LoadAsync();

            await _context.Entry(screening.CinemaHall)
                .Reference(ch => ch.Cinema)
                .LoadAsync();

            // Lấy tổng số ghế trong phòng chiếu
            var totalSeats = await _context.Seats
                .Where(s => s.CinemaHallId == screening.CinemaHallId)
                .CountAsync();

            // Chuyển đổi thành DTO để response
            var responseDTO = new ScreeningResponseDTO
            {
                Id = screening.Id,
                StartTime = screening.StartTime,
                EndTime = screening.EndTime,
                Price = screening.Price,

                // Movie info
                MovieId = screening.MovieId,
                MovieTitle = screening.Movie.Title,
                PosterUrl = screening.Movie.PosterUrl,
                DurationMinutes = screening.Movie.DurationMinutes,

                // Cinema info
                CinemaHallId = screening.CinemaHallId,
                CinemaHallName = screening.CinemaHall.Name,
                HallType = screening.CinemaHall.HallType,
                CinemaId = screening.CinemaHall.CinemaId,
                CinemaName = screening.CinemaHall.Cinema.Name,

                // Booking info
                BookedSeatsCount = 0, // Mới tạo nên chưa có vé nào được đặt
                AvailableSeats = totalSeats,

                // Audit info
                CreatedAt = screening.CreatedAt
            };

            // Add success message
            var response = new
            {
                message = "Create screening successfully",
                screening = responseDTO
            };

            return CreatedAtAction(nameof(GetScreening), new { id = screening.Id }, response);
        }

        // PUT: api/admin/screenings/id
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateScreening(int id, ScreeningUpdateDTO updateDTO)
        {
            // Update screening statuses before proceeding
            await _screeningService.UpdateExpiredScreenings();

            var screening = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
            {
                return NotFound();
            }

            // Kiểm tra xem suất chiếu đã có đặt vé chưa
            var hasBookings = await _context.Bookings
                .AnyAsync(b => b.ScreeningId == id && b.BookingStatus != "Cancelled");

            if (hasBookings)
            {
                return BadRequest("Cannot update screening with existing bookings");
            }

            // Lấy thông tin movie hiện tại hoặc mới (nếu cập nhật)
            Movie movie;
            if (updateDTO.MovieId.HasValue && updateDTO.MovieId.Value != screening.MovieId)
            {
                movie = await _context.Movies.FindAsync(updateDTO.MovieId.Value);
                if (movie == null)
                {
                    return BadRequest("Movie not found");
                }

                // Kiểm tra thời lượng phim phải lớn hơn 0
                if (movie.DurationMinutes <= 0)
                {
                    return BadRequest($"Movie duration must be greater than 0 minutes. Current duration: {movie.DurationMinutes} minutes");
                }
            }
            else
            {
                // Sử dụng movie hiện tại nếu không cập nhật
                movie = screening.Movie;
            }

            // Lấy thông tin cinema hall hiện tại hoặc mới (nếu cập nhật)
            CinemaHall cinemaHall;
            if (updateDTO.CinemaHallId.HasValue && updateDTO.CinemaHallId.Value != screening.CinemaHallId)
            {
                cinemaHall = await _context.CinemaHalls.FindAsync(updateDTO.CinemaHallId.Value);
                if (cinemaHall == null)
                {
                    return BadRequest("Cinema hall not found");
                }
            }
            else
            {
                // Sử dụng cinema hall hiện tại nếu không cập nhật
                cinemaHall = screening.CinemaHall;
            }

            // Tính toán startTime và endTime
            DateTime startTime;
            if (updateDTO.StartTime.HasValue)
            {
                // Chuyển đổi thời gian nếu input không phải là giờ Việt Nam
                var vnStartTime = updateDTO.StartTime.Value;
                if (updateDTO.StartTime.Value.Kind == DateTimeKind.Utc)
                {
                    vnStartTime = _timeZoneService.ConvertToVietnamTime(updateDTO.StartTime.Value);
                }

                // Đảm bảo Kind là Unspecified để tránh chuyển đổi khi lưu vào database
                startTime = DateTime.SpecifyKind(vnStartTime, DateTimeKind.Unspecified);

                // Kiểm tra thời gian bắt đầu không được nhỏ hơn thời gian hiện tại tại Việt Nam (UTC+7)
                var vietnamNow = _timeZoneService.GetCurrentVietnamTime();
                if (startTime <= vietnamNow)
                {
                    return BadRequest($"Screening start time must be later than current time in Vietnam (UTC+7). Current time: {vietnamNow:yyyy-MM-dd HH:mm:ss}, Requested start time: {startTime:yyyy-MM-dd HH:mm:ss}");
                }
            }
            else
            {
                // Giữ nguyên startTime hiện tại nếu không cập nhật
                startTime = screening.StartTime;
            }

            // Tính toán endTime dựa trên thời lượng phim
            var endTime = startTime.AddMinutes(movie.DurationMinutes);

            // Kiểm tra ngày chiếu phải sau hoặc bằng ngày phát hành phim
            if (startTime.Date < movie.ReleaseDate.Date)
            {
                return BadRequest($"Screening date must be on or after movie release date ({movie.ReleaseDate:yyyy-MM-dd})");
            }

            // Kiểm tra xung đột lịch chiếu với các suất khác trong cùng phòng
            var newCinemaHallId = updateDTO.CinemaHallId ?? screening.CinemaHallId;
            var conflictingScreening = await _context.Screenings
                .FirstOrDefaultAsync(s =>
                    s.Id != id &&
                    s.CinemaHallId == newCinemaHallId &&
                    ((s.StartTime <= startTime && s.EndTime > startTime) ||
                     (s.StartTime < endTime && s.EndTime >= endTime) ||
                     (s.StartTime >= startTime && s.EndTime <= endTime)));

            if (conflictingScreening != null)
            {
                return BadRequest($"Time conflict with existing screening: {conflictingScreening.Movie.Title} " +
                    $"({conflictingScreening.StartTime:yyyy-MM-dd HH:mm} - {conflictingScreening.EndTime:yyyy-MM-dd HH:mm})");
            }

            // Danh sách các thay đổi đã áp dụng
            var changesApplied = new List<string>();

            // Cập nhật thông tin suất chiếu
            if (updateDTO.MovieId.HasValue && updateDTO.MovieId.Value != screening.MovieId)
            {
                screening.MovieId = updateDTO.MovieId.Value;
                changesApplied.Add($"Movie ID: {screening.MovieId} -> {updateDTO.MovieId.Value}");
            }

            if (updateDTO.CinemaHallId.HasValue && updateDTO.CinemaHallId.Value != screening.CinemaHallId)
            {
                screening.CinemaHallId = updateDTO.CinemaHallId.Value;
                changesApplied.Add($"Cinema Hall ID: {screening.CinemaHallId} -> {updateDTO.CinemaHallId.Value}");
            }

            if (updateDTO.StartTime.HasValue && updateDTO.StartTime.Value != screening.StartTime)
            {
                screening.StartTime = startTime;
                screening.EndTime = endTime;
                changesApplied.Add($"Time: {screening.StartTime:yyyy-MM-dd HH:mm} -> {startTime:yyyy-MM-dd HH:mm}");
            }

            if (updateDTO.Price.HasValue && updateDTO.Price.Value != screening.Price)
            {
                var oldPrice = screening.Price;
                screening.Price = updateDTO.Price.Value;
                changesApplied.Add($"Price: {oldPrice} -> {updateDTO.Price.Value}");
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScreeningExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Nếu không có thay đổi nào
            if (!changesApplied.Any())
            {
                return Ok(new { message = "No changes were made to the screening" });
            }

            // Trả về thông báo thành công với danh sách thay đổi
            return Ok(new
            {
                message = "Update screening successfully",
                changes = changesApplied
            });
        }

        // DELETE: api/admin/screenings/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<object>> DeleteScreening(int id)
        {
            // Update screening statuses before proceeding
            await _screeningService.UpdateExpiredScreenings();

            var screening = await _context.Screenings
                .Include(s => s.Movie)
                .Include(s => s.CinemaHall)
                    .ThenInclude(ch => ch.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
            {
                return NotFound(new { message = "Cannot find screening with the provided ID" });
            }

            // Kiểm tra xem suất chiếu có status là "expired" không
            if (screening.Status != "expired")
            {
                return BadRequest(new { message = "Only expired screenings can be deleted." });
            }

            // Lưu thông tin về screening trước khi xóa để trả về trong response
            var deletedInfo = new
            {
                Id = screening.Id,
                MovieTitle = screening.Movie.Title,
                CinemaName = screening.CinemaHall.Cinema.Name,
                HallName = screening.CinemaHall.Name,
                StartTime = screening.StartTime.ToString("yyyy-MM-dd HH:mm"),
                Price = screening.Price,
                Status = screening.Status
            };

            _context.Screenings.Remove(screening);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Screening deleted successfully",
                deletedScreening = deletedInfo
            });
        }

        // POST: api/admin/screenings/bulk-create
        [HttpPost("bulk-create")]
        public async Task<ActionResult<object>> BulkCreateScreenings(BulkScreeningDTO bulkDto)
        {
            // Update screening statuses before proceeding
            await _screeningService.UpdateExpiredScreenings();

            // Kiểm tra phim tồn tại
            var movie = await _context.Movies.FindAsync(bulkDto.MovieId);
            if (movie == null)
            {
                return BadRequest("Movie not found");
            }

            // Kiểm tra thời lượng phim phải lớn hơn 0
            if (movie.DurationMinutes <= 0)
            {
                return BadRequest($"Movie duration must be greater than 0 minutes. Current duration: {movie.DurationMinutes} minutes");
            }

            // Kiểm tra phòng chiếu tồn tại
            var cinemaHall = await _context.CinemaHalls
                .Include(ch => ch.Cinema)
                .FirstOrDefaultAsync(ch => ch.Id == bulkDto.CinemaHallId);

            if (cinemaHall == null)
            {
                return BadRequest("Cinema hall not found");
            }

            // Kiểm tra ngày bắt đầu phải sau hoặc bằng ngày phát hành phim
            if (bulkDto.StartDate.Date < movie.ReleaseDate.Date)
            {
                return BadRequest($"Screening dates must be on or after movie release date ({movie.ReleaseDate:yyyy-MM-dd})");
            }

            // Lấy thời gian hiện tại tại Việt Nam (UTC+7)
            var vietnamNow = _timeZoneService.GetCurrentVietnamTime();

            var newScreenings = new List<Screening>();
            var conflicts = new List<string>();
            var pastTimeWarnings = new List<string>();

            // Tạo suất chiếu cho mỗi ngày trong phạm vi
            for (var date = bulkDto.StartDate.Date; date <= bulkDto.EndDate.Date; date = date.AddDays(1))
            {
                // Kiểm tra ngày có >= ngày phát hành không
                if (date.Date < movie.ReleaseDate.Date)
                {
                    continue; // Bỏ qua những ngày trước ngày phát hành
                }

                // Kiểm tra những ngày trong tuần có được chọn không
                var dayOfWeek = (int)date.DayOfWeek;
                if (!bulkDto.DaysOfWeek.Contains(dayOfWeek))
                {
                    continue;
                }

                // Tạo suất chiếu cho mỗi thời gian trong ngày
                foreach (var time in bulkDto.ShowTimes)
                {
                    // Tạo thời gian bắt đầu kết hợp ngày và giờ
                    var showDateTime = date.Add(time.TimeOfDay);

                    // Đảm bảo Kind là Unspecified để tránh chuyển đổi khi lưu vào database
                    var startTime = DateTime.SpecifyKind(showDateTime, DateTimeKind.Unspecified);
                    var endTime = startTime.AddMinutes(movie.DurationMinutes);

                    // Kiểm tra thời gian bắt đầu không được nhỏ hơn thời gian hiện tại tại Việt Nam (UTC+7)
                    if (startTime <= vietnamNow)
                    {
                        pastTimeWarnings.Add($"{startTime:yyyy-MM-dd HH:mm} is earlier than the current time in Vietnam ({vietnamNow:yyyy-MM-dd HH:mm:ss})");
                        continue;
                    }

                    // Kiểm tra xung đột lịch chiếu
                    var conflictingScreening = await _context.Screenings
                        .Include(s => s.Movie)
                        .FirstOrDefaultAsync(s =>
                            s.CinemaHallId == bulkDto.CinemaHallId &&
                            ((s.StartTime <= startTime && s.EndTime > startTime) ||
                             (s.StartTime < endTime && s.EndTime >= endTime) ||
                             (s.StartTime >= startTime && s.EndTime <= endTime)));

                    if (conflictingScreening != null)
                    {
                        conflicts.Add($"{showDateTime:yyyy-MM-dd HH:mm} conflicts with {conflictingScreening.Movie.Title} " +
                            $"({conflictingScreening.StartTime:yyyy-MM-dd HH:mm})");
                        continue;
                    }

                    // Tạo screening mới
                    var screening = new Screening
                    {
                        MovieId = bulkDto.MovieId,
                        CinemaHallId = bulkDto.CinemaHallId,
                        StartTime = startTime,
                        EndTime = endTime, // EndTime rất cần thiết để hệ thống biết khi nào phòng sẽ rảnh
                        Price = bulkDto.Price,
                        Status = "upcoming"
                    };

                    newScreenings.Add(screening);
                }
            }

            // Kiểm tra nếu có những lịch chiếu đã qua thời gian hiện tại
            if (pastTimeWarnings.Any())
            {
                return BadRequest(new
                {
                    Message = "Cannot create screenings with start times in the past",
                    PastTimeWarnings = pastTimeWarnings
                });
            }

            // Nếu có xung đột, trả về lỗi
            if (conflicts.Any())
            {
                return BadRequest(new
                {
                    Message = "There are time conflicts with existing screenings",
                    Conflicts = conflicts
                });
            }

            // Lưu vào database
            _context.Screenings.AddRange(newScreenings);
            await _context.SaveChangesAsync();

            // Nhóm suất chiếu theo ngày để hiển thị tóm tắt ngắn gọn
            var screeningsByDate = newScreenings
                .GroupBy(s => s.StartTime.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count(),
                    Times = g.Select(s => s.StartTime.ToString("HH:mm")).OrderBy(t => t).ToList()
                })
                .OrderBy(g => g.Date)
                .ToList();

            // Tạo thông tin tóm tắt
            var firstId = newScreenings.Min(s => s.Id);
            var lastId = newScreenings.Max(s => s.Id);
            var dateRange = $"{bulkDto.StartDate:yyyy-MM-dd} - {bulkDto.EndDate:yyyy-MM-dd}";

            return Ok(new
            {
                Message = $"Successfully created {newScreenings.Count} screenings",
                MovieTitle = movie.Title,
                CinemaName = cinemaHall.Cinema.Name,
                CinemaHallName = cinemaHall.Name,
                Price = bulkDto.Price,
                DateRange = dateRange,
                IdRange = $"{firstId} - {lastId}",
                ScreeningCount = newScreenings.Count,
                DetailsByDate = screeningsByDate,
                ShowTimes = bulkDto.ShowTimes.Select(t => t.ToString("HH:mm")).OrderBy(t => t).ToList(),
                DaysOfWeek = bulkDto.DaysOfWeek.Select(d => new
                {
                    DayNumber = d,
                    DayName = ((DayOfWeek)d).ToString()
                }).ToList()
            });
        }

        // GET: api/admin/screenings/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetScreeningStatistics()
        {
            // Update screening statuses before proceeding
            await _screeningService.UpdateExpiredScreenings();

            var now = DateTime.UtcNow;
            var today = now.Date;
            var lastMonth = now.AddMonths(-1);

            // Tổng số suất chiếu
            var totalScreenings = await _context.Screenings.CountAsync();

            // Suất chiếu đã qua và sắp tới
            var pastScreenings = await _context.Screenings.CountAsync(s => s.EndTime < now);
            var upcomingScreenings = await _context.Screenings.CountAsync(s => s.StartTime > now);

            // Suất chiếu đã có người đặt vé
            var bookedScreenings = await _context.Screenings
                .CountAsync(s => s.Bookings.Any(b => b.BookingStatus != "Cancelled"));

            // Tổng số vé đã bán
            var soldTicketsCount = await _context.BookingSeats
                .Where(bs => bs.Booking.BookingStatus != "Cancelled")
                .CountAsync();

            // Tính toán tổng doanh thu từ các suất chiếu
            var totalRevenue = await _context.Bookings
                .Where(b => b.PaymentStatus == "Completed")
                .SumAsync(b => b.TotalAmount);

            // Thống kê theo thời gian
            var bookingsToday = await _context.Bookings
                .CountAsync(b => b.CreatedAt >= today);

            return new
            {
                totalScreenings,
                pastScreenings,
                upcomingScreenings,
                bookedScreenings,
                soldTicketsCount,
                totalRevenue,
                bookingsToday
            };
        }

        private bool ScreeningExists(int id)
        {
            return _context.Screenings.Any(e => e.Id == id);
        }
    }
}
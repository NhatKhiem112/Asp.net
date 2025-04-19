using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CineTicket.API.Data;
using CineTicket.API.Models;

namespace CineTicket.API.Services
{
    public class ScreeningService
    {
        private readonly ApplicationDbContext _context;
        private readonly TimeZoneService _timeZoneService;
        private readonly ILogger<ScreeningService> _logger;

        public ScreeningService(
            ApplicationDbContext context,
            TimeZoneService timeZoneService,
            ILogger<ScreeningService> logger)
        {
            _context = context;
            _timeZoneService = timeZoneService;
            _logger = logger;
        }

        /// <summary>
        /// Updates the status of screenings that started more than 15 minutes ago to "expired"
        /// </summary>
        /// <returns>The number of screenings that were updated</returns>
        public async Task<int> UpdateExpiredScreenings()
        {
            // Lấy thời gian hiện tại ở Việt Nam
            var currentVietnamTime = _timeZoneService.GetCurrentVietnamTime();
            _logger.LogInformation($"Checking for expired screenings at: {currentVietnamTime:yyyy-MM-dd HH:mm:ss}");

            // Get all upcoming screenings
            var upcomingScreenings = await _context.Screenings
                .Where(s => s.Status == "upcoming")
                .ToListAsync();

            _logger.LogInformation($"Found {upcomingScreenings.Count} upcoming screenings to check");

            int updatedCount = 0;

            // Update screenings that have started more than 15 minutes ago
            foreach (var screening in upcomingScreenings)
            {
                // IMPORTANT: Không chuyển đổi thời gian từ CSDL, vì nó đã là giờ Việt Nam
                var screeningStartTime = screening.StartTime;
                var timeDifference = (currentVietnamTime - screeningStartTime).TotalMinutes;

                _logger.LogInformation($"Screening ID: {screening.Id}, Start Time: {screeningStartTime:yyyy-MM-dd HH:mm:ss}, " +
                    $"Current Time: {currentVietnamTime:yyyy-MM-dd HH:mm:ss}, Time Difference: {timeDifference:F2} minutes");

                if (timeDifference >= 15)
                {
                    _logger.LogWarning($"Updating screening ID: {screening.Id} to expired status (time difference: {timeDifference:F2} minutes)");
                    screening.Status = "expired";
                    _context.Entry(screening).State = EntityState.Modified;
                    updatedCount++;
                }
            }

            // Save changes if any screenings were updated
            if (updatedCount > 0)
            {
                _logger.LogInformation($"Saving {updatedCount} expired screenings to database");
                await _context.SaveChangesAsync();
            }
            else
            {
                _logger.LogInformation("No screenings needed to be updated");
            }

            return updatedCount;
        }
    }
}
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CineTicket.API.Services
{
    public class ScreeningStatusUpdateService : BackgroundService
    {
        private readonly ILogger<ScreeningStatusUpdateService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1); // Check every minute

        public ScreeningStatusUpdateService(
            ILogger<ScreeningStatusUpdateService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Screening Status Update Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Create a new scope to resolve scoped services
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var screeningService = scope.ServiceProvider.GetRequiredService<ScreeningService>();
                        int updatedCount = await screeningService.UpdateExpiredScreenings();

                        if (updatedCount > 0)
                        {
                            _logger.LogInformation("Updated {count} screenings to 'expired' status", updatedCount);
                        }
                        else
                        {
                            _logger.LogDebug("No screenings to update at: {time}", DateTimeOffset.Now);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while updating screening statuses");
                }

                // Wait for the next check interval
                await Task.Delay(_checkInterval, stoppingToken);
            }
        }
    }
}
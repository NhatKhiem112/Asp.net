using CineTicket.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace CineTicket.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options,
                                   IHttpContextAccessor? httpContextAccessor = null) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<Movie> Movies { get; set; } = null!;
        public DbSet<Cinema> Cinemas { get; set; } = null!;
        public DbSet<CinemaHall> CinemaHalls { get; set; } = null!;
        public DbSet<Seat> Seats { get; set; } = null!;
        public DbSet<Screening> Screenings { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<BookingSeat> BookingSeats { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the many-to-many relationship between Booking and Seat
            modelBuilder.Entity<BookingSeat>()
                .HasOne(bs => bs.Booking)
                .WithMany(b => b.BookingSeats)
                .HasForeignKey(bs => bs.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BookingSeat>()
                .HasOne(bs => bs.Seat)
                .WithMany(s => s.BookingSeats)
                .HasForeignKey(bs => bs.SeatId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete from both sides

            // Add unique email constraint for users
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Add unique constraints for Cinema name and address
            modelBuilder.Entity<Cinema>()
                .HasIndex(c => c.Name)
                .IsUnique();

            modelBuilder.Entity<Cinema>()
                .HasIndex(c => c.Address)
                .IsUnique();

            // Configure CreatedBy and UpdatedBy relationships for Movie
            modelBuilder.Entity<Movie>()
                .HasOne(m => m.CreatedBy)
                .WithMany()
                .HasForeignKey(m => m.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movie>()
                .HasOne(m => m.UpdatedBy)
                .WithMany()
                .HasForeignKey(m => m.UpdatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure CreatedBy and UpdatedBy relationships for Cinema
            modelBuilder.Entity<Cinema>()
                .HasOne(c => c.CreatedBy)
                .WithMany()
                .HasForeignKey(c => c.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Cinema>()
                .HasOne(c => c.UpdatedBy)
                .WithMany()
                .HasForeignKey(c => c.UpdatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure CreatedBy and UpdatedBy relationships for CinemaHall
            modelBuilder.Entity<CinemaHall>()
                .HasOne(ch => ch.CreatedBy)
                .WithMany()
                .HasForeignKey(ch => ch.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CinemaHall>()
                .HasOne(ch => ch.UpdatedBy)
                .WithMany()
                .HasForeignKey(ch => ch.UpdatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure CreatedBy and UpdatedBy relationships for Seat
            modelBuilder.Entity<Seat>()
                .HasOne(s => s.CreatedBy)
                .WithMany()
                .HasForeignKey(s => s.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Seat>()
                .HasOne(s => s.UpdatedBy)
                .WithMany()
                .HasForeignKey(s => s.UpdatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure CreatedBy and UpdatedBy relationships for Screening
            modelBuilder.Entity<Screening>()
                .HasOne(s => s.CreatedBy)
                .WithMany()
                .HasForeignKey(s => s.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Screening>()
                .HasOne(s => s.UpdatedBy)
                .WithMany()
                .HasForeignKey(s => s.UpdatedById)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditableEntities();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            UpdateAuditableEntities();
            return base.SaveChanges();
        }

        private void UpdateAuditableEntities()
        {
            // Sử dụng múi giờ Việt Nam với thời gian hiện tại
            var now = DateTime.Now; // Đã là giờ địa phương, không cần chuyển đổi

            // Đảm bảo loại thời gian là Unspecified để tránh các chuyển đổi tự động
            now = DateTime.SpecifyKind(now, DateTimeKind.Unspecified);

            int? userId = null;

            // Lấy ID người dùng từ HttpContext nếu có
            if (_httpContextAccessor != null)
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int parsedUserId))
                {
                    userId = parsedUserId;
                }
            }

            // Xử lý các entity implement IAuditableEntity
            foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedById = userId;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedById = userId;
                }
            }

            // Xử lý BookingSeat chỉ có CreatedAt
            foreach (var entry in ChangeTracker.Entries<BookingSeat>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                }
            }
        }
    }
}
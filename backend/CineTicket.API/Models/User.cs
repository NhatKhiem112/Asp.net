using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CineTicket.API.Models
{
    public class User : IAuditableEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public int? CreatedById { get; set; }

        public int? UpdatedById { get; set; }

        [MaxLength(50)]
        public string Role { get; set; } = "User"; // User, Admin

        // Navigation properties
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
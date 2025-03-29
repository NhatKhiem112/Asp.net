using HoNhatKhiem_2122110113.Model;
using Microsoft.EntityFrameworkCore;

namespace HoNhatKhiem_2122110113.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
    }
}
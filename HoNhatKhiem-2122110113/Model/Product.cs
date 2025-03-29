namespace HoNhatKhiem_2122110113.Model
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double price { get; set; }
        public string Image { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        // Khóa ngoại cho Brand
        public int BrandId { get; set; }
        public Brand Brand { get; set; }
    }
}

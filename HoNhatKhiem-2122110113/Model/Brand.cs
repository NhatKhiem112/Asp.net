namespace HoNhatKhiem_2122110113.Model
{
    public class Brand
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Mối quan hệ 1-N: Một Brand có nhiều Products
        public List<Product> Products { get; set; }
    }
}

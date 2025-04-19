using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineTicket.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateScreeningPriceForVND : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Screenings",
                type: "decimal(10,0)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(6,2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Screenings",
                type: "decimal(6,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,0)");
        }
    }
}

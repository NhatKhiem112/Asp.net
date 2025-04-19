using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineTicket.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCinemaUniqueConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Cinemas_Address",
                table: "Cinemas",
                column: "Address",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cinemas_Name",
                table: "Cinemas",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cinemas_Address",
                table: "Cinemas");

            migrationBuilder.DropIndex(
                name: "IX_Cinemas_Name",
                table: "Cinemas");
        }
    }
}

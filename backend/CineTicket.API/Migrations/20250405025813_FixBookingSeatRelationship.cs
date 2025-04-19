using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineTicket.API.Migrations
{
    /// <inheritdoc />
    public partial class FixBookingSeatRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingSeat");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookingSeat",
                columns: table => new
                {
                    BookingsId = table.Column<int>(type: "int", nullable: false),
                    SeatsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingSeat", x => new { x.BookingsId, x.SeatsId });
                    table.ForeignKey(
                        name: "FK_BookingSeat_Bookings_BookingsId",
                        column: x => x.BookingsId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookingSeat_Seats_SeatsId",
                        column: x => x.SeatsId,
                        principalTable: "Seats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_BookingSeat_SeatsId",
                table: "BookingSeat",
                column: "SeatsId");
        }
    }
}

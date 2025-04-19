using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineTicket.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditableFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateRegistered",
                table: "Users",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "BookingTime",
                table: "Bookings",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Seats",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Seats",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Seats",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Seats",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Screenings",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Screenings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Screenings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Screenings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Movies",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Movies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Movies",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Movies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Cinemas",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Cinemas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Cinemas",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Cinemas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "CinemaHalls",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "CinemaHalls",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "CinemaHalls",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "CinemaHalls",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "BookingSeats",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Bookings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Seats_CreatedById",
                table: "Seats",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Seats_UpdatedById",
                table: "Seats",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Screenings_CreatedById",
                table: "Screenings",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Screenings_UpdatedById",
                table: "Screenings",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Movies_CreatedById",
                table: "Movies",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Movies_UpdatedById",
                table: "Movies",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Cinemas_CreatedById",
                table: "Cinemas",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Cinemas_UpdatedById",
                table: "Cinemas",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CinemaHalls_CreatedById",
                table: "CinemaHalls",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CinemaHalls_UpdatedById",
                table: "CinemaHalls",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_CinemaHalls_Users_CreatedById",
                table: "CinemaHalls",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CinemaHalls_Users_UpdatedById",
                table: "CinemaHalls",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Cinemas_Users_CreatedById",
                table: "Cinemas",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Cinemas_Users_UpdatedById",
                table: "Cinemas",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Movies_Users_CreatedById",
                table: "Movies",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Movies_Users_UpdatedById",
                table: "Movies",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Screenings_Users_CreatedById",
                table: "Screenings",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Screenings_Users_UpdatedById",
                table: "Screenings",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Seats_Users_CreatedById",
                table: "Seats",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Seats_Users_UpdatedById",
                table: "Seats",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CinemaHalls_Users_CreatedById",
                table: "CinemaHalls");

            migrationBuilder.DropForeignKey(
                name: "FK_CinemaHalls_Users_UpdatedById",
                table: "CinemaHalls");

            migrationBuilder.DropForeignKey(
                name: "FK_Cinemas_Users_CreatedById",
                table: "Cinemas");

            migrationBuilder.DropForeignKey(
                name: "FK_Cinemas_Users_UpdatedById",
                table: "Cinemas");

            migrationBuilder.DropForeignKey(
                name: "FK_Movies_Users_CreatedById",
                table: "Movies");

            migrationBuilder.DropForeignKey(
                name: "FK_Movies_Users_UpdatedById",
                table: "Movies");

            migrationBuilder.DropForeignKey(
                name: "FK_Screenings_Users_CreatedById",
                table: "Screenings");

            migrationBuilder.DropForeignKey(
                name: "FK_Screenings_Users_UpdatedById",
                table: "Screenings");

            migrationBuilder.DropForeignKey(
                name: "FK_Seats_Users_CreatedById",
                table: "Seats");

            migrationBuilder.DropForeignKey(
                name: "FK_Seats_Users_UpdatedById",
                table: "Seats");

            migrationBuilder.DropIndex(
                name: "IX_Seats_CreatedById",
                table: "Seats");

            migrationBuilder.DropIndex(
                name: "IX_Seats_UpdatedById",
                table: "Seats");

            migrationBuilder.DropIndex(
                name: "IX_Screenings_CreatedById",
                table: "Screenings");

            migrationBuilder.DropIndex(
                name: "IX_Screenings_UpdatedById",
                table: "Screenings");

            migrationBuilder.DropIndex(
                name: "IX_Movies_CreatedById",
                table: "Movies");

            migrationBuilder.DropIndex(
                name: "IX_Movies_UpdatedById",
                table: "Movies");

            migrationBuilder.DropIndex(
                name: "IX_Cinemas_CreatedById",
                table: "Cinemas");

            migrationBuilder.DropIndex(
                name: "IX_Cinemas_UpdatedById",
                table: "Cinemas");

            migrationBuilder.DropIndex(
                name: "IX_CinemaHalls_CreatedById",
                table: "CinemaHalls");

            migrationBuilder.DropIndex(
                name: "IX_CinemaHalls_UpdatedById",
                table: "CinemaHalls");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Seats");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Seats");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Seats");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Seats");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Screenings");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Screenings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Screenings");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Screenings");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Cinemas");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Cinemas");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Cinemas");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Cinemas");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "CinemaHalls");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "CinemaHalls");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "CinemaHalls");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "CinemaHalls");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "BookingSeats");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Bookings");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Users",
                newName: "DateRegistered");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Bookings",
                newName: "BookingTime");
        }
    }
}

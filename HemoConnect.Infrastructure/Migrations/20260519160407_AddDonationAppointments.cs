using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HemoConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationAppointments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalDonations",
                table: "DonorProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "DonationAppointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirebaseUid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransfusionCenterId = table.Column<int>(type: "int", nullable: false),
                    AppointmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationAppointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonationAppointments_TransfusionCenters_TransfusionCenterId",
                        column: x => x.TransfusionCenterId,
                        principalTable: "TransfusionCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DonationAppointments_TransfusionCenterId",
                table: "DonationAppointments",
                column: "TransfusionCenterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DonationAppointments");

            migrationBuilder.DropColumn(
                name: "TotalDonations",
                table: "DonorProfiles");
        }
    }
}

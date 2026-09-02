using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HemoConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGenderToDonor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Gender",
                table: "DonorProfiles",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Gender",
                table: "DonorProfiles");
        }
    }
}

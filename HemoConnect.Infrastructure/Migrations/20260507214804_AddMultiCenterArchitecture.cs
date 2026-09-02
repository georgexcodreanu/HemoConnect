using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HemoConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiCenterArchitecture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HospitalId",
                table: "UserAccounts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TransfusionCenterId",
                table: "UserAccounts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "TransfusionCenters",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "TransfusionCenters",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Hospitals",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Hospitals",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_HospitalId",
                table: "UserAccounts",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_TransfusionCenterId",
                table: "UserAccounts",
                column: "TransfusionCenterId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAccounts_Hospitals_HospitalId",
                table: "UserAccounts",
                column: "HospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAccounts_TransfusionCenters_TransfusionCenterId",
                table: "UserAccounts",
                column: "TransfusionCenterId",
                principalTable: "TransfusionCenters",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAccounts_Hospitals_HospitalId",
                table: "UserAccounts");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAccounts_TransfusionCenters_TransfusionCenterId",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_HospitalId",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_TransfusionCenterId",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "HospitalId",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "TransfusionCenterId",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "TransfusionCenters");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "TransfusionCenters");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Hospitals");
        }
    }
}

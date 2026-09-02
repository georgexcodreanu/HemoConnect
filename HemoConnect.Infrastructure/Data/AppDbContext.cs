using Microsoft.EntityFrameworkCore;
using HemoConnect.Domain.Entities;

namespace HemoConnect.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Hospital> Hospitals { get; set; }
    public DbSet<TransfusionCenter> TransfusionCenters { get; set; }
    public DbSet<BloodBag> BloodBags { get; set; }
    public DbSet<BloodRequest> BloodRequests { get; set; }
    public DbSet<Allocation> Allocations { get; set; }
    public DbSet<DonorProfile> DonorProfiles { get; set; }
    public DbSet<UserAccount> UserAccounts { get; set; }
    public DbSet<DonationAppointment> DonationAppointments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<DonorProfile>()
            .HasIndex(d => d.FirebaseUid)
            .IsUnique();

        modelBuilder.Entity<UserAccount>()
            .HasIndex(u => u.FirebaseUid)
            .IsUnique();
    }
}

using System;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Domain.Entities;

public class DonorProfile
{
    public int Id { get; set; }

    public string FirebaseUid { get; set; } = null!;

    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
    
    public DateTime DateOfBirth { get; set; }
    public DateTime? LastDonationDate { get; set; }
    
    public bool IsEligible { get; set; } = true;
    public int TotalDonations { get; set; } = 0;
    public Gender? Gender { get; set; }
}

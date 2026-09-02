using System;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Domain.Entities;

public class BloodBag
{
    public int Id { get; set; }
    
    public int TransfusionCenterId { get; set; }
    public TransfusionCenter TransfusionCenter { get; set; } = null!;

    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
    
    public DateTime DonationDate { get; set; }
    public DateTime ExpirationDate { get; set; }
    
    public BagStatus Status { get; set; } = BagStatus.Available;

    // Navigation property for potential allocation
    public Allocation? Allocation { get; set; }
}

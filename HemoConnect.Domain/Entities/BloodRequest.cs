using System;
using System.Collections.Generic;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Domain.Entities;

public class BloodRequest
{
    public int Id { get; set; }

    public int HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;

    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
    
    public int RequiredQuantity { get; set; }
    
    public int PatientSeverityScore { get; set; }
    
    public UrgencyLevel UrgencyLevel { get; set; }
    
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    
    public DateTime RequestDate { get; set; }

    public ICollection<Allocation> Allocations { get; set; } = new List<Allocation>();
}

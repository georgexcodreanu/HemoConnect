using System;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Application.DTOs;

public class PrioritizedRequestDto
{
    public int RequestId { get; set; }
    public string HospitalName { get; set; } = string.Empty;
    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
    public int RequiredQuantity { get; set; }
    public UrgencyLevel UrgencyLevel { get; set; }
    public int PatientSeverityScore { get; set; }
    public DateTime RequestDate { get; set; }
    
    public double PriorityScore { get; set; }
}

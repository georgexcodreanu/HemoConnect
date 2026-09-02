using System;

namespace HemoConnect.Domain.Entities;

public class Allocation
{
    public int Id { get; set; }

    public int BloodRequestId { get; set; }
    public BloodRequest BloodRequest { get; set; } = null!;

    public int BloodBagId { get; set; }
    public BloodBag BloodBag { get; set; } = null!;

    public DateTime AllocationDate { get; set; }
}

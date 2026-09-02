using System;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Domain.Entities;

public class DonationAppointment
{
    public int Id { get; set; }
    
    public string FirebaseUid { get; set; } = null!;
    
    public int TransfusionCenterId { get; set; }
    public TransfusionCenter TransfusionCenter { get; set; } = null!;
    
    public DateTime AppointmentDate { get; set; }
    
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
}

namespace HemoConnect.Domain.Entities;

public class UserAccount
{
    public int Id { get; set; }
    public string FirebaseUid { get; set; } = null!;
    public string Role { get; set; } = null!; // "Donor", "MedicalStaff", "Admin"
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    public int? HospitalId { get; set; }
    public Hospital? Hospital { get; set; }
    
    public int? TransfusionCenterId { get; set; }
    public TransfusionCenter? TransfusionCenter { get; set; }
}

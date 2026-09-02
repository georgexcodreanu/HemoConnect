namespace HemoConnect.Domain.Entities;

public class Hospital
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public ICollection<BloodRequest> BloodRequests { get; set; } = new List<BloodRequest>();
}

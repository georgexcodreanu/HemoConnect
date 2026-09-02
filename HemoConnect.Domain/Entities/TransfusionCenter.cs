namespace HemoConnect.Domain.Entities;

public class TransfusionCenter
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public ICollection<BloodBag> BloodBags { get; set; } = new List<BloodBag>();
}

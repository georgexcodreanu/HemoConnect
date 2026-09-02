using System;
using System.Collections.Generic;
using System.Linq;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Infrastructure.Data;

public static class DataSeeder
{
    public static void Seed(AppDbContext context)
    {
        // Ne asigurăm că baza de date există
        context.Database.EnsureCreated();

        // Dacă există deja spitale, înseamnă că am mai rulat seeder-ul
        if (context.Hospitals.Any())
            return;

        // 1. Inserare Spitale
        var hospitals = new List<Hospital>
        {
            new Hospital { Name = "Spitalul Universitar de Urgență", Location = "București" },
            new Hospital { Name = "Spitalul Clinic Județean", Location = "Cluj-Napoca" }
        };
        context.Hospitals.AddRange(hospitals);
        context.SaveChanges(); // Salvăm ca să primim ID-urile generate

        // 2. Inserare Centre de Transfuzie
        var centers = new List<TransfusionCenter>
        {
            new TransfusionCenter { Name = "Centrul de Transfuzie Sanguină", Location = "București" },
            new TransfusionCenter { Name = "Centrul Regional de Transfuzie", Location = "Cluj-Napoca" }
        };
        context.TransfusionCenters.AddRange(centers);
        context.SaveChanges();

        // 3. Inserare Pungi de Sânge (10 pungi)
        var today = DateTime.UtcNow;
        var bloodBags = new List<BloodBag>
        {
            new BloodBag { TransfusionCenterId = centers[0].Id, BloodType = BloodType.O, RhFactor = RhFactor.Positive, DonationDate = today.AddDays(-5), ExpirationDate = today.AddDays(30), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[0].Id, BloodType = BloodType.O, RhFactor = RhFactor.Positive, DonationDate = today.AddDays(-2), ExpirationDate = today.AddDays(33), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[0].Id, BloodType = BloodType.A, RhFactor = RhFactor.Positive, DonationDate = today.AddDays(-10), ExpirationDate = today.AddDays(25), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[0].Id, BloodType = BloodType.AB, RhFactor = RhFactor.Negative, DonationDate = today.AddDays(-1), ExpirationDate = today.AddDays(34), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[0].Id, BloodType = BloodType.B, RhFactor = RhFactor.Positive, DonationDate = today.AddDays(-15), ExpirationDate = today.AddDays(20), Status = BagStatus.Available },
            
            new BloodBag { TransfusionCenterId = centers[1].Id, BloodType = BloodType.O, RhFactor = RhFactor.Negative, DonationDate = today.AddDays(-3), ExpirationDate = today.AddDays(32), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[1].Id, BloodType = BloodType.A, RhFactor = RhFactor.Positive, DonationDate = today.AddDays(-12), ExpirationDate = today.AddDays(23), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[1].Id, BloodType = BloodType.A, RhFactor = RhFactor.Negative, DonationDate = today.AddDays(-8), ExpirationDate = today.AddDays(27), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[1].Id, BloodType = BloodType.B, RhFactor = RhFactor.Positive, DonationDate = today.AddDays(-2), ExpirationDate = today.AddDays(33), Status = BagStatus.Available },
            new BloodBag { TransfusionCenterId = centers[1].Id, BloodType = BloodType.O, RhFactor = RhFactor.Positive, DonationDate = today.AddDays(-20), ExpirationDate = today.AddDays(15), Status = BagStatus.Available }
        };
        context.BloodBags.AddRange(bloodBags);
        context.SaveChanges();

        // 4. Inserare Cereri (3 cereri diferite)
        var requests = new List<BloodRequest>
        {
            new BloodRequest { HospitalId = hospitals[0].Id, BloodType = BloodType.A, RhFactor = RhFactor.Positive, RequiredQuantity = 3, UrgencyLevel = UrgencyLevel.Critical, PatientSeverityScore = 9, RequestDate = today.AddHours(-1), Status = RequestStatus.Pending },
            new BloodRequest { HospitalId = hospitals[1].Id, BloodType = BloodType.O, RhFactor = RhFactor.Positive, RequiredQuantity = 5, UrgencyLevel = UrgencyLevel.Routine, PatientSeverityScore = 3, RequestDate = today.AddDays(-1), Status = RequestStatus.Pending },
            new BloodRequest { HospitalId = hospitals[0].Id, BloodType = BloodType.O, RhFactor = RhFactor.Negative, RequiredQuantity = 2, UrgencyLevel = UrgencyLevel.Urgent, PatientSeverityScore = 7, RequestDate = today.AddHours(-5), Status = RequestStatus.Pending }
        };
        context.BloodRequests.AddRange(requests);
        context.SaveChanges();
    }
}

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HemoConnect.Infrastructure.Data;
using HemoConnect.Domain.Enums;
using HemoConnect.Domain.Entities;

namespace HemoConnect.Services;

public class PredictiveAnalysisService : IPredictiveAnalysisService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public PredictiveAnalysisService(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<string> RunPredictiveAnalysisAsync()
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var inSevenDays = now.AddDays(7);

        string report = "Raport Predicție:\n";
        bool alertTriggered = false;

        var bloodTypes = Enum.GetValues(typeof(BloodType)).Cast<BloodType>().Where(b => b != BloodType.Unknown);
        var rhFactors = Enum.GetValues(typeof(RhFactor)).Cast<RhFactor>().Where(r => r != RhFactor.Unknown);

        foreach (var bt in bloodTypes)
        {
            foreach (var rh in rhFactors)
            {
                var pastRequests = await _context.BloodRequests
                    .Where(r => r.BloodType == bt && r.RhFactor == rh && r.RequestDate >= thirtyDaysAgo)
                    .ToListAsync();

                int totalConsumed = pastRequests.Sum(r => r.RequiredQuantity);
                double dailyConsumptionRate = totalConsumed / 30.0;
                
                if (dailyConsumptionRate < 0.1) continue;

                int currentStock = await _context.BloodBags
                    .CountAsync(b => b.BloodType == bt && b.RhFactor == rh && b.Status == BagStatus.Available);

                var futureAppointments = await _context.DonationAppointments
                    .Where(a => a.AppointmentDate >= now && a.AppointmentDate <= inSevenDays && a.Status == AppointmentStatus.Pending)
                    .ToListAsync();
                
                int predictedInflow = 0;
                foreach(var app in futureAppointments)
                {
                    var donor = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.FirebaseUid == app.FirebaseUid);
                    if (donor != null && donor.BloodType == bt && donor.RhFactor == rh)
                    {
                        predictedInflow++;
                    }
                }

                double predictedStockIn7Days = currentStock + predictedInflow - (dailyConsumptionRate * 7);

                if (predictedStockIn7Days < 0)
                {
                    alertTriggered = true;
                    string btString = GetBloodTypeString(bt, rh);
                    report += $"- {btString}: Stoc critic previzionat ({Math.Round(predictedStockIn7Days)} pungi). Consum zilnic: {Math.Round(dailyConsumptionRate, 2)}.\n";

                    var eligibleDonors = await _context.DonorProfiles
                        .Where(p => p.BloodType == bt && p.RhFactor == rh && p.Gender != null)
                        .ToListAsync();

                    foreach (var donor in eligibleDonors)
                    {
                        int daysBetweenDonations = donor.Gender == Gender.Male ? 56 : 84;
                        if (donor.LastDonationDate == null || donor.LastDonationDate.Value.AddDays(daysBetweenDonations) <= now)
                        {
                            try 
                            {
                                var userRecord = await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.GetUserAsync(donor.FirebaseUid);
                                if (!string.IsNullOrEmpty(userRecord.Email))
                                {
                                    await _emailService.SendPredictiveAlertEmailAsync(userRecord.Email, btString, inSevenDays.ToString("dd/MM/yyyy"));
                                }
                            } 
                            catch { }
                        }
                    }
                }
            }
        }

        if (!alertTriggered)
        {
            report += "Stocurile sunt suficiente pentru toate grupele în următoarele 7 zile.";
        }

        return report;
    }

    private string GetBloodTypeString(BloodType bt, RhFactor rh)
    {
        var types = new[] { "O", "A", "B", "AB", "?" };
        var rhs = new[] { "+", "-", "?" };
        int btIndex = (int)bt;
        int rhIndex = (int)rh;
        return $"{(btIndex >= 0 && btIndex < 4 ? types[btIndex] : "?")}{(rhIndex >= 0 && rhIndex < 2 ? rhs[rhIndex] : "?")}";
    }
}

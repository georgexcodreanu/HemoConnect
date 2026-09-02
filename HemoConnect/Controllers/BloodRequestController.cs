using System;
using System.Linq;
using System.Threading.Tasks;
using HemoConnect.Application.Interfaces;
using HemoConnect.Services;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;
using HemoConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HemoConnect.Controllers;

[Route("api/bloodrequests")]
[ApiController]
[Authorize]
public class BloodRequestController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IBloodAllocationService _allocationService;
    private readonly IEmailService _emailService;
    private readonly IServiceProvider _serviceProvider;

    public BloodRequestController(AppDbContext context, IBloodAllocationService allocationService, IEmailService emailService, IServiceProvider serviceProvider)
    {
        _context = context;
        _allocationService = allocationService;
        _emailService = emailService;
        _serviceProvider = serviceProvider;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateRequest([FromBody] CreateBloodRequestDto dto)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "HospitalStaff" || user.HospitalId == null)
        {
            return Forbid("Doar personalul unui spital poate crea cereri.");
        }

        var request = new BloodRequest
        {
            HospitalId = user.HospitalId.Value,
            BloodType = dto.BloodType,
            RhFactor = dto.RhFactor,
            RequiredQuantity = dto.RequiredQuantity,
            PatientSeverityScore = dto.PatientSeverityScore,
            UrgencyLevel = dto.UrgencyLevel,
            RequestDate = DateTime.UtcNow,
            Status = RequestStatus.Pending
        };

        _context.BloodRequests.Add(request);
        await _context.SaveChangesAsync();

        if (request.UrgencyLevel == UrgencyLevel.Critical)
        {
            var hospitalName = await _context.Hospitals
                .Where(h => h.Id == request.HospitalId)
                .Select(h => h.Name)
                .FirstOrDefaultAsync() ?? "Spitalul local";
            var eligibleDonors = await _context.DonorProfiles
                .Where(p => p.BloodType == request.BloodType && p.RhFactor == request.RhFactor && p.Gender != null)
                .ToListAsync();

            _ = Task.Run(async () => 
            {
                using var scope = _serviceProvider.CreateScope();
                var emailSvc = scope.ServiceProvider.GetRequiredService<IEmailService>();

                var now = DateTime.UtcNow;
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
                                var btString = GetBloodTypeString(donor.BloodType, donor.RhFactor);
                                await emailSvc.SendCriticalAlertEmailAsync(userRecord.Email, hospitalName, btString);
                            }
                        } 
                        catch { /* ignoram daca userul firebase nu exista */ }
                    }
                }
            });
        }

        return Ok(request);
    }

    [HttpGet("hospital")]
    public async Task<IActionResult> GetHospitalRequests()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.HospitalId == null)
        {
            return Forbid();
        }

        var requestsData = await _context.BloodRequests
            .Include(r => r.Allocations)
                .ThenInclude(a => a.BloodBag)
                    .ThenInclude(b => b.TransfusionCenter)
            .Where(r => r.HospitalId == user.HospitalId.Value)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        var result = requestsData.Select(r => new
        {
            r.Id,
            r.BloodType,
            r.RhFactor,
            r.RequiredQuantity,
            r.PatientSeverityScore,
            r.UrgencyLevel,
            r.RequestDate,
            r.Status,
            AssignedCenters = r.Allocations
                               .Where(a => a.BloodBag.TransfusionCenter != null)
                               .GroupBy(a => new { a.BloodBag.TransfusionCenter.Name, a.BloodBag.BloodType, a.BloodBag.RhFactor })
                               .Select(g => $"{g.Key.Name} ({g.Count()} pungi {GetBloodTypeString(g.Key.BloodType, g.Key.RhFactor)})")
                               .ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("center-tasks")]
    public async Task<IActionResult> GetCenterAllocationTasks()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "CenterStaff" || user.TransfusionCenterId == null)
        {
            return Forbid();
        }

        var allocations = await _context.Set<Allocation>()
            .Include(a => a.BloodBag)
            .Include(a => a.BloodRequest)
                .ThenInclude(r => r.Hospital)
            .Where(a => a.BloodBag.TransfusionCenterId == user.TransfusionCenterId.Value && a.BloodBag.Status == BagStatus.Allocated)
            .ToListAsync();

        var groupedTasks = allocations
            .GroupBy(a => a.BloodRequest)
            .Select(g => new
            {
                RequestId = g.Key.Id,
                HospitalName = g.Key.Hospital.Name,
                BloodType = (int)g.Key.BloodType,
                RhFactor = (int)g.Key.RhFactor,
                Quantity = g.Count(),
                AllocationDate = g.Max(a => a.AllocationDate),
                RequestStatus = g.Key.Status.ToString()
            })
            .OrderByDescending(t => t.AllocationDate)
            .ToList();

        return Ok(groupedTasks);
    }

    [HttpPost("confirm-shipment/{requestId}")]
    public async Task<IActionResult> ConfirmShipment(int requestId)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "CenterStaff" || user.TransfusionCenterId == null)
            return Forbid();

        var allocations = await _context.Set<Allocation>()
            .Include(a => a.BloodBag)
            .Where(a => a.BloodRequestId == requestId 
                     && a.BloodBag.TransfusionCenterId == user.TransfusionCenterId.Value 
                     && a.BloodBag.Status == BagStatus.Allocated)
            .ToListAsync();

        if (!allocations.Any())
            return NotFound(new { message = "Nu s-au găsit pungi alocate pentru această cerere la centrul dvs." });

        foreach (var allocation in allocations)
        {
            allocation.BloodBag.Status = BagStatus.Transfused;
        }

        await _context.SaveChangesAsync();

        var request = await _context.BloodRequests
            .Include(r => r.Allocations)
                .ThenInclude(a => a.BloodBag)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request != null && request.Status == RequestStatus.Fulfilled)
        {
            bool allShipped = request.Allocations.All(a => a.BloodBag.Status == BagStatus.Transfused || a.BloodBag.Status == BagStatus.Discarded);
            if (allShipped)
            {
                request.Status = RequestStatus.Completed;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(new { message = "Expediere confirmată." });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllRequests()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "Admin")
            return Forbid();

        var requestsData = await _context.BloodRequests
            .Include(r => r.Hospital)
            .Include(r => r.Allocations)
                .ThenInclude(a => a.BloodBag)
                    .ThenInclude(b => b.TransfusionCenter)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var result = requestsData.Select(r => new
        {
            r.Id,
            HospitalName = r.Hospital.Name,
            r.BloodType,
            r.RhFactor,
            r.RequiredQuantity,
            r.PatientSeverityScore,
            PriorityScore = Math.Round(((int)r.UrgencyLevel * 50.0) + (r.PatientSeverityScore * 5.0) + ((now - r.RequestDate).TotalHours * 0.5), 2),
            r.UrgencyLevel,
            r.RequestDate,
            r.Status,
            AssignedCenters = r.Allocations
                               .Where(a => a.BloodBag.TransfusionCenter != null)
                               .GroupBy(a => new { a.BloodBag.TransfusionCenter.Name, a.BloodBag.BloodType, a.BloodBag.RhFactor })
                               .Select(g => $"{g.Key.Name} ({g.Count()} pungi {GetBloodTypeString(g.Key.BloodType, g.Key.RhFactor)})")
                               .ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpPost("trigger-allocation")]
    public async Task<IActionResult> TriggerAllocation()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "Admin")
            return Forbid();

        var resultMessage = await _allocationService.ProcessNextAllocationAsync();
        return Ok(new { message = resultMessage });
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

public class CreateBloodRequestDto
{
    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
    public int RequiredQuantity { get; set; }
    public int PatientSeverityScore { get; set; }
    public UrgencyLevel UrgencyLevel { get; set; }
}

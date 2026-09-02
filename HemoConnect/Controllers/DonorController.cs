using System;
using System.Linq;
using System.Threading.Tasks;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;
using HemoConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HemoConnect.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DonorController : ControllerBase
{
    private readonly AppDbContext _context;

    public DonorController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

        var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.FirebaseUid == firebaseUid);
        if (profile == null) return NotFound("Profil de donator inexistent.");

        var appointments = await _context.DonationAppointments
            .Include(a => a.TransfusionCenter)
            .Where(a => a.FirebaseUid == firebaseUid)
            .OrderBy(a => a.Status)
            .ThenByDescending(a => a.AppointmentDate)
            .Select(a => new
            {
                a.Id,
                CenterName = a.TransfusionCenter.Name,
                a.AppointmentDate,
                Status = (int)a.Status
            })
            .ToListAsync();

        bool needsGender = profile.Gender == null;
        DateTime nextEligibleDate = DateTime.UtcNow;
        bool isEligible = true;
        string eligibilityReason = "";

        if (!needsGender)
        {
            int daysBetweenDonations = profile.Gender == Gender.Male ? 56 : 84;
            int maxPerYear = profile.Gender == Gender.Male ? 5 : 4;

            var lastDonation = appointments
                .Where(a => a.Status == (int)AppointmentStatus.Completed || a.Status == (int)AppointmentStatus.Pending)
                .OrderByDescending(a => a.AppointmentDate)
                .FirstOrDefault();

            if (lastDonation != null)
            {
                var minNextDate = lastDonation.AppointmentDate.AddDays(daysBetweenDonations);
                if (minNextDate > nextEligibleDate)
                {
                    nextEligibleDate = minNextDate;
                    isEligible = false;
                    eligibilityReason = $"Perioada de repaus medical ({daysBetweenDonations} zile).";
                }
            }

            var oneYearAgo = DateTime.UtcNow.AddDays(-365);
            var donationsInLastYear = appointments
                .Count(a => (a.Status == (int)AppointmentStatus.Completed || a.Status == (int)AppointmentStatus.Pending) 
                            && a.AppointmentDate >= oneYearAgo);

            if (donationsInLastYear >= maxPerYear)
            {
                var oldestInYear = appointments
                    .Where(a => (a.Status == (int)AppointmentStatus.Completed || a.Status == (int)AppointmentStatus.Pending) 
                                && a.AppointmentDate >= oneYearAgo)
                    .OrderBy(a => a.AppointmentDate)
                    .First();
                
                var dateWhenOldestExpires = oldestInYear.AppointmentDate.AddDays(365);
                if (dateWhenOldestExpires > nextEligibleDate)
                {
                    nextEligibleDate = dateWhenOldestExpires;
                    isEligible = false;
                    eligibilityReason = $"Ai atins limita anuală de {maxPerYear} donări.";
                }
            }
        }

        object smartAlert = null;
        if (isEligible && profile.BloodType != BloodType.Unknown && profile.RhFactor != RhFactor.Unknown)
        {
            var criticalRequest = await _context.BloodRequests
                .Include(r => r.Hospital)
                .Where(r => r.Status == RequestStatus.Pending 
                         && r.UrgencyLevel == UrgencyLevel.Critical
                         && r.BloodType == profile.BloodType
                         && r.RhFactor == profile.RhFactor)
                .OrderByDescending(r => r.RequestDate)
                .FirstOrDefaultAsync();

            if (criticalRequest != null)
            {
                smartAlert = new
                {
                    HospitalName = criticalRequest.Hospital.Name,
                    Message = $"Nevoie disperată de sânge din grupa ta! Te rugăm să te programezi astăzi pentru donare."
                };
            }
        }

        return Ok(new
        {
            BloodType = (int)profile.BloodType,
            RhFactor = (int)profile.RhFactor,
            Gender = profile.Gender != null ? (int)profile.Gender : -1,
            profile.TotalDonations,
            LastDonationDate = profile.LastDonationDate,
            appointments,
            smartAlert,
            needsGender,
            isEligible,
            nextEligibleDate,
            eligibilityReason
        });
    }

    [HttpPost("set-gender")]
    public async Task<IActionResult> SetGender([FromBody] SetGenderDto dto)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

        var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.FirebaseUid == firebaseUid);
        if (profile == null) return NotFound();

        profile.Gender = dto.Gender;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sexul a fost actualizat." });
    }

    [HttpGet("centers")]
    public async Task<IActionResult> GetCenters()
    {
        var centers = await _context.TransfusionCenters
            .Select(c => new { c.Id, c.Name, c.Location })
            .ToListAsync();
        return Ok(centers);
    }

    [HttpPost("appointment")]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

        // Validare avansată
        var validationError = await ValidateAppointmentSlot(dto.CenterId, dto.Date);
        if (validationError != null)
            return BadRequest(new { message = validationError });

        var appointment = new DonationAppointment
        {
            FirebaseUid = firebaseUid,
            TransfusionCenterId = dto.CenterId,
            AppointmentDate = dto.Date,
            Status = AppointmentStatus.Pending
        };

        _context.DonationAppointments.Add(appointment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Programare realizată cu succes!" });
    }

    [HttpPut("appointment/{id}")]
    public async Task<IActionResult> UpdateAppointment(int id, [FromBody] UpdateAppointmentDto dto)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

        var appointment = await _context.DonationAppointments.FirstOrDefaultAsync(a => a.Id == id && a.FirebaseUid == firebaseUid);
        if (appointment == null) return NotFound();

        if (appointment.Status != AppointmentStatus.Pending)
            return BadRequest(new { message = "Doar programările în așteptare pot fi modificate." });

        var validationError = await ValidateAppointmentSlot(dto.CenterId, dto.Date, id);
        if (validationError != null)
            return BadRequest(new { message = validationError });

        appointment.TransfusionCenterId = dto.CenterId;
        appointment.AppointmentDate = dto.Date;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Programarea a fost actualizată!" });
    }

    [HttpPut("cancel-appointment/{id}")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

        var appointment = await _context.DonationAppointments.FirstOrDefaultAsync(a => a.Id == id && a.FirebaseUid == firebaseUid);
        if (appointment == null) return NotFound();

        if (appointment.Status != AppointmentStatus.Pending)
            return BadRequest(new { message = "Doar programările în așteptare pot fi anulate." });

        appointment.Status = AppointmentStatus.Cancelled;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Programarea a fost anulată." });
    }


    [HttpGet("booked-slots")]
    public async Task<IActionResult> GetBookedSlots([FromQuery] int centerId, [FromQuery] string date)
    {
        if (!DateTime.TryParse(date, out DateTime parsedDate))
            return BadRequest("Data invalidă.");

        var roTimeZone = TimeZoneInfo.FindSystemTimeZoneById("GTB Standard Time");

        var localStart = new DateTime(parsedDate.Year, parsedDate.Month, parsedDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
        var localEnd = localStart.AddDays(1).AddTicks(-1);

        var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStart, roTimeZone);
        var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEnd, roTimeZone);

        var appointments = await _context.DonationAppointments
            .Where(a => a.TransfusionCenterId == centerId 
                     && a.AppointmentDate >= utcStart 
                     && a.AppointmentDate <= utcEnd
                     && (a.Status == AppointmentStatus.Pending || a.Status == AppointmentStatus.Completed))
            .ToListAsync();

        var bookedTimes = appointments
            .Select(a => TimeZoneInfo.ConvertTimeFromUtc(a.AppointmentDate, roTimeZone).ToString("HH:mm"))
            .ToList();

        return Ok(bookedTimes);
    }

    [HttpGet("center-appointments")]
    public async Task<IActionResult> GetCenterAppointments()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "CenterStaff" || user.TransfusionCenterId == null)
            return Forbid();

        var appointments = await _context.DonationAppointments
            .Where(a => a.TransfusionCenterId == user.TransfusionCenterId && a.Status == AppointmentStatus.Pending)
            .OrderBy(a => a.AppointmentDate)
            .Select(a => new
            {
                a.Id,
                a.FirebaseUid,
                a.AppointmentDate
            })
            .ToListAsync();

        var result = new System.Collections.Generic.List<object>();
        foreach (var app in appointments)
        {
            var acc = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == app.FirebaseUid);
            var prof = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.FirebaseUid == app.FirebaseUid);
            
            result.Add(new
            {
                app.Id,
                DonorName = acc != null ? $"{acc.FirstName} {acc.LastName}" : "Necunoscut",
                BloodType = prof?.BloodType != null ? (int)prof.BloodType : 4,
                RhFactor = prof?.RhFactor != null ? (int)prof.RhFactor : 2,
                app.AppointmentDate
            });
        }

        return Ok(result);
    }

    [HttpPost("complete-appointment/{id}")]
    public async Task<IActionResult> CompleteAppointment(int id, [FromBody] CompleteAppointmentDto dto)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "CenterStaff") return Forbid();

        var appointment = await _context.DonationAppointments.FirstOrDefaultAsync(a => a.Id == id);
        if (appointment == null) return NotFound();

        appointment.Status = AppointmentStatus.Completed;


        var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.FirebaseUid == appointment.FirebaseUid);
        if (donorProfile != null)
        {
            donorProfile.TotalDonations++;
            donorProfile.LastDonationDate = DateTime.UtcNow;

            if (dto.UpdateBloodType)
            {
                donorProfile.BloodType = dto.BloodType;
                donorProfile.RhFactor = dto.RhFactor;
            }


            var bloodBag = new BloodBag
            {
                TransfusionCenterId = user.TransfusionCenterId.Value,
                BloodType = donorProfile.BloodType,
                RhFactor = donorProfile.RhFactor,
                DonationDate = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(35),
                Status = BagStatus.Available
            };
            _context.BloodBags.Add(bloodBag);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Donare confirmată și profil actualizat!" });
    }

    [HttpPost("noshow-appointment/{id}")]
    public async Task<IActionResult> NoShowAppointment(int id)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "CenterStaff") return Forbid();

        var appointment = await _context.DonationAppointments.FirstOrDefaultAsync(a => a.Id == id);
        if (appointment == null) return NotFound();

        if (appointment.TransfusionCenterId != user.TransfusionCenterId) return Forbid();

        appointment.Status = AppointmentStatus.Cancelled;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Programarea a fost marcată ca neprezentată." });
    }

    [HttpGet("center-history")]
    public async Task<IActionResult> GetCenterHistory()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "CenterStaff" || user.TransfusionCenterId == null)
            return Forbid();

        var appointments = await _context.DonationAppointments
            .Where(a => a.TransfusionCenterId == user.TransfusionCenterId && a.Status != AppointmentStatus.Pending)
            .OrderBy(a => a.Status)
            .ThenByDescending(a => a.AppointmentDate)
            .Take(100)
            .Select(a => new
            {
                a.Id,
                a.FirebaseUid,
                a.AppointmentDate,
                Status = (int)a.Status
            })
            .ToListAsync();

        var result = new System.Collections.Generic.List<object>();
        foreach (var app in appointments)
        {
            var acc = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == app.FirebaseUid);
            var prof = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.FirebaseUid == app.FirebaseUid);
            
            result.Add(new
            {
                app.Id,
                DonorName = acc != null ? $"{acc.FirstName} {acc.LastName}" : "Necunoscut",
                BloodType = prof?.BloodType != null ? (int)prof.BloodType : 4,
                RhFactor = prof?.RhFactor != null ? (int)prof.RhFactor : 2,
                app.AppointmentDate,
                app.Status
            });
        }

        return Ok(result);
    }

    private async Task<string> ValidateAppointmentSlot(int centerId, DateTime date, int? excludeAppointmentId = null)
    {
        var roTimeZone = TimeZoneInfo.FindSystemTimeZoneById("GTB Standard Time");
        var localTime = TimeZoneInfo.ConvertTimeFromUtc(date, roTimeZone);

        if (localTime.Date < TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, roTimeZone).Date)
            return "Nu te poți programa în trecut.";

        if (localTime.DayOfWeek == DayOfWeek.Saturday || localTime.DayOfWeek == DayOfWeek.Sunday)
            return "Programările nu sunt posibile în weekend.";

        var timeOfDay = localTime.TimeOfDay;
        var startHour = new TimeSpan(8, 0, 0);
        var endHour = new TimeSpan(13, 30, 0);

        if (timeOfDay < startHour || timeOfDay > endHour)
            return "Ora trebuie să fie între 08:00 și 13:30.";

        if (localTime.Minute % 5 != 0)
            return "Programările se fac din 5 în 5 minute.";

        var query = _context.DonationAppointments
            .Where(a => a.TransfusionCenterId == centerId 
                     && a.AppointmentDate == date 
                     && (a.Status == AppointmentStatus.Pending || a.Status == AppointmentStatus.Completed));

        if (excludeAppointmentId.HasValue)
            query = query.Where(a => a.Id != excludeAppointmentId.Value);

        if (await query.AnyAsync())
            return "Acest slot este deja ocupat. Te rugăm să alegi o altă oră.";

        return null;
    }
}

public class CreateAppointmentDto
{
    public int CenterId { get; set; }
    public DateTime Date { get; set; }
}

public class UpdateAppointmentDto
{
    public int CenterId { get; set; }
    public DateTime Date { get; set; }
}

public class CompleteAppointmentDto
{
    public bool UpdateBloodType { get; set; }
    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
}

public class SetGenderDto
{
    public Gender Gender { get; set; }
}

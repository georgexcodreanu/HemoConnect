using System;
using System.Threading.Tasks;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;
using HemoConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FirebaseAdmin.Auth;

namespace HemoConnect.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid))
            return Unauthorized("Firebase UID not found in token");

        var userAccount = await _context.UserAccounts
            .Include(u => u.Hospital)
            .Include(u => u.TransfusionCenter)
            .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
        
        if (userAccount == null)
            return NotFound("User role not found");

        if (userAccount.Role == "Donor")
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.FirebaseUid == firebaseUid);
            return Ok(new { 
                role = userAccount.Role,
                firstName = userAccount.FirstName,
                lastName = userAccount.LastName,
                donorProfile = donorProfile
            });
        }

        string? entityName = null;
        if (userAccount.Role == "HospitalStaff") entityName = userAccount.Hospital?.Name;
        if (userAccount.Role == "CenterStaff") entityName = userAccount.TransfusionCenter?.Name;

        return Ok(new { 
            role = userAccount.Role,
            firstName = userAccount.FirstName,
            lastName = userAccount.LastName,
            entityName = entityName
        });
    }

    [HttpPost("sync-profile")]
    [Authorize]
    public async Task<IActionResult> SyncDonorProfile([FromBody] SyncProfileDto dto)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(firebaseUid))
            return Unauthorized("Firebase UID not found in token");

        var existingAccount = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
        if (existingAccount == null)
        {
            _context.UserAccounts.Add(new UserAccount
            {
                FirebaseUid = firebaseUid,
                Role = "Donor",
                FirstName = dto.FirstName,
                LastName = dto.LastName
            });
        }
        else
        {
            existingAccount.FirstName = dto.FirstName;
            existingAccount.LastName = dto.LastName;
        }

        var existingProfile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.FirebaseUid == firebaseUid);
        if (existingProfile == null)
        {
            var donorProfile = new DonorProfile
            {
                FirebaseUid = firebaseUid,
                BloodType = dto.BloodType,
                RhFactor = dto.RhFactor,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                IsEligible = true
            };
            _context.DonorProfiles.Add(donorProfile);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Profile synced successfully" });
    }

    [HttpPost("create-staff")]
    [Authorize]
    public async Task<IActionResult> CreateMedicalStaff([FromBody] CreateStaffDto dto)
    {
        var adminUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var adminAccount = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == adminUid);
        
        if (adminAccount == null || adminAccount.Role != "Admin")
        {
            return Forbid("Only administrators can perform this action.");
        }

        try
        {
            var userArgs = new UserRecordArgs()
            {
                Email = dto.Email,
                Password = dto.Password,
                EmailVerified = true
            };
            UserRecord userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(userArgs);

            var newStaffAccount = new UserAccount
            {
                FirebaseUid = userRecord.Uid,
                Role = dto.Role,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                HospitalId = dto.Role == "HospitalStaff" ? dto.EntityId : null,
                TransfusionCenterId = dto.Role == "CenterStaff" ? dto.EntityId : null
            };
            
            _context.UserAccounts.Add(newStaffAccount);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Medical staff account created successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class SyncProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
}

public class CreateStaffDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Role { get; set; } = "HospitalStaff";
    public int EntityId { get; set; }
}

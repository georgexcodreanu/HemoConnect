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
public class BloodBagController : ControllerBase
{
    private readonly AppDbContext _context;

    public BloodBagController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("create")]
    public async Task<IActionResult> AddBloodBag([FromBody] CreateBloodBagDto dto)
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.Role != "CenterStaff" || user.TransfusionCenterId == null)
        {
            return Forbid("Doar personalul unui centru de transfuzii poate adăuga pungi în inventar.");
        }

        int qty = dto.Quantity > 0 ? dto.Quantity : 1;
        var bags = new System.Collections.Generic.List<BloodBag>();

        for(int i = 0; i < qty; i++)
        {
            bags.Add(new BloodBag
            {
                TransfusionCenterId = user.TransfusionCenterId.Value,
                BloodType = dto.BloodType,
                RhFactor = dto.RhFactor,
                DonationDate = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(35), // Default 35 zile valabilitate
                Status = BagStatus.Available
            });
        }

        _context.BloodBags.AddRange(bags);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{qty} pungi au fost adaugate." });
    }

    [HttpGet("center")]
    public async Task<IActionResult> GetCenterInventory()
    {
        var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user == null || user.TransfusionCenterId == null)
        {
            return Forbid();
        }

        var bags = await _context.BloodBags
            .Where(b => b.TransfusionCenterId == user.TransfusionCenterId.Value)
            .OrderByDescending(b => b.DonationDate)
            .ToListAsync();

        return Ok(bags);
    }
}

public class CreateBloodBagDto
{
    public BloodType BloodType { get; set; }
    public RhFactor RhFactor { get; set; }
    public int Quantity { get; set; }
}

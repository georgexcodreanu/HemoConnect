using System.Threading.Tasks;
using HemoConnect.Domain.Entities;
using HemoConnect.Infrastructure.Data;
using HemoConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HemoConnect.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPredictiveAnalysisService _predictiveService;

    public AdminController(AppDbContext context, IPredictiveAnalysisService predictiveService)
    {
        _context = context;
        _predictiveService = predictiveService;
    }

    [HttpGet("hospitals")]
    public async Task<IActionResult> GetHospitals()
    {
        var hospitals = await _context.Hospitals.ToListAsync();
        return Ok(hospitals);
    }

    [HttpPost("hospitals")]
    [Authorize]
    public async Task<IActionResult> AddHospital([FromBody] AddLocationDto dto)
    {
        var adminUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var adminAccount = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == adminUid);
        
        if (adminAccount == null || adminAccount.Role != "Admin")
            return Forbid("Only administrators can perform this action.");

        var hospital = new Hospital
        {
            Name = dto.Name,
            Location = dto.Location,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude
        };

        _context.Hospitals.Add(hospital);
        await _context.SaveChangesAsync();

        return Ok(hospital);
    }

    [HttpGet("centers")]
    public async Task<IActionResult> GetCenters()
    {
        var centers = await _context.TransfusionCenters.ToListAsync();
        return Ok(centers);
    }

    [HttpPost("centers")]
    [Authorize]
    public async Task<IActionResult> AddCenter([FromBody] AddLocationDto dto)
    {
        var adminUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var adminAccount = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == adminUid);
        
        if (adminAccount == null || adminAccount.Role != "Admin")
            return Forbid("Only administrators can perform this action.");

        var center = new TransfusionCenter
        {
            Name = dto.Name,
            Location = dto.Location,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude
        };

        _context.TransfusionCenters.Add(center);
        await _context.SaveChangesAsync();

        return Ok(center);
    }

    [HttpPost("trigger-predictive")]
    [Authorize]
    public async Task<IActionResult> TriggerPredictiveAnalysis()
    {
        var adminUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var adminAccount = await _context.UserAccounts.FirstOrDefaultAsync(u => u.FirebaseUid == adminUid);
        
        if (adminAccount == null || adminAccount.Role != "Admin")
            return Forbid("Only administrators can perform this action.");

        string report = await _predictiveService.RunPredictiveAnalysisAsync();
        return Ok(new { message = "Analiza predictivă a fost rulată cu succes.", report = report });
    }
}

public class AddLocationDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

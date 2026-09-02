using Microsoft.AspNetCore.Mvc;
using HemoConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using HemoConnect.Domain.Entities;

namespace HemoConnect.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly AppDbContext _context;

    public TestController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("hospitals")]
    public async Task<IActionResult> GetHospitals()
    {
        var hospitals = await _context.Hospitals.ToListAsync();
        return Ok(hospitals);
    }

    [HttpGet("cleanup")]
    public async Task<IActionResult> CleanupDb()
    {
        _context.Set<Allocation>().RemoveRange(_context.Set<Allocation>());
        _context.BloodBags.RemoveRange(_context.BloodBags);
        _context.BloodRequests.RemoveRange(_context.BloodRequests);
        
        await _context.SaveChangesAsync();
        return Ok(new { message = "Database cleaned successfully." });
    }

    [HttpGet("fix-locations")]
    public async Task<IActionResult> FixLocations()
    {
        var hospitals = await _context.Hospitals.ToListAsync();
        foreach (var h in hospitals)
        {
            if (h.Name.Contains("Spitalul Universitar de Urgență") && !h.Name.Contains("București"))
            {
                h.Name = "Spitalul Universitar de Urgență București";
                h.Latitude = 44.4355;
                h.Longitude = 26.0952;
            }
            if (h.Name.Contains("Spitalul Clinic Județean") && !h.Name.Contains("Cluj"))
            {
                h.Name = "Spitalul Clinic Județean Cluj-Napoca";
                h.Latitude = 46.7649;
                h.Longitude = 23.5855;
            }
        }

        var centers = await _context.TransfusionCenters.ToListAsync();
        foreach (var c in centers)
        {
            if (c.Name == "Centrul de Transfuzie Sanguină")
            {
                c.Name = "Centrul de Transfuzie Sanguină București";
                c.Latitude = 44.4501;
                c.Longitude = 26.0827;
            }
            if (c.Name == "Centrul Regional de Transfuzie")
            {
                c.Name = "Centrul Regional de Transfuzie Cluj-Napoca";
                c.Latitude = 46.7580;
                c.Longitude = 23.5900;
            }
        }

        var testCenter = await _context.TransfusionCenters.FirstOrDefaultAsync(c => c.Name.ToLower() == "test");
        if (testCenter != null)
        {
            _context.TransfusionCenters.Remove(testCenter);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Locations fixed and 'test' center removed successfully." });
    }
}

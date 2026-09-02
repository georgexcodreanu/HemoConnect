using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HemoConnect.Application.Interfaces;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;
using HemoConnect.Infrastructure.Data;

namespace HemoConnect.Infrastructure.Repositories;

public class BloodBagRepository : IBloodBagRepository
{
    private readonly AppDbContext _context;

    public BloodBagRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BloodBag>> GetAvailableBagsAsync(List<BloodType> compatibleTypes, List<RhFactor> compatibleRhs)
    {
        return await _context.BloodBags
            .Include(b => b.TransfusionCenter)
            .Where(b => b.Status == BagStatus.Available 
                     && compatibleTypes.Contains(b.BloodType)
                     && compatibleRhs.Contains(b.RhFactor))
            .ToListAsync();
    }

    public async Task UpdateBagsAsync(IEnumerable<BloodBag> bags)
    {
        _context.BloodBags.UpdateRange(bags);
        await _context.SaveChangesAsync();
    }
}

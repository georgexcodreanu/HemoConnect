using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HemoConnect.Application.Interfaces;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;
using HemoConnect.Infrastructure.Data;

namespace HemoConnect.Infrastructure.Repositories;

public class BloodRequestRepository : IBloodRequestRepository
{
    private readonly AppDbContext _context;

    public BloodRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BloodRequest>> GetPendingRequestsWithHospitalsAsync()
    {
        return await _context.BloodRequests
            .Include(r => r.Hospital)
            .Include(r => r.Allocations)
            .Where(r => r.Status == RequestStatus.Pending || r.Status == RequestStatus.PartiallyAllocated)
            .ToListAsync();
    }

    public async Task UpdateAsync(BloodRequest request)
    {
        _context.BloodRequests.Update(request);
        await _context.SaveChangesAsync();
    }
}

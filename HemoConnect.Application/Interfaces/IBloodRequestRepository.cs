using System.Collections.Generic;
using System.Threading.Tasks;
using HemoConnect.Domain.Entities;

namespace HemoConnect.Application.Interfaces;

public interface IBloodRequestRepository
{
    Task<List<BloodRequest>> GetPendingRequestsWithHospitalsAsync();
    Task UpdateAsync(BloodRequest request);
}

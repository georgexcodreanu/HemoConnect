using System.Collections.Generic;
using System.Threading.Tasks;
using HemoConnect.Application.DTOs;

namespace HemoConnect.Application.Interfaces;

public interface IBloodRequestPrioritizationService
{
    Task<List<PrioritizedRequestDto>> GetPrioritizedRequestsAsync();
}

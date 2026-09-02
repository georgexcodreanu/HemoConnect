using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HemoConnect.Application.Interfaces;

namespace HemoConnect.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AllocationController : ControllerBase
{
    private readonly IBloodRequestPrioritizationService _prioritizationService;
    private readonly IBloodAllocationService _allocationService;

    public AllocationController(
        IBloodRequestPrioritizationService prioritizationService,
        IBloodAllocationService allocationService)
    {
        _prioritizationService = prioritizationService;
        _allocationService = allocationService;
    }

    [HttpGet("prioritized-requests")]
    public async Task<IActionResult> GetPrioritizedRequests()
    {
        var result = await _prioritizationService.GetPrioritizedRequestsAsync();
        return Ok(result);
    }

    [HttpPost("process-next")]
    public async Task<IActionResult> ProcessNextAllocation()
    {
        var resultMessage = await _allocationService.ProcessNextAllocationAsync();
        return Ok(new { message = resultMessage });
    }
}

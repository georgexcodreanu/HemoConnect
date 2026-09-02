using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HemoConnect.Application.DTOs;
using HemoConnect.Application.Interfaces;

namespace HemoConnect.Application.Services;

public class BloodRequestPrioritizationService : IBloodRequestPrioritizationService
{
    private readonly IBloodRequestRepository _repository;

    public BloodRequestPrioritizationService(IBloodRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<PrioritizedRequestDto>> GetPrioritizedRequestsAsync()
    {
        var pendingRequests = await _repository.GetPendingRequestsWithHospitalsAsync();
        var prioritizedList = new List<PrioritizedRequestDto>();

        foreach (var req in pendingRequests)
        {
            var hoursWaiting = (DateTime.UtcNow - req.RequestDate).TotalHours;

            double urgencyWeight = 50.0;
            double severityWeight = 5.0;
            double timeWeight = 0.5;

            double score = ((int)req.UrgencyLevel * urgencyWeight) + 
                           (req.PatientSeverityScore * severityWeight) + 
                           (hoursWaiting * timeWeight);

            prioritizedList.Add(new PrioritizedRequestDto
            {
                RequestId = req.Id,
                HospitalName = req.Hospital.Name,
                BloodType = req.BloodType,
                RhFactor = req.RhFactor,
                RequiredQuantity = req.RequiredQuantity,
                UrgencyLevel = req.UrgencyLevel,
                PatientSeverityScore = req.PatientSeverityScore,
                RequestDate = req.RequestDate,
                PriorityScore = Math.Round(score, 2)
            });
        }

        // Returneaza lista sortata descrescator dupa scor
        return prioritizedList.OrderByDescending(r => r.PriorityScore).ToList();
    }
}

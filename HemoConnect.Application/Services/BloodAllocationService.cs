using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HemoConnect.Application.Interfaces;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Application.Services;

public class BloodAllocationService : IBloodAllocationService
{
    private readonly IBloodRequestPrioritizationService _prioritizationService;
    private readonly IBloodRequestRepository _requestRepository;
    private readonly IBloodBagRepository _bagRepository;

    public BloodAllocationService(
        IBloodRequestPrioritizationService prioritizationService,
        IBloodRequestRepository requestRepository,
        IBloodBagRepository bagRepository)
    {
        _prioritizationService = prioritizationService;
        _requestRepository = requestRepository;
        _bagRepository = bagRepository;
    }

    public async Task<string> ProcessNextAllocationAsync()
    {
        // 1. Obtinem cea mai importanta cerere
        var prioritizedRequests = await _prioritizationService.GetPrioritizedRequestsAsync();
        
        if (!prioritizedRequests.Any())
            return "Nu exista cereri in asteptare.";

        var topRequestDto = prioritizedRequests.First();
        
        // Luam entitatea completa din DB pentru a putea face modificari si a salva (pentru Fractional Allocation trebuie sa vedem cat s-a alocat deja)
        var allRequests = await _requestRepository.GetPendingRequestsWithHospitalsAsync();
        var requestToFulfill = allRequests.FirstOrDefault(r => r.Id == topRequestDto.RequestId);

        if (requestToFulfill == null)
            return "Cererea prioritizata nu a mai fost gasita.";

        int alreadyAllocated = requestToFulfill.Allocations?.Count ?? 0;
        int neededQuantity = requestToFulfill.RequiredQuantity - alreadyAllocated;

        if (neededQuantity <= 0)
        {
            requestToFulfill.Status = RequestStatus.Fulfilled;
            await _requestRepository.UpdateAsync(requestToFulfill);
            return $"Cererea pentru {requestToFulfill.Hospital.Name} este deja indeplinita.";
        }

        // 2. Regulile Donatorului Universal (Matricea de compatibilitate)
        var compatibleTypes = GetCompatibleBloodTypes(requestToFulfill.BloodType);
        var compatibleRhs = GetCompatibleRhFactors(requestToFulfill.RhFactor);

        // 3. Cautam pungi compatibile in tot sistemul
        var allCompatibleBags = await _bagRepository.GetAvailableBagsAsync(compatibleTypes, compatibleRhs);

        if (!allCompatibleBags.Any())
            return $"Nu s-au gasit pungi compatibile in sistem pentru cererea prioritizata (Necesar: {neededQuantity} pungi). Cererea ramane in asteptare.";

        // 4. Filtrare si Sortare Multi-Criteriala (Haversine + FIFO + Transport Limit)
        const double MAX_TRANSPORT_DISTANCE_KM = 350.0;
        var hospital = requestToFulfill.Hospital;

        var eligibleBags = allCompatibleBags
            .Select(bag => new { 
                Bag = bag, 
                Distance = CalculateHaversineDistance(hospital.Latitude, hospital.Longitude, bag.TransfusionCenter.Latitude, bag.TransfusionCenter.Longitude) 
            })
            .Where(x => x.Distance <= MAX_TRANSPORT_DISTANCE_KM)
            .OrderBy(x => x.Distance)
            .ThenBy(x => x.Bag.ExpirationDate)
            .Select(x => x.Bag)
            .ToList();

        if (!eligibleBags.Any())
            return $"S-au gasit pungi compatibile, dar se afla la o distanta de peste {MAX_TRANSPORT_DISTANCE_KM} km. Cererea ramane in asteptare pentru a evita degradarea sangelui.";

        // 5. Procesul de alocare
        int bagsToAllocateCount = Math.Min(neededQuantity, eligibleBags.Count);
        var bagsToAllocate = eligibleBags.Take(bagsToAllocateCount).ToList();

        if (requestToFulfill.Allocations == null)
            requestToFulfill.Allocations = new List<Allocation>();

        foreach (var bag in bagsToAllocate)
        {
            // Bag status becomes Allocated
            bag.Status = BagStatus.Allocated;
            
            // Create Allocation mapping
            var allocation = new Allocation
            {
                BloodBagId = bag.Id,
                BloodRequestId = requestToFulfill.Id,
                AllocationDate = DateTime.UtcNow
            };
            
            requestToFulfill.Allocations.Add(allocation);
        }

        // Actualizam statusul cererii
        if (bagsToAllocateCount == neededQuantity)
        {
            requestToFulfill.Status = RequestStatus.Fulfilled;
        }
        else
        {
            requestToFulfill.Status = RequestStatus.PartiallyAllocated;
        }

        // 5. Salvam ambele entitati in DB
        await _bagRepository.UpdateBagsAsync(bagsToAllocate);
        await _requestRepository.UpdateAsync(requestToFulfill);

        string message = $"Alocare reusita: {bagsToAllocateCount} pungi au fost asignate cererii pentru {requestToFulfill.Hospital.Name}. Status cerere: {requestToFulfill.Status}";
        return message;
    }

    // --- Helper Methods: Matricea de Compatibilitate ---

    private List<BloodType> GetCompatibleBloodTypes(BloodType recipientType)
    {
        return recipientType switch
        {
            BloodType.O => new List<BloodType> { BloodType.O },
            BloodType.A => new List<BloodType> { BloodType.A, BloodType.O },
            BloodType.B => new List<BloodType> { BloodType.B, BloodType.O },
            BloodType.AB => new List<BloodType> { BloodType.AB, BloodType.A, BloodType.B, BloodType.O },
            _ => new List<BloodType>()
        };
    }

    private List<RhFactor> GetCompatibleRhFactors(RhFactor recipientRh)
    {
        return recipientRh switch
        {
            RhFactor.Positive => new List<RhFactor> { RhFactor.Positive, RhFactor.Negative },
            RhFactor.Negative => new List<RhFactor> { RhFactor.Negative },
            _ => new List<RhFactor>()
        };
    }

    private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371.0; // Raza Pământului în km
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private double ToRadians(double angle)
    {
        return Math.PI * angle / 180.0;
    }
}

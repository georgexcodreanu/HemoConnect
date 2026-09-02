using System.Collections.Generic;
using System.Threading.Tasks;
using HemoConnect.Domain.Entities;
using HemoConnect.Domain.Enums;

namespace HemoConnect.Application.Interfaces;

public interface IBloodBagRepository
{
    Task<List<BloodBag>> GetAvailableBagsAsync(List<BloodType> compatibleTypes, List<RhFactor> compatibleRhs);
    Task UpdateBagsAsync(IEnumerable<BloodBag> bags);
}

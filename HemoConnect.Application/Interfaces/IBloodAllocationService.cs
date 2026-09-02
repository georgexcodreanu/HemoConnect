using System.Threading.Tasks;

namespace HemoConnect.Application.Interfaces;

public interface IBloodAllocationService
{
    Task<string> ProcessNextAllocationAsync();
}

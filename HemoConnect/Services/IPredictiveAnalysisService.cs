using System.Threading.Tasks;

namespace HemoConnect.Services;

public interface IPredictiveAnalysisService
{
    Task<string> RunPredictiveAnalysisAsync();
}

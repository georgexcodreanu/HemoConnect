using System.Threading.Tasks;

namespace HemoConnect.Services;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
    Task SendCriticalAlertEmailAsync(string toEmail, string hospitalName, string bloodTypeString);
    Task SendPredictiveAlertEmailAsync(string toEmail, string bloodTypeString, string predictedDate);
}

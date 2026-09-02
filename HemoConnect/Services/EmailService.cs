using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace HemoConnect.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
    {
        var smtpServer = _config["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
        var smtpPort = int.TryParse(_config["EmailSettings:SmtpPort"], out int port) ? port : 587;
        var senderEmail = _config["EmailSettings:SenderEmail"];
        var senderPassword = _config["EmailSettings:SenderPassword"];

        if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
        {
            Console.WriteLine($"[EMAIL MOCK] To: {toEmail} | Subject: {subject}");
            return;
        }

        using var client = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(senderEmail, senderPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail, "HemoConnect"),
            Subject = subject,
            Body = htmlMessage,
            IsBodyHtml = true
        };
        
        mailMessage.To.Add(toEmail);

        try
        {
            await client.SendMailAsync(mailMessage);
            Console.WriteLine($"[EMAIL SENT] To: {toEmail} | Subject: {subject}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] Nu am putut trimite e-mail către {toEmail}. Eroare: {ex.Message}");
        }
    }

    public async Task SendCriticalAlertEmailAsync(string toEmail, string hospitalName, string bloodTypeString)
    {
        string subject = $"[URGENT] Nevoie critică de sânge grupa {bloodTypeString}";
        
        string html = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>
            <div style='background: #ef4444; padding: 20px; text-align: center;'>
                <h1 style='color: white; margin: 0;'>🚨 Alertă HemoConnect</h1>
            </div>
            <div style='padding: 30px; background: #ffffff; color: #334155;'>
                <h2 style='color: #0f172a; margin-top: 0;'>Spitalul are nevoie de tine!</h2>
                <p style='font-size: 16px; line-height: 1.5;'>
                    Sistemul nostru a detectat o cerere cu grad de severitate <strong>CRITIC</strong> emisă de <strong>{hospitalName}</strong> pentru grupa ta de sânge (<strong>{bloodTypeString}</strong>).
                </p>
                <p style='font-size: 16px; line-height: 1.5;'>
                    Stocurile actuale nu sunt suficiente pentru a salva viața pacientului. Ești eligibil pentru donare! Te rugăm să intri în platformă și să te programezi la cel mai apropiat centru.
                </p>
                <div style='text-align: center; margin-top: 30px;'>
                    <a href='http://localhost:5173/donor' style='background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;'>Programează-te Acum</a>
                </div>
            </div>
            <div style='background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;'>
                © 2026 HemoConnect. Acest e-mail este generat automat.
            </div>
        </div>";

        await SendEmailAsync(toEmail, subject, html);
    }

    public async Task SendPredictiveAlertEmailAsync(string toEmail, string bloodTypeString, string predictedDate)
    {
        string subject = $"Alerta HemoConnect: Risc de deficit pentru grupa {bloodTypeString}";
        
        string html = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>
            <div style='background: #f59e0b; padding: 20px; text-align: center;'>
                <h1 style='color: white; margin: 0;'>⚠️ Prevenție Deficit de Sânge</h1>
            </div>
            <div style='padding: 30px; background: #ffffff; color: #334155;'>
                <h2 style='color: #0f172a; margin-top: 0;'>Anticipăm o criză de stocuri.</h2>
                <p style='font-size: 16px; line-height: 1.5;'>
                    Sistemul HemoConnect a analizat tendințele de consum din ultima lună și a estimat că <strong>stocul național pentru grupa ta ({bloodTypeString}) va fi insuficient</strong> începând cu data de <strong>{predictedDate}</strong>.
                </p>
                <p style='font-size: 16px; line-height: 1.5;'>
                    Pentru a preveni amânarea operațiilor pacienților, te rugăm să îți aloci câteva minute din timpul tău și să programezi o donare în zilele următoare.
                </p>
                <div style='text-align: center; margin-top: 30px;'>
                    <a href='http://localhost:5173/donor' style='background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;'>Acționează Proactiv</a>
                </div>
            </div>
            <div style='background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;'>
                © 2026 HemoConnect. Proiect de Licență.
            </div>
        </div>";

        await SendEmailAsync(toEmail, subject, html);
    }
}

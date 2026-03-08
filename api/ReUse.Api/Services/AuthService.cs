using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Net;
using System.Net.Mail;

namespace ReUse.Api.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config; 

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<bool> GenerateAndSendOtpAsync(string email)
    {
        // Invalida qualquer código antigo desse usuário para evitar fraudes
        var oldOtps = await _context.OtpCodes
            .Where(o => o.Email == email && !o.IsUsed)
            .ToListAsync();
            
        foreach(var old in oldOtps) { old.IsUsed = true; }

        // Gera os 6 dígitos aleatórios
        var random = new Random();
        var code = random.Next(100000, 999999).ToString();

        // Salva no banco com 5 minutos de validade
        var otp = new OtpCode
        {
            Email = email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        };

        _context.OtpCodes.Add(otp);
        await _context.SaveChangesAsync();
        
       try 
        {
            var senderEmail = _config["Smtp:Email"];
            var senderPassword = _config["Smtp:Password"];

            // Configura o "carteiro" do Google
            using var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true, // Exigência de segurança do Google
            };

            // Monta a carta
            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail!, "ReUse App"),
                Subject = "Seu código de acesso ReUse! ♻️",
                Body = $@"
                    <div style='font-family: sans-serif; padding: 20px; text-align: center; background-color: #f4f4f5; border-radius: 10px;'>
                        <h2 style='color: #18181b;'>Bem-vindo ao ReUse! 🌱</h2>
                        <p style='color: #52525b; font-size: 16px;'>Use o código abaixo para entrar no aplicativo:</p>
                        <div style='margin: 20px auto; padding: 15px; background-color: #ffffff; border: 2px solid #10b981; border-radius: 8px; display: inline-block;'>
                            <strong style='font-size: 32px; color: #059669; letter-spacing: 5px;'>{code}</strong>
                        </div>
                        <p style='color: #71717a; font-size: 14px;'>Este código expira em 5 minutos.</p>
                    </div>",
                IsBodyHtml = true,
            };
            
            // Destinatário (Pode ser qualquer e-mail do mundo!)
            mailMessage.To.Add(email);

            // Envia o e-mail de forma assíncrona
            await smtpClient.SendMailAsync(mailMessage);
            
            Console.WriteLine($"✅ E-mail enviado com sucesso via Gmail para {email}!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Falha crítica ao tentar enviar e-mail via SMTP: {ex.Message}");
        }

        return true;
    }

    public async Task<string?> VerifyOtpAsync(string email, string code)
    {
        var otp = await _context.OtpCodes
            .FirstOrDefaultAsync(o => o.Email == email && o.Code == code && !o.IsUsed);

        if (otp == null || otp.ExpiresAt < DateTime.UtcNow)
            return null; 

        otp.IsUsed = true;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User { Email = email, AuthProvider = "Email" };
            _context.Users.Add(user);
        }

        await _context.SaveChangesAsync();

        // Chamamos o gerador de Token 
        return GenerateJwtToken(user); 
    }
    
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

        // As "Claims" são as informações públicas que ficam dentro do Token
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("AuthProvider", user.AuthProvider)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(double.Parse(jwtSettings["ExpirationInDays"]!)),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(secretKey), 
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token); // Retorna a string do Token ("ey...")
    }
}

using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

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
            using var client = new HttpClient();
            var apiKey = _config["Resend:ApiKey"];
            
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            
            // O Resend permite testar usando este e-mail de remetente oficial deles
            var jsonPayload = $@"{{
                ""from"": ""ReUse App <onboarding@resend.dev>"",
                ""to"": [""{email}""],
                ""subject"": ""Seu código de acesso ReUse!"",
                ""html"": ""<div style='font-family: sans-serif; padding: 20px;'><h2>Bem-vindo ao ReUse! 🌱</h2><p>Seu código de verificação é: <strong><span style='font-size: 24px; color: #059669;'>{code}</span></strong></p><p>Este código expira em 5 minutos.</p></div>""
            }}";

            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("https://api.resend.com/emails", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Erro ao enviar e-mail: {error}");
            }
            else
            {
                Console.WriteLine($"✅ E-mail real enviado com sucesso para {email}!");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Falha crítica ao tentar enviar e-mail: {ex.Message}");
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

using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;

namespace ReUse.Api.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public AuthService(AppDbContext context, IConfiguration config, HttpClient httpClient)
    {
        _context = context;
        _config = config;
        _httpClient = httpClient;
    }

    // ─── OTP (E-mail) ────────────────────────────────────────────────────────

    public async Task<string> GenerateAndSendOtpAsync(string email)
    {
        var oldOtps = await _context.OtpCodes
            .Where(o => o.Email == email && !o.IsUsed)
            .ToListAsync();

        foreach (var old in oldOtps) { old.IsUsed = true; }

        var random = new Random();
        var code = random.Next(100000, 999999).ToString();

        var otp = new OtpCode
        {
            Email = email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        };

        _context.OtpCodes.Add(otp);
        await _context.SaveChangesAsync();

        return code;
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
        return GenerateJwtToken(user);
    }

    // ─── Google OAuth ────────────────────────────────────────────────────────

    /// <summary>
    /// Valida o idToken emitido pelo Google, cria/atualiza o usuário no banco
    /// e retorna um JWT interno do app.
    /// </summary>
    public async Task<string?> GoogleSignInAsync(string idToken)
    {
        // 1. Valida o idToken com a API pública do Google (não requer chave secreta)
        var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(idToken)}";
        HttpResponseMessage response;
        try
        {
            response = await _httpClient.GetAsync(url);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Google] Erro ao chamar tokeninfo: {ex.Message}");
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"[Google] tokeninfo retornou status: {response.StatusCode}");
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // 2. Verifica se o token foi emitido para o nosso app
        var googleSettings = _config.GetSection("Google");
        var webClientId = googleSettings["WebClientId"];
        var androidClientId = googleSettings["AndroidClientId"];

        var aud = root.TryGetProperty("aud", out var audProp) ? audProp.GetString() : null;
        if (aud == null || (aud != webClientId && aud != androidClientId))
        {
            Console.WriteLine($"[Google] Audience inválido: {aud}");
            return null;
        }

        // 3. Extrai os dados do usuário
        var email = root.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : null;
        if (string.IsNullOrEmpty(email))
        {
            Console.WriteLine("[Google] E-mail não encontrado no token.");
            return null;
        }

        var name = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : null;
        var picture = root.TryGetProperty("picture", out var pictureProp) ? pictureProp.GetString() : null;

        // 4. Cria ou atualiza o usuário no banco
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User
            {
                Email = email,
                Name = name,
                ProfilePictureUrl = picture,
                AuthProvider = "Google"
            };
            _context.Users.Add(user);
        }
        else
        {
            // Atualiza nome/foto se vieram do Google
            if (!string.IsNullOrEmpty(name)) user.Name = name;
            if (!string.IsNullOrEmpty(picture)) user.ProfilePictureUrl = picture;
            user.AuthProvider = "Google";
        }

        await _context.SaveChangesAsync();

        return GenerateJwtToken(user);
    }

    // ─── JWT ─────────────────────────────────────────────────────────────────

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

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
        return tokenHandler.WriteToken(token);
    }
}

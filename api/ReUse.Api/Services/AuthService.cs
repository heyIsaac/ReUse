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

    /// Valida o token do Google (idToken ou accessToken), cria/atualiza o usuário
    /// no banco e retorna um JWT interno do app.
    public async Task<string?> GoogleSignInAsync(string? idToken, string? accessToken)
    {
        string? email = null;
        string? name = null;
        string? picture = null;

        if (!string.IsNullOrEmpty(idToken))
        {
            // Caminho 1: valida via tokeninfo (mais seguro — verifica assinatura do token)
            var result = await ValidateIdTokenAsync(idToken);
            if (result == null) return null;
            (email, name, picture) = result.Value;
        }
        else if (!string.IsNullOrEmpty(accessToken))
        {
            // Caminho 2: usa o access_token para buscar os dados do usuário via userinfo
            var result = await GetUserInfoWithAccessTokenAsync(accessToken);
            if (result == null) return null;
            (email, name, picture) = result.Value;
        }
        else
        {
            Console.WriteLine("[Google] Nenhum token fornecido.");
            return null;
        }

        if (string.IsNullOrEmpty(email))
        {
            Console.WriteLine("[Google] E-mail não encontrado.");
            return null;
        }

        // Cria ou atualiza o usuário no banco
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User { Email = email, Name = name, ProfilePictureUrl = picture, AuthProvider = "Google" };
            _context.Users.Add(user);
        }
        else
        {
            if (!string.IsNullOrEmpty(name)) user.Name = name;
            if (!string.IsNullOrEmpty(picture)) user.ProfilePictureUrl = picture;
            user.AuthProvider = "Google";
        }

        await _context.SaveChangesAsync();
        return GenerateJwtToken(user);
    }

    private async Task<(string Email, string? Name, string? Picture)?> ValidateIdTokenAsync(string idToken)
    {
        var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(idToken)}";
        HttpResponseMessage response;
        try { response = await _httpClient.GetAsync(url); }
        catch (Exception ex) { Console.WriteLine($"[Google] Erro tokeninfo: {ex.Message}"); return null; }

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"[Google] tokeninfo status: {response.StatusCode}");
            return null;
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;

        var googleSettings = _config.GetSection("Google");
        var aud = root.TryGetProperty("aud", out var audProp) ? audProp.GetString() : null;
        var webClientId = googleSettings["WebClientId"];
        var androidClientId = googleSettings["AndroidClientId"];

        if (aud == null || (aud != webClientId && aud != androidClientId))
        {
            Console.WriteLine($"[Google] Audience inválido: {aud}");
            return null;
        }

        var email = root.TryGetProperty("email", out var e) ? e.GetString() : null;
        var name = root.TryGetProperty("name", out var n) ? n.GetString() : null;
        var picture = root.TryGetProperty("picture", out var p) ? p.GetString() : null;

        return string.IsNullOrEmpty(email) ? null : (email!, name, picture);
    }

    private async Task<(string Email, string? Name, string? Picture)?> GetUserInfoWithAccessTokenAsync(string accessToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "https://openidconnect.googleapis.com/v1/userinfo");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        HttpResponseMessage response;
        try { response = await _httpClient.SendAsync(request); }
        catch (Exception ex) { Console.WriteLine($"[Google] Erro userinfo: {ex.Message}"); return null; }

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"[Google] userinfo status: {response.StatusCode}");
            return null;
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;

        var email = root.TryGetProperty("email", out var e) ? e.GetString() : null;
        var name = root.TryGetProperty("name", out var n) ? n.GetString() : null;
        var picture = root.TryGetProperty("picture", out var p) ? p.GetString() : null;

        return string.IsNullOrEmpty(email) ? null : (email!, name, picture);
    }


    // ─── Facebook OAuth ──────────────────────────────────────────────────────

    public async Task<string?> FacebookSignInAsync(string accessToken)
    {
        var result = await GetFacebookUserInfoAsync(accessToken);
        if (result == null) return null;

        var (email, name, picture) = result.Value;

        if (string.IsNullOrEmpty(email))
        {
            Console.WriteLine("[Facebook] E-mail não encontrado (permissão pode não ter sido dada).");
            return null;
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User { Email = email, Name = name, ProfilePictureUrl = picture, AuthProvider = "Facebook" };
            _context.Users.Add(user);
        }
        else
        {
            if (!string.IsNullOrEmpty(name)) user.Name = name;
            if (!string.IsNullOrEmpty(picture)) user.ProfilePictureUrl = picture;
            user.AuthProvider = "Facebook";
        }

        await _context.SaveChangesAsync();
        return GenerateJwtToken(user);
    }

    private async Task<(string Email, string? Name, string? Picture)?> GetFacebookUserInfoAsync(string accessToken)
    {
        var url = $"https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token={accessToken}";

        HttpResponseMessage response;
        try { response = await _httpClient.GetAsync(url); }
        catch (Exception ex) { Console.WriteLine($"[Facebook] Erro graph api: {ex.Message}"); return null; }

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"[Facebook] graph api status: {response.StatusCode}");
            return null;
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;

        var email = root.TryGetProperty("email", out var e) ? e.GetString() : null;
        var name = root.TryGetProperty("name", out var n) ? n.GetString() : null;
        var picture = root.TryGetProperty("picture", out var p) && p.TryGetProperty("data", out var d) && d.TryGetProperty("url", out var u) ? u.GetString() : null;

        return string.IsNullOrEmpty(email) ? null : (email!, name, picture);
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

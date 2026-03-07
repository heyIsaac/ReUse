using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.Models;

namespace ReUse.Api.Services;

public class AuthService
{
    private readonly AppDbContext _context;

    public AuthService(AppDbContext context)
    {
        _context = context;
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

        // MOCK: Imprime no terminal em vez de gastar cota de e-mail agora
        Console.WriteLine("\n=============================================");
        Console.WriteLine($"📧 SIMULAÇÃO DE E-MAIL PARA: {email}");
        Console.WriteLine($"🔑 SEU CÓDIGO REUSE É: {code}");
        Console.WriteLine("=============================================\n");

        return true;
    }

    public async Task<string?> VerifyOtpAsync(string email, string code)
    {
        // Busca o código no banco
        var otp = await _context.OtpCodes
            .FirstOrDefaultAsync(o => o.Email == email && o.Code == code && !o.IsUsed);

        // Validações de segurança
        if (otp == null || otp.ExpiresAt < DateTime.UtcNow)
            return null; // Retorna nulo se for inválido ou expirado

        // Marca como usado para não ser reutilizado
        otp.IsUsed = true;

        // Verifica se é um usuário novo ou antigo
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User { Email = email, AuthProvider = "Email" };
            _context.Users.Add(user);
        }

        await _context.SaveChangesAsync();

        // TODO: Na próxima etapa vamos gerar o JWT real aqui
        return "fake-jwt-token-temporario"; 
    }
}

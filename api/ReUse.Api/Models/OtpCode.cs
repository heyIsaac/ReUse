namespace ReUse.Api.Models;

public class OtpCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Email { get; set; } = string.Empty;
    
    public string Code { get; set; } = string.Empty; // código de 6 dígitos
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // O código expira em X minutos. Por segurança, guardamos a data limite.
    public DateTime ExpiresAt { get; set; } 
    
    // Evita que um hacker tente usar o mesmo código duas vezes
    public bool IsUsed { get; set; } = false; 
}

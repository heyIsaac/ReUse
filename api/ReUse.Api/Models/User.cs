namespace ReUse.Api.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // O E-mail será a nossa chave principal de identificação
    public string Email { get; set; } = string.Empty;
    
    // Dados opcionais (vêm preenchidos se o login for Google/Facebook)
    public string? Name { get; set; }
    public string? ProfilePictureUrl { get; set; }
    
    // Para sabermos como a pessoa se cadastrou ("Email", "Google", "Facebook")
    public string AuthProvider { get; set; } = "Email"; 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

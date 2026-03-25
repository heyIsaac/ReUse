namespace ReUse.Api.Models;

public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChatRoomId { get; set; }
    public Guid SenderId { get; set; } // Quem mandou a mensagem
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

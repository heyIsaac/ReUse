namespace ReUse.Api.Models;

public class ChatRoom
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int ListingId { get; set; } // O Desapego que gerou a conversa
    public Guid OwnerId { get; set; } // Dono do item
    public Guid InterestedId { get; set; } // Quem quer o item
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

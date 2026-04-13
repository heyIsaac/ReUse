using System.ComponentModel.DataAnnotations.Schema;

namespace ReUse.Api.Models;

[Table("chat_rooms")]
public class ChatRoom
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("listing_id")]
    public int ListingId { get; set; }

    [Column("owner_id")]
    public Guid OwnerId { get; set; }

    [Column("interested_id")]
    public Guid InterestedId { get; set; }

    [Column("status")]
    public string Status { get; set; } = "active";

    [Column("qr_token")]
    public string? QrToken { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

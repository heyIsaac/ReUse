using System.ComponentModel.DataAnnotations.Schema;

namespace ReUse.Api.Models;

[Table("chat_messages")]
public class ChatMessage
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("chat_room_id")]
    public Guid ChatRoomId { get; set; }

    [Column("sender_id")]
    public Guid SenderId { get; set; }

    [Column("text")]
    public string Text { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

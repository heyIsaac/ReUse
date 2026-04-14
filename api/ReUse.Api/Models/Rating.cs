using System.ComponentModel.DataAnnotations.Schema;

namespace ReUse.Api.Models;

[Table("ratings")]
public class Rating
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("chat_room_id")]
    public Guid ChatRoomId { get; set; }

    [Column("reviewer_id")]
    public Guid ReviewerId { get; set; }

    [Column("reviewed_id")]
    public Guid ReviewedId { get; set; }

    [Column("score")]
    public int Score { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

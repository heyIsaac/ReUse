using System.ComponentModel.DataAnnotations.Schema;

namespace ReUse.Api.Models;

[Table("favorites")]
public class Favorite
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("listing_id")]
    public int ListingId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

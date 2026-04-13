using System.ComponentModel.DataAnnotations.Schema;

namespace ReUse.Api.Models;

[Table("profiles")]
public class User
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string? Name { get; set; }

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

using System.ComponentModel.DataAnnotations.Schema;

namespace ReUse.Api.Models;

[Table("categories")]
public class Category
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

using Microsoft.EntityFrameworkCore;
using ReUse.Api.Models;

namespace ReUse.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Profiles { get; set; }
    public DbSet<Listing> Listings { get; set; }
    public DbSet<ChatRoom> ChatRooms { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().ToTable("profiles");
        modelBuilder.Entity<Listing>().ToTable("listings");
        modelBuilder.Entity<ChatRoom>().ToTable("chat_rooms");
        modelBuilder.Entity<ChatMessage>().ToTable("chat_messages");
    }
}

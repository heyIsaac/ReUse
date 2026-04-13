using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.Models;

namespace ReUse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/favorites")]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavoritesController(AppDbContext context) { _context = context; }

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var favorites = await _context.Favorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Join(_context.Listings, f => f.ListingId, l => l.Id, (f, l) => new { f, l })
            .Select(x => new
            {
                x.l.Id,
                x.l.Title,
                x.l.Category,
                x.l.Condition,
                x.l.Description,
                x.l.Images,
                x.l.CreatedAt,
                Owner = new
                {
                    Id = x.l.User.Id,
                    x.l.User.Name,
                    x.l.User.AvatarUrl,
                },
                FavoritedAt = x.f.CreatedAt
            })
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpGet("ids")]
    public async Task<IActionResult> GetFavoriteIds()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var ids = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Select(f => f.ListingId)
            .ToListAsync();

        return Ok(ids);
    }

    [HttpPost("{listingId}")]
    public async Task<IActionResult> AddFavorite(int listingId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var exists = await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.ListingId == listingId);
        if (exists) return Ok(new { message = "Já favoritado" });

        _context.Favorites.Add(new Favorite { UserId = userId.Value, ListingId = listingId });
        await _context.SaveChangesAsync();

        return Ok(new { message = "Favoritado!" });
    }

    [HttpDelete("{listingId}")]
    public async Task<IActionResult> RemoveFavorite(int listingId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var fav = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.ListingId == listingId);
        if (fav == null) return NotFound();

        _context.Favorites.Remove(fav);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Removido dos favoritos" });
    }
}

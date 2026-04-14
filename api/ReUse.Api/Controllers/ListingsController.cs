using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.Models;

namespace ReUse.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ListingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ListingsController(AppDbContext context)
    {
        _context = context;
    }

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetListings([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize > 50) pageSize = 50;

        var listings = await _context.Listings
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.Id,
                l.Title,
                l.Category,
                l.Condition,
                l.Description,
                l.Images,
                l.CreatedAt,
                Owner = new
                {
                    Id = l.User.Id,
                    l.User.Name,
                    l.User.AvatarUrl,
                }
            })
            .ToListAsync();

        return Ok(listings);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateListing([FromBody] CreateListingRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var listing = new Listing
        {
            Title = request.Title,
            Category = request.Category,
            Condition = request.Condition,
            Description = request.Description,
            Images = request.Images ?? new List<string>(),
            UserId = userId.Value,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Address = request.Address
        };

        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetListing), new { id = listing.Id }, listing);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetListing(int id)
    {
        var listing = await _context.Listings
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (listing == null) return NotFound();

        return Ok(new
        {
            listing.Id,
            listing.Title,
            listing.Category,
            listing.Condition,
            listing.Description,
            listing.Images,
            listing.CreatedAt,
            Owner = new
            {
                Id = listing.User.Id,
                listing.User.Name,
                listing.User.AvatarUrl,
            }
        });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateListing(int id, [FromBody] CreateListingRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var listing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id);
        if (listing == null) return NotFound();
        if (listing.UserId != userId.Value) return Forbid();

        listing.Title = request.Title;
        listing.Category = request.Category;
        listing.Condition = request.Condition;
        listing.Description = request.Description;
        listing.Images = request.Images ?? listing.Images;

        await _context.SaveChangesAsync();
        return Ok(listing);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteListing(int id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var listing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id);
        if (listing == null) return NotFound();
        if (listing.UserId != userId.Value) return Forbid();

        _context.Listings.Remove(listing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateListingRequest
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new List<string>();
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? Address { get; set; }
}

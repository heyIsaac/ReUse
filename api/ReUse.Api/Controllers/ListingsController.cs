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

    /// <summary>
    /// Feed público — retorna todos os desapegos em ordem decrescente de criação.
    /// Não requer autenticação para que visitantes também possam ver o feed.
    /// </summary>
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
                    l.User.Name,
                    l.User.ProfilePictureUrl,
                }
            })
            .ToListAsync();

        return Ok(listings);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateListing([FromBody] CreateListingRequest request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        var listing = new Listing
        {
            Title = request.Title,
            Category = request.Category,
            Condition = request.Condition,
            Description = request.Description,
            Images = request.Images ?? new List<string>(),
            UserId = user.Id
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
        return Ok(listing);
    }
}

public class CreateListingRequest
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new List<string>();
}

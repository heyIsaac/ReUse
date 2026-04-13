using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.Models;

namespace ReUse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/ratings")]
public class RatingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RatingsController(AppDbContext context) { _context = context; }

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRating([FromBody] CreateRatingRequest req)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var room = await _context.ChatRooms.FindAsync(req.ChatRoomId);
        if (room == null) return NotFound();
        if (room.Status != "completed") return BadRequest(new { Message = "A doação precisa estar concluída para avaliar." });
        if (room.OwnerId != userId && room.InterestedId != userId) return Forbid();

        var reviewedId = room.OwnerId == userId ? room.InterestedId : room.OwnerId;

        var exists = await _context.Ratings.AnyAsync(r => r.ChatRoomId == req.ChatRoomId && r.ReviewerId == userId);
        if (exists) return BadRequest(new { Message = "Você já avaliou esta negociação." });

        var rating = new Rating
        {
            ChatRoomId = req.ChatRoomId,
            ReviewerId = userId.Value,
            ReviewedId = reviewedId,
            Score = Math.Clamp(req.Score, 1, 5),
            Comment = req.Comment,
        };

        _context.Ratings.Add(rating);

        _context.Notifications.Add(new Notification
        {
            UserId = reviewedId,
            Type = "rating",
            Title = "Nova avaliação",
            Body = $"Você recebeu uma avaliação de {req.Score} estrelas!",
        });

        await _context.SaveChangesAsync();

        return Ok(new { message = "Avaliação enviada!" });
    }

    [HttpGet("user/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserRatings(Guid userId)
    {
        var ratings = await _context.Ratings
            .Where(r => r.ReviewedId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Score,
                r.Comment,
                r.CreatedAt,
                Reviewer = new
                {
                    Id = r.ReviewerId,
                    _context.Profiles.First(p => p.Id == r.ReviewerId).Name,
                    _context.Profiles.First(p => p.Id == r.ReviewerId).AvatarUrl,
                }
            })
            .ToListAsync();

        var avg = ratings.Count > 0 ? ratings.Average(r => r.Score) : 0;

        return Ok(new { average = Math.Round(avg, 1), count = ratings.Count, ratings });
    }

    [HttpGet("check/{chatRoomId}")]
    public async Task<IActionResult> CheckIfRated(Guid chatRoomId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var rated = await _context.Ratings.AnyAsync(r => r.ChatRoomId == chatRoomId && r.ReviewerId == userId);
        return Ok(new { rated });
    }
}

public class CreateRatingRequest
{
    public Guid ChatRoomId { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
}

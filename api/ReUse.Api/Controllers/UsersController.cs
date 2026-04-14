using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;

namespace ReUse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(new { Message = "Token inválido." });

        var profile = await _context.Profiles.FindAsync(userId.Value);

        if (profile == null)
            return NotFound(new { Message = "Perfil não encontrado. Complete o cadastro." });

        return Ok(new
        {
            Id = profile.Id,
            Name = profile.Name,
            AvatarUrl = profile.AvatarUrl,
            CreatedAt = profile.CreatedAt
        });
    }

    [HttpPut("me/avatar")]
    public async Task<IActionResult> UpdateAvatar([FromBody] UpdateAvatarRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(new { Message = "Token inválido." });

        if (string.IsNullOrEmpty(request.AvatarUrl))
            return BadRequest(new { Message = "A URL do avatar é obrigatória." });

        var profile = await _context.Profiles.FindAsync(userId.Value);

        if (profile == null)
            return NotFound(new { Message = "Perfil não encontrado." });

        profile.AvatarUrl = request.AvatarUrl;
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Avatar atualizado!", AvatarUrl = profile.AvatarUrl });
    }
}

public class UpdateAvatarRequest
{
    public string AvatarUrl { get; set; } = string.Empty;
}

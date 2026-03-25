using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;

using ReUse.Api.Models;

namespace ReUse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context) { _context = context; }

    // ROTA 1: Quando alguém clica no botão "Entrar em Contato" no item
    [HttpPost("start")]
    public async Task<IActionResult> StartChat([FromBody] StartChatRequest req)
    {
        var myId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        // Verifica se a sala já existe
        var existingRoom = await _context.ChatRooms
            .FirstOrDefaultAsync(r => r.ListingId == req.ListingId && r.InterestedId == myId);

        if (existingRoom != null) return Ok(new { roomId = existingRoom.Id });

        // Se não existir, cria uma nova sala
        var newRoom = new ChatRoom { ListingId = req.ListingId, OwnerId = req.OwnerId, InterestedId = myId };
        _context.ChatRooms.Add(newRoom);
        await _context.SaveChangesAsync();

        return Ok(new { roomId = newRoom.Id });
    }

    // ROTA 2: Pega o histórico quando abre a tela
    [HttpGet("{roomId}/messages")]
    public async Task<IActionResult> GetHistory(Guid roomId)
    {
        var messages = await _context.ChatMessages
            .Where(m => m.ChatRoomId == roomId)
            .OrderBy(m => m.CreatedAt) // Mais antigas primeiro
            .ToListAsync();
        return Ok(messages);
    }
}

public class StartChatRequest { public int ListingId { get; set; } public Guid OwnerId { get; set; } }

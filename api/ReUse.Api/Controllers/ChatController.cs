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

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    [HttpGet("my-listings")]
    public async Task<IActionResult> GetMyListingsWithChats()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var listingIds = await _context.ChatRooms
            .Where(r => r.OwnerId == userId)
            .Select(r => r.ListingId)
            .Distinct()
            .ToListAsync();

        var results = new List<object>();
        foreach (var lid in listingIds)
        {
            var listing = await _context.Listings.FindAsync(lid);
            if (listing == null) continue;

            var count = await _context.ChatRooms
                .CountAsync(r => r.ListingId == lid && r.OwnerId == userId);

            var lastMsg = await _context.ChatMessages
                .Where(m => _context.ChatRooms.Any(r => r.Id == m.ChatRoomId && r.ListingId == lid && r.OwnerId == userId))
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new { m.Text, m.CreatedAt })
                .FirstOrDefaultAsync();

            results.Add(new
            {
                ListingId = listing.Id,
                listing.Title,
                Image = listing.Images.FirstOrDefault(),
                InterestedCount = count,
                LastMessage = lastMsg
            });
        }

        return Ok(results);
    }

    [HttpGet("my-interests")]
    public async Task<IActionResult> GetMyInterests()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var rooms = await _context.ChatRooms
            .Where(r => r.InterestedId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var results = new List<object>();
        foreach (var room in rooms)
        {
            var listing = await _context.Listings.FindAsync(room.ListingId);
            var owner = await _context.Profiles.FindAsync(room.OwnerId);
            var lastMsg = await _context.ChatMessages
                .Where(m => m.ChatRoomId == room.Id)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new { m.Text, m.CreatedAt, m.SenderId })
                .FirstOrDefaultAsync();

            results.Add(new
            {
                RoomId = room.Id,
                room.Status,
                Listing = listing == null ? null : new { listing.Id, listing.Title, Image = listing.Images.FirstOrDefault() },
                Owner = owner == null ? null : new { owner.Id, owner.Name, owner.AvatarUrl },
                LastMessage = lastMsg
            });
        }

        return Ok(results);
    }

    [HttpGet("listing/{listingId}/conversations")]
    public async Task<IActionResult> GetListingConversations(int listingId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var listing = await _context.Listings.FindAsync(listingId);
        if (listing == null) return NotFound();
        if (listing.UserId != userId) return Forbid();

        var rooms = await _context.ChatRooms
            .Where(r => r.ListingId == listingId && r.OwnerId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var results = new List<object>();
        foreach (var room in rooms)
        {
            var interested = await _context.Profiles.FindAsync(room.InterestedId);
            var lastMsg = await _context.ChatMessages
                .Where(m => m.ChatRoomId == room.Id)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new { m.Text, m.CreatedAt, m.SenderId })
                .FirstOrDefaultAsync();

            results.Add(new
            {
                RoomId = room.Id,
                room.Status,
                Interested = interested == null ? null : new { interested.Id, interested.Name, interested.AvatarUrl },
                LastMessage = lastMsg
            });
        }

        return Ok(results);
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> GetMyRooms()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var rooms = await _context.ChatRooms
            .Where(r => r.OwnerId == userId || r.InterestedId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Status,
                r.CreatedAt,
                Listing = new
                {
                    r.ListingId,
                    _context.Listings.First(l => l.Id == r.ListingId).Title,
                    Image = _context.Listings.First(l => l.Id == r.ListingId).Images.FirstOrDefault()
                },
                OtherUser = r.OwnerId == userId
                    ? new { Id = r.InterestedId, _context.Profiles.First(p => p.Id == r.InterestedId).Name, _context.Profiles.First(p => p.Id == r.InterestedId).AvatarUrl }
                    : new { Id = r.OwnerId, _context.Profiles.First(p => p.Id == r.OwnerId).Name, _context.Profiles.First(p => p.Id == r.OwnerId).AvatarUrl },
                LastMessage = _context.ChatMessages
                    .Where(m => m.ChatRoomId == r.Id)
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new { m.Text, m.CreatedAt, m.SenderId })
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(rooms);
    }

    [HttpGet("{roomId}")]
    public async Task<IActionResult> GetRoom(Guid roomId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return NotFound();
        if (room.OwnerId != userId && room.InterestedId != userId) return Forbid();

        var otherId = room.OwnerId == userId ? room.InterestedId : room.OwnerId;
        var otherUser = await _context.Profiles.FindAsync(otherId);
        var listing = await _context.Listings.FindAsync(room.ListingId);

        return Ok(new
        {
            room.Id,
            room.Status,
            room.OwnerId,
            room.InterestedId,
            Listing = listing == null ? null : new { listing.Id, listing.Title, Image = listing.Images.FirstOrDefault() },
            OtherUser = otherUser == null ? null : new { otherUser.Id, otherUser.Name, otherUser.AvatarUrl }
        });
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartChat([FromBody] StartChatRequest req)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (req.OwnerId == userId)
            return BadRequest(new { Message = "Você não pode iniciar um chat consigo mesmo." });

        var existingRoom = await _context.ChatRooms
            .FirstOrDefaultAsync(r => r.ListingId == req.ListingId && r.InterestedId == userId);

        if (existingRoom != null) return Ok(new { roomId = existingRoom.Id });

        var newRoom = new ChatRoom
        {
            ListingId = req.ListingId,
            OwnerId = req.OwnerId,
            InterestedId = userId.Value
        };
        _context.ChatRooms.Add(newRoom);

        var listing = await _context.Listings.FindAsync(req.ListingId);
        _context.Notifications.Add(new Notification
        {
            UserId = req.OwnerId,
            Type = "new_interest",
            Title = "Novo interessado!",
            Body = $"Alguém se interessou pelo seu anúncio \"{listing?.Title ?? "item"}\".",
        });

        await _context.SaveChangesAsync();

        return Ok(new { roomId = newRoom.Id });
    }

    [HttpGet("{roomId}/messages")]
    public async Task<IActionResult> GetHistory(Guid roomId)
    {
        var messages = await _context.ChatMessages
            .Where(m => m.ChatRoomId == roomId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
        return Ok(messages);
    }

    [HttpPost("{roomId}/generate-qr")]
    public async Task<IActionResult> GenerateQr(Guid roomId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return NotFound();
        if (room.OwnerId != userId) return BadRequest(new { Message = "Apenas o dono pode gerar o QR." });
        if (room.Status == "completed") return BadRequest(new { Message = "Negociação já concluída." });

        room.QrToken = Guid.NewGuid().ToString("N");
        await _context.SaveChangesAsync();

        return Ok(new { qrToken = room.QrToken, qrData = $"reuse://confirm/{roomId}/{room.QrToken}" });
    }

    [HttpPost("{roomId}/confirm-delivery")]
    public async Task<IActionResult> ConfirmDelivery(Guid roomId, [FromBody] ConfirmDeliveryRequest req)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return NotFound();
        if (room.InterestedId != userId) return BadRequest(new { Message = "Apenas o interessado pode confirmar." });
        if (room.Status == "completed") return BadRequest(new { Message = "Já concluída." });
        if (room.QrToken == null || room.QrToken != req.Token) return BadRequest(new { Message = "QR Code inválido." });

        room.Status = "completed";

        var listing = await _context.Listings.FindAsync(room.ListingId);
        if (listing != null) listing.Condition = "Entregue";

        var otherId = room.OwnerId;
        _context.Notifications.Add(new Notification
        {
            UserId = otherId,
            Type = "completed",
            Title = "Doação concluída!",
            Body = $"O item \"{listing?.Title ?? ""}\" foi confirmado como entregue!",
        });

        var favUsers = await _context.Favorites
            .Where(f => f.ListingId == room.ListingId && f.UserId != userId && f.UserId != otherId)
            .Select(f => f.UserId)
            .ToListAsync();

        foreach (var favUserId in favUsers)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = favUserId,
                Type = "favorite_donated",
                Title = "Item doado",
                Body = $"O item \"{listing?.Title ?? ""}\" que você salvou já foi doado.",
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Entrega confirmada!" });
    }

    [HttpPut("{roomId}/complete")]
    public async Task<IActionResult> CompleteChat(Guid roomId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return NotFound();
        if (room.OwnerId != userId && room.InterestedId != userId) return Forbid();

        room.Status = "completed";

        var listing = await _context.Listings.FindAsync(room.ListingId);
        if (listing != null) listing.Condition = "Entregue";

        var otherId = room.OwnerId == userId ? room.InterestedId : room.OwnerId;
        _context.Notifications.Add(new Notification
        {
            UserId = otherId,
            Type = "completed",
            Title = "Doação concluída!",
            Body = $"O item \"{listing?.Title ?? ""}\" foi marcado como entregue. Avalie a experiência!",
        });

        var favUsers = await _context.Favorites
            .Where(f => f.ListingId == room.ListingId && f.UserId != userId && f.UserId != otherId)
            .Select(f => f.UserId)
            .ToListAsync();

        foreach (var favUserId in favUsers)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = favUserId,
                Type = "favorite_donated",
                Title = "Item doado",
                Body = $"O item \"{listing?.Title ?? ""}\" que você salvou já foi doado.",
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Negociação concluída!", status = room.Status });
    }
}

public class StartChatRequest
{
    public int ListingId { get; set; }
    public Guid OwnerId { get; set; }
}

public class ConfirmDeliveryRequest
{
    public string Token { get; set; } = string.Empty;
}

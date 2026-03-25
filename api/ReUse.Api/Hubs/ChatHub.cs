using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

using System;
using System.Threading.Tasks;
using ReUse.Api.Data;
using ReUse.Api.Models;

namespace ReUse.Api.Hubs;

[Authorize] // Só aceita conexões com JWT válido
public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    // 1. O Celular pede para entrar na "Sala"
    public async Task JoinChatGroup(string chatRoomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);
    }

    // 2. O Celular envia uma mensagem
    public async Task SendMessage(string chatRoomId, string text)
    {
        // Pega o ID do usuário através do Token JWT
        var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Salva a mensagem no Banco de Dados (PostgreSQL)
        var message = new ChatMessage
        {
            ChatRoomId = Guid.Parse(chatRoomId),
            SenderId = Guid.Parse(userId),
            Text = text,
            CreatedAt = DateTime.UtcNow
        };
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        // Dispara a mensagem para todos os celulares conectados nesta Sala
        await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", new
        {
            id = message.Id,
            senderId = message.SenderId,
            text = message.Text,
            createdAt = message.CreatedAt
        });
    }
}

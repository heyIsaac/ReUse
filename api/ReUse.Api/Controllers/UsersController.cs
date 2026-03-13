using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReUse.Api.Data;
using ReUse.Api.DTOs;

namespace ReUse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Apenas usuários autenticados com JWT válido podem acessar
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Pega o e-mail do token JWT injetado no HttpContext
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");

        if (string.IsNullOrEmpty(email))
            return Unauthorized(new { Message = "Token inválido ou sem e-mail." });

        // Busca o usuário no banco de dados
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return NotFound(new { Message = "Usuário não encontrado." });

        // Retorna apenas os dados públicos/necessários para o Perfil (sem expor senhas ou dados sensíveis futuramente)
        return Ok(new
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            ProfilePictureUrl = user.ProfilePictureUrl,
            AuthProvider = user.AuthProvider,
            CreatedAt = user.CreatedAt
        });
    }
}

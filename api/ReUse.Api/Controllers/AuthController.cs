using Microsoft.AspNetCore.Mvc;
using ReUse.Api.DTOs;
using ReUse.Api.Services;

namespace ReUse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    // Injeção de dependência do nosso serviço
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        await _authService.GenerateAndSendOtpAsync(request.Email);
        return Ok(new { Message = "Código enviado com sucesso. Olhe o terminal!" });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var token = await _authService.VerifyOtpAsync(request.Email, request.Code);
        
        if (token == null)
            return BadRequest(new { Message = "Código inválido ou expirado." });

        // Devolvemos o DTO de sucesso com o e-mail e o Token
        return Ok(new AuthResponse(request.Email, token));
    }
}

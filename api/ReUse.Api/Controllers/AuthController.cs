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
        var generatedCode = await _authService.GenerateAndSendOtpAsync(request.Email);
        
        return Ok(new { message = "Código gerado com sucesso", code = generatedCode });
    }
    
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var token = await _authService.VerifyOtpAsync(request.Email, request.Code);
        
        if (token == null)
            return BadRequest(new { Message = "Código inválido ou expirado." });

        return Ok(new AuthResponse(request.Email, token));
    }

    [HttpPost("google-signin")]
    public async Task<IActionResult> GoogleSignIn([FromBody] GoogleSignInRequest request)
    {
        if (string.IsNullOrEmpty(request.IdToken))
            return BadRequest(new { Message = "idToken é obrigatório." });

        var token = await _authService.GoogleSignInAsync(request.IdToken);

        if (token == null)
            return Unauthorized(new { Message = "Token do Google inválido ou expirado." });

        // O e-mail virá do token validado — aqui retornamos apenas o JWT interno
        // O cliente React Native pode decodificar o JWT para ler o e-mail se precisar
        return Ok(new { Token = token });
    }
}

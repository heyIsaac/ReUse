using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReUse.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IConfiguration _config;

    public UploadController(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>
    /// Gera uma assinatura temporária para upload direto ao Cloudinary.
    /// O celular usa essa assinatura para fazer upload sem passar pelo backend.
    /// </summary>
    [HttpPost("signature")]
    public IActionResult GetUploadSignature([FromBody] SignatureRequest? request)
    {
        var cloudinary = _config.GetSection("Cloudinary");
        var cloudName = cloudinary["CloudName"];
        var apiKey = cloudinary["ApiKey"];
        var apiSecret = cloudinary["ApiSecret"];

        if (string.IsNullOrEmpty(apiSecret) || string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey))
            return StatusCode(500, new { Message = "Cloudinary não configurado no servidor." });

        var folder = request?.Folder ?? "listings";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        // Parâmetros assinados (ordem alfabética obrigatória pelo Cloudinary)
        var paramsToSign = $"folder={folder}&timestamp={timestamp}";

        // HMAC-SHA1 da string "params+ApiSecret"
        var toHash = paramsToSign + apiSecret;
        var signature = Sha1Hex(toHash);

        return Ok(new
        {
            signature,
            apiKey,
            cloudName,
            timestamp,
            folder,
        });
    }

    private static string Sha1Hex(string input)
    {
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA1.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}

public class SignatureRequest
{
    public string? Folder { get; set; }
}

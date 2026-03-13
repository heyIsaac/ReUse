namespace ReUse.Api.DTOs;

public record SendOtpRequest(string Email);

public record VerifyOtpRequest(string Email, string Code);

public record AuthResponse(string Email, string Token);
public record GoogleSignInRequest(string? IdToken = null, string? AccessToken = null);

public record FacebookSignInRequest(string AccessToken);

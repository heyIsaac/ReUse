namespace ReUse.Api.DTOs;

// 1. O envelope que o React Native manda quando o usuário digita o e-mail e clica em "Enter"
public record SendOtpRequest(string Email);

// 2. O envelope que o React Native manda quando o usuário digita os 6 números e clica em "Verify"
public record VerifyOtpRequest(string Email, string Code);

// 3. A nossa resposta de sucesso devolvendo o Crachá de Acesso (Token)
public record AuthResponse(string Email, string Token);

// 4. O envelope que vem do React Native quando o usuário fez login com Google
//    IdToken é o token emitido pelo Google que o backend precisa validar
public record GoogleSignInRequest(string IdToken);

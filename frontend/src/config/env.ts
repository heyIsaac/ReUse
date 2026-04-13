/**
 * Configuração centralizada de ambiente.
 *
 * Todas as variáveis EXPO_PUBLIC_* são lidas aqui uma única vez e
 * exportadas com tipagem forte. Nenhum outro arquivo do app deve
 * acessar `process.env` diretamente — importe deste módulo.
 *
 * Para trocar de ambiente basta alterar o `.env` (ou criar um
 * `.env.local` com overrides que não vai para o git).
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`[env] Variável ${name} não definida — verifique seu .env`);
  }
  return value ?? "";
}

const API_URL = required("EXPO_PUBLIC_API_URL");

/**
 * Deriva a URL base do SignalR a partir da API_URL.
 * Ex.: "http://192.168.0.10:5251/api" → "http://192.168.0.10:5251/chathub"
 *      "https://reuse.onrender.com/api" → "https://reuse.onrender.com/chathub"
 */
function deriveSignalRUrl(apiUrl: string): string {
  try {
    const url = new URL(apiUrl);
    url.pathname = "/chathub";
    return url.toString().replace(/\/$/, "");
  } catch {
    return apiUrl.replace(/\/api\/?$/, "/chathub");
  }
}

export const env = {
  API_URL,
  SIGNALR_URL: deriveSignalRUrl(API_URL),

  EMAILJS_SERVICE_ID: required("EXPO_PUBLIC_EMAILJS_SERVICE_ID"),
  EMAILJS_TEMPLATE_ID: required("EXPO_PUBLIC_EMAILJS_TEMPLATE_ID"),
  EMAILJS_PUBLIC_KEY: required("EXPO_PUBLIC_EMAILJS_PUBLIC_KEY"),

  GOOGLE_WEB_CLIENT_ID: required("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"),
  GOOGLE_ANDROID_CLIENT_ID: required("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"),

  FACEBOOK_APP_ID: required("EXPO_PUBLIC_FACEBOOK_APP_ID"),
  FACEBOOK_CLIENT_TOKEN: required("EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN"),
} as const;

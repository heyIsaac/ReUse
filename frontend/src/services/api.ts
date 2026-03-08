import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://reuse-9fal.onrender.com/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
});

// Interceptor: Toda vez que o app for fazer um request (ex: postar produto),
// ele automaticamente injeta o Token JWT no cabeçalho se o usuário estiver logado.
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("reuse_jwt_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

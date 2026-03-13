import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// const BASE_URL = "https://reuse-9fal.onrender.com/api";
const BASE_URL = "http://192.168.0.108:5251/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
});


api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("reuse_jwt_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error("🚨 [API] Token expirado ou inválido. Deslogando usuário...");

      await SecureStore.deleteItemAsync("reuse_jwt_token");

      router.replace("/(auth)/login");
    }

    return Promise.reject(error);
  }
);

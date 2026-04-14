import axios from "axios";
import { router } from "expo-router";

import { env } from "@/src/config/env";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: env.API_URL,
  timeout: 50000,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    }

    return Promise.reject(error);
  }
);

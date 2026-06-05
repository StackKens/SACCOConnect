import axios from "axios";
import { createMMKV } from "react-native-mmkv";

const tokenStorage = createMMKV({ id: "auth" });

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://api.saccoconnect.com",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getString("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

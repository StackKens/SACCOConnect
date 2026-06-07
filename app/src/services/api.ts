import axios from "axios";
import { Platform } from "react-native";
import { createMMKV } from "react-native-mmkv";

const tokenStorage = createMMKV({ id: "auth" });

const defaultBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");

export const api = axios.create({
  baseURL: defaultBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getString("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

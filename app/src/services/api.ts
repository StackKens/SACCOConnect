import axios from "axios";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";
import Constants from "expo-constants";

const tokenStorage = new MMKV({ id: "auth" });

const defaultBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://127.0.0.1:3000");

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

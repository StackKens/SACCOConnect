import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";
import Constants from "expo-constants";
import { USE_MOCK_API } from "../constants/config";
import { mockAxiosAdapter } from "./api.mock";
import { getRefreshToken, clearRefreshToken, setAccessToken } from "./tokenStorage";

const tokenStorage = new MMKV({ id: "auth" });

const defaultBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://127.0.0.1:3000");

export const api = axios.create({
  baseURL: defaultBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  adapter: USE_MOCK_API ? mockAxiosAdapter : undefined,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getString("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Registered by auth.store so the interceptor can force re-auth on refresh failure. */
let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(cb: (() => void) | null) {
  onAuthFailure = cb;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;
    try {
      const res = await api.post<{ success: boolean; data: { accessToken: string } }>(
        "/api/auth/refresh",
        { token: refreshToken },
      );
      const nextToken = res.data.data.accessToken;
      setAccessToken(nextToken);
      return nextToken;
    } catch {
      await clearRefreshToken();
      onAuthFailure?.();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

const isAuthPath = (url?: string) =>
  !url ||
  url.includes("/api/auth/");

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !isAuthPath(config.url)
    ) {
      config._retried = true;
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        config.headers.Authorization = `Bearer ${nextToken}`;
        return api.request(config);
      }
    }
    return Promise.reject(error);
  },
);

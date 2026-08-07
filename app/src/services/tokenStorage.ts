import * as SecureStore from "expo-secure-store";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "auth" });
const REFRESH_TOKEN_KEY = "refresh_token";

export function setAccessToken(token: string) {
  storage.set("token", token);
}

export function getAccessToken() {
  return storage.getString("token");
}

export function clearAccessToken() {
  storage.delete("token");
}

export async function setRefreshToken(token: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

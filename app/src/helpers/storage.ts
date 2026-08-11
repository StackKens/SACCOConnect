import { getSecureStorage } from "../services/secureStorage";

export const storage = getSecureStorage("sacco-storage");

export const getItem = <T>(key: string): T | null => {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : null;
};
export const setItem = (key: string, value: any): void => {
  storage.set(key, JSON.stringify(value));
};
export const removeItem = (key: string): void => {
  storage.delete(key);
};

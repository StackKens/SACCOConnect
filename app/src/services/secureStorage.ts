import { MMKV } from "react-native-mmkv";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const ENCRYPTION_KEY_NAME = "sacco_mmkv_encryption_key_v1";

const instances = new Map<string, MMKV>();
let encryptionKey: string | undefined;

// base64url without padding. 12 bytes encode to exactly 16 characters,
// the maximum MMKV allows for an encryption key (16 bytes / 96 bits entropy).
function base64UrlEncode(bytes: Uint8Array): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += chars[b0 >> 2];
    out += chars[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : "";
    out += i + 2 < bytes.length ? chars[b2 & 63] : "";
  }
  return out;
}

async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  if (existing) return existing;
  const generated = base64UrlEncode(Crypto.getRandomBytes(12));
  await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, generated);
  return generated;
}

// Must be called once at app startup before any storage is read/written.
export async function initSecureStorage(): Promise<void> {
  if (encryptionKey) return;
  const key = await getOrCreateEncryptionKey();
  encryptionKey = key;
  for (const instance of instances.values()) {
    instance.recrypt(key);
  }
}

// Returns the single MMKV instance for an id. Instances created before
// initSecureStorage() complete are encrypted in place via recrypt();
// instances created after already carry the encryption key.
export function getSecureStorage(id: string): MMKV {
  let instance = instances.get(id);
  if (!instance) {
    instance = new MMKV({ id, encryptionKey });
    instances.set(id, instance);
  }
  return instance;
}

// Local filesystem storage for self-hosted deployment
import { promises as fs } from "fs";
import path from "path";
import { ENV } from "./_core/env";

function ensureStorageDir(): string {
  return ENV.storageDir;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const storageDir = ensureStorageDir();
  const filePath = path.join(storageDir, key);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // Write file
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  await fs.writeFile(filePath, buffer);
  
  // Return relative URL path (will be served by express.static)
  const url = `/uploads/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = `/uploads/${key}`;
  return { key, url };
}

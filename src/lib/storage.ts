import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Local filesystem storage abstraction. For production, swap the body of
// saveUpload() for an S3-compatible client (see DEPLOY.md) — the call sites
// only depend on the returned { storedName, originalName }.
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export async function saveUpload(file: File): Promise<{ storedName: string; originalName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const storedName = `${randomUUID()}${ext}`;
  const dir = path.resolve(process.cwd(), UPLOAD_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storedName), buffer);
  return { storedName, originalName: file.name };
}

export function uploadFilePath(storedName: string): string {
  return path.join(path.resolve(process.cwd(), UPLOAD_DIR), storedName);
}

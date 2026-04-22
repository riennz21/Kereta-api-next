import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { del, put } from "@vercel/blob";
import { getImageUrl, isAllowedImageFilename } from "./train-utils";

const localUploadDir = path.join(process.cwd(), "public", "uploads", "kereta");

async function ensureLocalUploadDir() {
  await fs.mkdir(localUploadDir, { recursive: true });
}

function getExtension(filename = "") {
  return path.extname(filename || "").toLowerCase();
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function persistUploadedFile(file) {
  if (!file || !file.originalname) {
    return null;
  }

  if (!isAllowedImageFilename(file.originalname)) {
    throw new Error("Format gambar tidak didukung.");
  }

  const extension = getExtension(file.originalname);
  const generatedName = `${crypto.randomUUID()}${extension}`;

  if (hasBlobToken()) {
    const blob = await put(`kereta/${generatedName}`, file.buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.mimetype || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("Upload gambar di Vercel membutuhkan BLOB_READ_WRITE_TOKEN.");
  }

  await ensureLocalUploadDir();
  await fs.writeFile(path.join(localUploadDir, generatedName), file.buffer);
  return `/uploads/kereta/${generatedName}`;
}

export async function removeStoredImage(image) {
  if (!image) return;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    if (hasBlobToken()) {
      await del(image, { token: process.env.BLOB_READ_WRITE_TOKEN });
    }
    return;
  }

  const normalizedPath = getImageUrl(image).replace("/uploads/kereta/", "");
  const targetPath = path.join(localUploadDir, normalizedPath);

  try {
    await fs.unlink(targetPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

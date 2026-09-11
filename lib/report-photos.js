import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api-handler";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_TOTAL_PHOTO_BYTES } from "@/lib/photo-limits";

export function validatePhotos(photos) {
  if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) {
    throw new ApiError(400, "写真は5枚まで登録できます。");
  }
  let total = 0;
  return photos.map((photo) => {
    const match = typeof photo?.url === "string"
      ? /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo.url)
      : null;
    if (!match) throw new ApiError(400, "写真を選択し直してください（JPEG・PNG・WebPのみ）。");
    const bytes = Buffer.from(match[2], "base64");
    const validType = match[1] === "png"
      ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : match[1] === "jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    if (!validType || bytes.toString("base64") !== match[2]) {
      throw new ApiError(400, "写真データが不正です。");
    }
    total += bytes.length;
    if (bytes.length > MAX_PHOTO_BYTES || total > MAX_TOTAL_PHOTO_BYTES) {
      throw new ApiError(413, "写真は1枚1MB・合計2MBまでです。");
    }
    const name = String(photo.name ?? photo.label ?? "写真").slice(0, 200);
    return { id: randomUUID(), name, label: name, size: Math.ceil(bytes.length / 1024), url: photo.url };
  });
}

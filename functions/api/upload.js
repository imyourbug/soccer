import { json } from "./_middleware.js";

const MAX_BYTES = 2 * 1024 * 1024;   // ảnh đã được thu nhỏ ở trình duyệt, thường < 100 KB
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/upload  (body = file ảnh, cần mật khẩu) → { url: "/api/photo/<id>" }
export async function onRequestPost({ request, env }) {
  const type = (request.headers.get("Content-Type") || "").split(";")[0];
  if (!TYPES.includes(type)) return json({ error: "Chỉ nhận ảnh JPG/PNG/WEBP" }, 415);

  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ error: "File rỗng" }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ error: "Ảnh quá lớn (tối đa 2 MB)" }, 413);

  const id = crypto.randomUUID();
  await env.DB.put(`photo:${id}`, buf, { metadata: { type, at: Date.now() } });
  return json({ url: `/api/photo/${id}` });
}

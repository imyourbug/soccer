import { json } from "./_middleware.js";

const KEY = "players";
const MAX_BYTES = 1024 * 1024;           // 1 MB là quá đủ cho danh sách đội
const PHOTO_GRACE_MS = 30 * 60 * 1000;   // ảnh mới upload < 30 phút thì chưa dọn

// GET /api/players → danh sách. KV chưa có dữ liệu thì lấy players.json làm dữ liệu ban đầu.
export async function onRequestGet({ request, env }) {
  let data = await env.DB.get(KEY, "json");
  if (!data) {
    const r = await env.ASSETS.fetch(new URL("/players.json", request.url));
    data = r.ok ? await r.json() : [];
  }
  return json(data, 200, { "Cache-Control": "no-store" });
}

// PUT /api/players → ghi đè toàn bộ danh sách (cần mật khẩu, kiểm tra ở _middleware)
export async function onRequestPut({ request, env }) {
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: "Dữ liệu quá lớn" }, 413);

  let data;
  try { data = JSON.parse(text); } catch { return json({ error: "JSON không hợp lệ" }, 400); }
  if (!Array.isArray(data) || data.some(p => !p || typeof p !== "object" || !p.name))
    return json({ error: "Dữ liệu phải là mảng thành viên, mỗi người có name" }, 400);

  await env.DB.put(KEY, JSON.stringify(data));
  await cleanupPhotos(env, data);
  return json({ ok: true, count: data.length });
}

// Xóa ảnh trong KV không còn ai dùng (VD: đã đổi ảnh khác hoặc xóa thành viên)
async function cleanupPhotos(env, players) {
  const used = new Set(players
    .map(p => String(p.photo || "").match(/\/api\/photo\/([\w-]+)$/)?.[1])
    .filter(Boolean));
  let cursor;
  do {
    const page = await env.DB.list({ prefix: "photo:", cursor });
    for (const k of page.keys) {
      const id = k.name.slice(6);
      const fresh = Date.now() - (k.metadata?.at || 0) < PHOTO_GRACE_MS;
      if (!used.has(id) && !fresh) await env.DB.delete(k.name);
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
}

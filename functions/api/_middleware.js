// Bảo vệ mọi request ghi (POST/PUT/DELETE) bằng mật khẩu quản trị.
// GET (xem danh sách, xem ảnh) thì ai cũng truy cập được.
export async function onRequest({ request, env, next }) {
  if (request.method === "GET" || request.method === "HEAD") return next();

  if (!env.ADMIN_KEY) return json({ error: "Server chưa cấu hình ADMIN_KEY" }, 500);
  const key = request.headers.get("X-Admin-Key") || "";
  if (!safeEqual(key, env.ADMIN_KEY)) return json({ error: "Sai mật khẩu" }, 401);
  return next();
}

function safeEqual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });

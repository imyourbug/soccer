// GET /api/photo/<id> → trả ảnh lưu trong KV
export async function onRequestGet({ params, env }) {
  const { value, metadata } = await env.DB.getWithMetadata(`photo:${params.id}`, "arrayBuffer");
  if (!value) return new Response("Không tìm thấy ảnh", { status: 404 });
  return new Response(value, {
    headers: {
      "Content-Type": metadata?.type || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable"   // id là duy nhất nên cache lâu được
    }
  });
}

// Middleware đã kiểm tra mật khẩu, tới được đây nghĩa là đúng.
export const onRequestPost = () =>
  new Response('{"ok":true}', { headers: { "Content-Type": "application/json" } });

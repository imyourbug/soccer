# FC UAE – Danh sách thành viên (Cloudflare Pages)

```
public/            → trang web (index.html, logo, players.json = dữ liệu ban đầu)
functions/api/     → API chạy trên Cloudflare
  players.js         GET/PUT danh sách
  upload.js          POST ảnh → lưu vào KV
  photo/[id].js      GET ảnh
  login.js           kiểm tra mật khẩu
  _middleware.js     chặn mọi request ghi nếu sai mật khẩu
wrangler.toml      → cấu hình (tên project, KV)
```

## Deploy lần đầu

```bash
cd ~/Desktop/soccer
npx wrangler login                              # đăng nhập Cloudflare (mở trình duyệt)

npx wrangler kv namespace create fc-uae-db      # tạo KV → copy "id" dán vào wrangler.toml
npx wrangler pages project create fc-uae        # production branch: main

npx wrangler pages secret put ADMIN_KEY --project-name fc-uae   # đặt mật khẩu quản trị
npx wrangler pages deploy                       # deploy → nhận link https://fc-uae.pages.dev
```

## Cập nhật sau này

```bash
npx wrangler pages deploy
```

Dữ liệu (danh sách + ảnh) nằm trong KV nên deploy lại **không** mất dữ liệu.
`public/players.json` chỉ dùng làm dữ liệu ban đầu khi KV còn trống.

## Chạy thử trên máy

```bash
cp .dev.vars.example .dev.vars      # sửa mật khẩu trong file này
npx wrangler pages dev              # mở http://localhost:8788
```

## Cách dùng

- Người xem: chỉ xem, tìm kiếm, lọc, Lưu ảnh, In.
- Quản trị: bấm **Đăng nhập** → nhập ADMIN_KEY → click ô để sửa, ＋ để thêm, ✕ để xóa,
  kéo thả để đổi thứ tự, click ảnh tròn trong form để upload ảnh. Mọi thay đổi tự lưu lên server.
- Đổi mật khẩu: chạy lại `npx wrangler pages secret put ADMIN_KEY --project-name fc-uae` rồi deploy.

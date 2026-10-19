# SkyShop

Website bán hàng công nghệ: **sever** (Node/Express + MongoDB), **client-customer** (trang khách), **client-admin** (trang quản trị).

## Chạy nhanh (khi phát triển)

Mở 2 cửa sổ terminal:

```bash
# 1) Server API – cổng 3000
cd sever
npm install
npm start

# 2) Trang khách hàng – cổng 3001 (tự proxy /api sang cổng 3000)
cd client-customer
npm install
npm start
```

Trang quản trị: `cd client-admin && npm start` (cổng 3002). Cổng của 2 trang React được đặt trong script `start` của package.json.

Tài khoản mẫu: khách `demo / demo123`, admin `admin / admin123`.

## Cơ sở dữ liệu

Cấu hình trong `sever/.env`:

```
DB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
DB_DATABASE=skyshop
```

Nếu server **không kết nối được MongoDB** (sai mật khẩu, chưa mở IP trên Atlas, mất mạng…),
server sẽ tự chạy **chế độ dữ liệu mẫu trong bộ nhớ** để website vẫn hiển thị sản phẩm,
và in hướng dẫn sửa lỗi ra terminal. Trên MongoDB Atlas: *Network Access → Add IP Address →
Allow access from anywhere (0.0.0.0/0)*.

## Build để chạy chung một cổng

```bash
cd sever
npm run build   # build cả client-admin và client-customer
npm start       # mở http://localhost:3000 (khách) và http://localhost:3000/admin
```

Lưu ý: sau khi sửa code giao diện phải **build lại**, nếu không cổng 3000 vẫn phục vụ bản build cũ.

## Deploy lên Render

Repo đã có sẵn `render.yaml`.

1. Push code lên GitHub.
2. Vào https://dashboard.render.com → **New → Blueprint** → chọn repo này.
3. Nhập biến `DB_URI` (chuỗi kết nối MongoDB Atlas). `JWT_SECRET` được Render tự sinh.
4. Trên MongoDB Atlas: *Network Access → Allow access from anywhere (0.0.0.0/0)*.

Sau khi deploy: trang khách ở `https://<ten-app>.onrender.com`, trang quản trị ở `/admin`.
Gói miễn phí sẽ "ngủ" sau 15 phút không có truy cập, lần mở đầu tiên mất khoảng 30–60 giây.

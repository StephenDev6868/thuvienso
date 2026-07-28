# Thư viện số AI • STEM

Landing page thư viện số theo Red Concept, dùng Vue 3, TypeScript, Vite, Vue Router,
Pinia và Tailwind CSS.

## Yêu cầu

- Node.js >= 20.19
- npm >= 10

## Khởi chạy

```bash
nvm use
npm install
cp .env.example .env
npm run dev
```

Ứng dụng chạy mặc định tại `http://localhost:5173`.

Để mã QR trên màn hình khoá luôn trỏ tới domain public khi chạy demo nội bộ,
có thể cấu hình:

```bash
VITE_PUBLIC_APP_URL=https://domain-thu-vien-cua-ban.vn
```

Nếu không khai báo, mã QR sẽ tự sử dụng URL hiện tại trên trình duyệt.

## Kho sách số PDF

Kho SGK đầy đủ từ lớp 1 đến lớp 5 lần lượt nằm tại `src/data/SGK_1` đến
`src/data/SGK_5`. Metadata tổng hợp được lưu trong `src/data/digital-library.json`,
63 hồ sơ JSON của từng sách nằm trong `src/data/digital-library`, còn ảnh bìa
được trích từ trang đầu PDF vào `src/assets/book-covers`.

Khi bổ sung hoặc cập nhật PDF, khai báo metadata tương ứng trong
`scripts/digitize-library.mjs`, cài Poppler và chạy:

```bash
npm run digitize:library
```

Ứng dụng dùng PDF.js để render tài liệu trên trình duyệt và PageFlip để mô phỏng
hiệu ứng lật trang. Trợ lý thư viện đọc cùng catalog JSON nên có thể mở sách bằng
câu lệnh như “Mở sách Toán lớp 4 - Tập 1”.

## Kiểm tra chất lượng

```bash
npm run type-check
npm run lint:check
npm run test
npm run build
```

## Cấu trúc chính

```text
src/
├── assets/       # CSS và static assets
├── components/   # UI components tái sử dụng
├── data/         # Dữ liệu mẫu, sẵn sàng thay bằng API
├── layouts/      # Khung giao diện
├── router/       # Cấu hình route
├── services/     # HTTP client và API modules
├── stores/       # Pinia stores
├── types/        # TypeScript types
└── views/        # Các trang
```

Các biến môi trường phía client phải bắt đầu bằng `VITE_`. Không đưa secret vào biến môi trường frontend.

Xem [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) để biết mapping yêu cầu, kiến trúc
component và các phần cần backend/hardware.

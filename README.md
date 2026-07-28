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

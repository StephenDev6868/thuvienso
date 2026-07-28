# Kế hoạch triển khai Thư viện số AI • STEM

## 1. Phạm vi frontend đã triển khai

Landing page Vue 3 bám theo frame `Digital Library Homepage — Desktop` của Figma, đồng thời
responsive cho tablet, màn hình cảm ứng 12 inch và điện thoại.

### Component architecture

```text
DefaultLayout
├── AppHeader
├── HomeView
│   ├── HeroSection
│   ├── QuickAccessGrid
│   ├── FeaturedBooks
│   │   └── BookCard
│   ├── AiShowcase
│   ├── TopicLibrary
│   ├── StemVideoGrid
│   ├── ReaderDashboard
│   └── SchoolCommunity
├── AppFooter
├── AiChatWidget
└── RegistrationModal
```

Các danh sách sách, chủ đề và video được tách tại `src/data/library.ts`. Khi có API thật,
component không cần thay đổi cấu trúc hiển thị.

### Luồng tương tác

- Tìm kiếm từ header hoặc hero và lọc danh sách sách theo từ khóa.
- Lọc sách theo đề xuất, mới cập nhật, đọc nhiều, lớp 1–5 và khoa học STEM.
- Sáu lối truy cập nhanh điều hướng đúng khu vực hoặc mở chat/đăng ký.
- Video STEM có modal xem demo và trạng thái phát/tạm dừng.
- Form đăng ký có validation, focus management và trạng thái thành công.
- Chat AI tự xuất hiện khi khởi động, dùng `avatar_bot.gif`, hiển thị và phát lời
  “Xin chào”, có nút tắt âm thanh.
- Chat phản hồi cục bộ theo các kịch bản phụ huynh, truyện lớp 2, hệ Mặt Trời,
  thí nghiệm STEM và giáo viên.

## 2. Mapping với request.md

| Yêu cầu | Trạng thái FE |
| --- | --- |
| AI Library Assistant | Đã có giao diện, animation, voice greeting và kịch bản demo |
| Tìm sách / Nghe sách / Video / Đăng ký | Đã có điểm vào và luồng demo |
| Giáo viên / Học sinh / Phụ huynh | Đã có CTA theo vai trò và khu vực nhà trường |
| QR Landing Page | Landing page đã sẵn sàng làm URL đích; cần URL production để tạo QR vật lý |
| Video giới thiệu 90 giây | Đã có video player demo; cần file video chính thức |
| AR minh họa | Chưa triển khai; cần mô hình 3D, quyền camera và nền tảng AR |
| Trình diễn trực tiếp 3 phút | FE đã có flow tìm sách → AI → đăng ký → đọc; robot cần tích hợp riêng |

## 3. Giai đoạn tích hợp tiếp theo

1. Kết nối API sách, audio, video và tài khoản bạn đọc.
2. Thay rule-based chat demo bằng API AI có knowledge base của thư viện.
3. Cung cấp video giới thiệu đã biên tập và poster ảnh.
4. Chốt domain production, tạo một mã QR duy nhất và kiểm thử trên thiết bị thật.
5. Tích hợp AR bằng WebAR/WebXR hoặc nền tảng AR được lựa chọn.
6. Kết nối robot qua API/WebSocket cho lời chào, màn hình và kịch bản trình diễn.
7. Kiểm thử accessibility, tốc độ mạng yếu và thao tác chạm trên màn hình 12 inch.

## 4. Nguyên tắc UX

- Vùng chạm chính tối thiểu khoảng 44 px.
- Chat tự mở nhưng luôn có nút đóng và tắt âm thanh.
- Màu đỏ chỉ dùng cho CTA và điểm nhấn; nền kem giảm mỏi mắt khi đọc lâu.
- Nội dung quan trọng không phụ thuộc animation.
- Tôn trọng `prefers-reduced-motion`.
- Không giả lập AR/video thật khi chưa có tài nguyên chính thức.

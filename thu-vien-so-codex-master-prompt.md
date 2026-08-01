
# MASTER PROMPT CHO CODEX — THƯ VIỆN SỐ TIỂU HỌC

Bạn là Senior Frontend Engineer kiêm UI Engineer. Hãy thiết kế và lập trình lại website “Thư viện số – Trường Tiểu học Bùi Thị Xuân” theo phong cách dễ thương, sáng sủa, hiện đại, phù hợp học sinh tiểu học.

## 1. Mục tiêu

Tạo một giao diện web responsive hoàn chỉnh cho Desktop, iPad và Mobile, ưu tiên:

- Giao diện nhiều màu sắc nhưng không rối mắt.
- Phong cách 3D mềm mại, hoạt hình, thân thiện với trẻ em.
- Tủ sách 3D là khu vực nổi bật nhất.
- Trên Mobile vẫn phải hiển thị tủ sách ngay trên trang chủ.
- Bộ lọc trên Mobile phải rất gọn, dùng chip hoặc icon.
- Có slider/banner ở đầu trang.
- Có thể triển khai thật, không chỉ là mockup.
- Code sạch, dễ bảo trì, dễ mở rộng.

## 2. Stack kỹ thuật

Dùng:

- Next.js 15+ với App Router
- TypeScript
- Tailwind CSS
- shadcn/ui nếu cần
- lucide-react cho icon
- Framer Motion cho animation nhẹ
- Swiper hoặc Embla Carousel cho slider
- next/image cho hình ảnh
- Không dùng inline style trừ trường hợp thật sự cần thiết

Nếu project hiện tại không dùng Next.js, hãy giữ nguyên framework hiện có nhưng vẫn áp dụng cấu trúc component, responsive và design token bên dưới.

## 3. Phong cách thiết kế

### Visual direction

- Pastel, tươi sáng, thân thiện.
- Nền chính: kem nhạt, xanh trời, xanh lá nhẹ.
- Card bo tròn lớn.
- Shadow mềm.
- Các bảng tiêu đề dùng phong cách bảng gỗ, mái ngói hoặc bảng lớp học.
- Có thể dùng hoa, lá, mây, cầu vồng, ngôi sao, sách, balo, trường học, khinh khí cầu.
- Không lạm dụng hiệu ứng 3D hoặc animation.
- Tập trung vào độ rõ ràng và khả năng sử dụng.

### Design tokens

```ts
export const designTokens = {
  colors: {
    primary: "#FF5F6D",
    primaryDark: "#E84655",
    secondary: "#4A90E2",
    accent: "#FFB547",
    success: "#65C46B",
    purple: "#8B6CE6",
    sky: "#DFF5FF",
    cream: "#FFF8ED",
    surface: "#FFFFFF",
    text: "#24324A",
    muted: "#6E7A90",
    border: "#F1E2D0",
  },
  radius: {
    sm: "12px",
    md: "18px",
    lg: "24px",
    xl: "32px",
    pill: "999px",
  },
  shadow: {
    card: "0 10px 30px rgba(80, 63, 45, 0.10)",
    soft: "0 6px 18px rgba(40, 70, 100, 0.10)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
};
```

## 4. Font và typography

Ưu tiên font hỗ trợ tiếng Việt tốt:

- Heading: Be Vietnam Pro, Nunito hoặc Baloo 2
- Body: Be Vietnam Pro hoặc Inter

Quy ước:

- H1 Desktop: 48–64 px
- H1 Tablet: 38–48 px
- H1 Mobile: 28–36 px
- Section title: 24–32 px
- Body: 14–16 px
- Caption: 12–14 px

Heading có thể hơi tròn và vui nhộn nhưng nội dung phải dễ đọc.

## 5. Cấu trúc trang chủ

### Header Desktop

Gồm:

- Logo trường và tên “THƯ VIỆN SỐ”
- Menu:
  - Trang chủ
  - Kho sách
  - Tủ sách 3D
  - Sách nói
  - Học liệu
  - STEM
  - Hoạt động
- Search input
- Nút “Màn hình khóa”
- Nút “Liên hệ”
- Avatar học sinh

Header sticky, bo tròn nhẹ, shadow mềm.

### Header Tablet

- Logo
- Search rút gọn
- Icon thông báo
- Avatar
- Menu có thể chuyển sang sidebar hoặc thanh điều hướng gọn

### Header Mobile

- Logo bên trái
- Icon thông báo và avatar bên phải
- Không hiển thị full menu
- Dùng bottom navigation cố định

## 6. Hero slider

Đặt ngay dưới header.

Mỗi slide gồm:

- Tiêu đề lớn, ví dụ:
  - “Khám phá tri thức – Ươm mầm tương lai”
  - “Mỗi ngày một cuốn sách hay”
  - “Học vui hơn cùng thư viện số”
- Mô tả ngắn
- CTA “Khám phá ngay”
- Minh họa học sinh đọc sách, trường học, cầu vồng
- Nút chuyển trái/phải
- Dots pagination
- Autoplay 5–7 giây
- Pause khi hover trên Desktop
- Swipe trên Mobile

Hero phải tối ưu chiều cao:

- Desktop: 380–450 px
- Tablet: 300–360 px
- Mobile: 220–280 px

## 7. Quick filter / shortcut

Ngay dưới hero có 4 mục:

- Sách mới
- Sách hay
- Sách yêu thích
- Thể loại

Desktop: card ngang.
Tablet: 4 cột.
Mobile: 4 icon card nhỏ hoặc chip.

## 8. Tủ sách 3D

Đây là phần quan trọng nhất.

### Desktop

- Sidebar chọn lớp 1–5.
- Tủ sách lớn ở giữa.
- Mỗi hàng tương ứng một lớp.
- Các cuốn sách đại diện cho môn:
  - Âm nhạc
  - Đạo đức
  - GDTC
  - HĐTN
  - Mỹ thuật
  - Tiếng Anh
  - Tiếng Việt
  - Toán
  - TN & XH
  - Công nghệ
  - Tin học
  - Khoa học
  - Lịch sử & Địa lý
- Sách dùng màu khác nhau.
- Hover nâng nhẹ, scale 1.03.
- Click mở trang lớp hoặc danh sách môn.

### Tablet

- Tủ sách vẫn lớn và ở trung tâm.
- Bộ lọc lớp nằm bên trái hoặc dạng chip phía trên.
- Không để nội dung quá chật.

### Mobile

BẮT BUỘC:

- Tủ sách phải xuất hiện ngay trên trang chủ.
- Không ẩn sau nút “xem thêm”.
- Chỉ hiển thị 2–3 hàng hoặc carousel ngang.
- Bộ lọc lớp dạng chip:
  - Tất cả
  - Lớp 1
  - Lớp 2
  - Lớp 3
  - dropdown hoặc filter icon cho lớp 4–5
- Không dùng sidebar.
- Có nút “Xem tất cả”.
- Người dùng có thể vuốt ngang các môn.
- Chiều cao khu vực tủ sách hợp lý, không chiếm toàn bộ màn hình.

## 9. Hoạt động nổi bật

Hiển thị:

- Cuộc thi đọc sách
- Ngày hội STEM
- Giờ kể chuyện

Mỗi card có:

- Icon minh họa
- Tên hoạt động
- Mô tả ngắn
- Ngày diễn ra
- CTA “Xem chi tiết”

Desktop: sidebar hoặc 3 card ngang.
Mobile: carousel ngang hoặc 1 cột.

## 10. Góc học tập

Card nổi bật, màu xanh hoặc tím:

- Tài liệu
- Bài giảng
- Phiếu bài tập
- Video
- Học liệu bổ trợ

CTA: “Truy cập ngay”.

## 11. Các trang cần tạo

Tạo đầy đủ:

1. Trang chủ
2. Kho sách
3. Tủ sách 3D
4. Danh sách theo lớp
5. Danh sách theo môn
6. Chi tiết sách
7. Trình đọc sách
8. Sách nói
9. Học liệu
10. STEM
11. Hoạt động
12. Yêu thích
13. Hồ sơ cá nhân

## 12. Trang chi tiết lớp

Ví dụ “Lớp 1”:

- Header đơn giản
- Banner minh họa
- Bộ lọc môn dạng icon:
  - Âm nhạc
  - Đạo đức
  - GDTC
  - Toán
  - Tiếng Việt
  - Tiếng Anh
- Grid sách
- Card sách:
  - Ảnh bìa
  - Tên sách
  - Môn
  - Lớp
  - Nút yêu thích
  - CTA “Đọc ngay”
- Mobile: 2 cột
- Tablet: 3–4 cột
- Desktop: 5–6 cột

## 13. Bottom navigation Mobile

Fixed bottom nav gồm:

- Trang chủ
- Kho sách
- Tủ sách 3D
- Yêu thích
- Cá nhân

Tab giữa “Tủ sách 3D” nổi bật hơn bằng floating circular button.

## 14. Component architecture

Tạo component tái sử dụng:

```txt
components/
  layout/
    Header.tsx
    MobileBottomNav.tsx
    Sidebar.tsx
    Footer.tsx

  home/
    HeroSlider.tsx
    QuickActions.tsx
    StatsPanel.tsx
    GradeFilter.tsx
    Bookshelf3D.tsx
    FeaturedActivities.tsx
    LearningCorner.tsx

  books/
    BookCard.tsx
    BookGrid.tsx
    SubjectFilter.tsx
    GradeTabs.tsx
    BookDetail.tsx
    ReaderToolbar.tsx

  ui/
    SectionHeader.tsx
    WoodenSign.tsx
    EmptyState.tsx
    LoadingCard.tsx
```

## 15. Data model mẫu

```ts
export type Grade = 1 | 2 | 3 | 4 | 5;

export interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  grade: Grade;
  subjectId: string;
  cover: string;
  description: string;
  author?: string;
  isFavorite?: boolean;
  type: "ebook" | "audio" | "video" | "resource";
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  href: string;
}
```

## 16. Dữ liệu demo

Tạo mock data đủ để giao diện sống động:

- Mỗi lớp ít nhất 8 môn
- Mỗi môn ít nhất 4 sách
- Ít nhất 8 hoạt động
- Ít nhất 3 hero slides
- Ít nhất 5 học liệu
- Ảnh có fallback nếu lỗi

Không dùng lorem ipsum. Nội dung phải bằng tiếng Việt và phù hợp học sinh tiểu học.

## 17. Responsive breakpoints

```txt
Mobile: 320–767
Tablet: 768–1199
Desktop: 1200+
```

Yêu cầu:

- Không horizontal overflow.
- Tất cả button tối thiểu 44 px chiều cao trên Mobile.
- Text không quá nhỏ.
- Tủ sách vẫn dễ nhìn trên Mobile.
- Ảnh dùng aspect-ratio ổn định.
- Layout phải hoạt động tốt ở 390×844, 768×1024, 1024×768, 1440×900.

## 18. Animation

Dùng nhẹ nhàng:

- Book hover lift
- Card fade-in
- Hero slide transition
- Button press scale
- Star/cloud floating rất nhẹ

Tôn trọng `prefers-reduced-motion`.

## 19. Accessibility

- Semantic HTML
- aria-label cho icon button
- Alt text đầy đủ
- Focus ring rõ ràng
- Contrast đạt WCAG AA
- Keyboard navigation
- Không chỉ dùng màu để truyền tải trạng thái

## 20. Hiệu năng

- next/image
- Lazy load khu vực dưới fold
- Dynamic import slider nếu cần
- Không load ảnh quá lớn
- Không animation nặng
- Lighthouse mục tiêu:
  - Performance >= 90
  - Accessibility >= 95
  - Best Practices >= 95
  - SEO >= 90

## 21. Cấu trúc code

- Không viết toàn bộ trang trong một file.
- Tách component rõ ràng.
- Không hardcode lặp lại.
- Dùng map từ data.
- TypeScript strict.
- Không để warning ESLint.
- Có loading, empty, error state.
- Có skeleton cho danh sách sách.

## 22. Kết quả cần Codex trả về

Hãy:

1. Phân tích project hiện tại.
2. Giữ nguyên API/backend hiện có.
3. Chỉ thay đổi UI và component cần thiết.
4. Tạo design tokens.
5. Dựng responsive Desktop, Tablet, Mobile.
6. Tạo hero slider.
7. Hiển thị tủ sách 3D trên Mobile.
8. Thu gọn bộ lọc Mobile.
9. Tạo đầy đủ component.
10. Chạy lint và build.
11. Sửa mọi lỗi trước khi hoàn thành.
12. Liệt kê file đã thay đổi.
13. Giải thích ngắn cách chỉnh nội dung, màu sắc, ảnh và dữ liệu.

## 23. Acceptance criteria

Chỉ coi là hoàn thành khi:

- Desktop giống phong cách mockup.
- Mobile vẫn thấy tủ sách trên trang chủ.
- Mobile không có sidebar bộ lọc.
- Bộ lọc Mobile tối đa 1 hàng + dropdown/filter button.
- iPad portrait và landscape không vỡ layout.
- Hero slider hoạt động.
- Header và bottom nav đúng thiết bị.
- Tất cả card có trạng thái hover/focus.
- Không lỗi TypeScript.
- `npm run lint` pass.
- `npm run build` pass.

## 24. Lệnh thực thi mong muốn

Sau khi hiểu yêu cầu:

- Trước tiên hãy kiểm tra cấu trúc source.
- Sau đó đưa ra kế hoạch ngắn.
- Tiếp theo chỉnh code trực tiếp.
- Không dừng lại ở việc mô tả.
- Không tạo mockup bằng ảnh thay cho code.
- Không thay backend hoặc xóa logic đang hoạt động.
- Nếu thiếu asset, dùng placeholder có thể thay dễ dàng.
- Cuối cùng chạy kiểm tra và báo cáo kết quả.

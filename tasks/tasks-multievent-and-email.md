# Tasks: Hệ Thống Đa Sự Kiện & Gửi Email Vé Thật (InterGreat Education Group)

## Relevant Files

- `public/intergreat-logo.png` - Logo chính thức của InterGreat Education Group dùng cho web và email.
- `prisma/schema.prisma` - Cấu trúc dữ liệu: Bảng `Event`, `Ticket`, và bảng `SystemSetting` lưu cấu hình email linh hoạt.
- `lib/email.ts` - Bộ điều phối gửi email đa kênh (Dynamic Email Engine: Resend, SMTP Gmail/Outlook, Mock).
- `lib/email-template.ts` - Mẫu email HTML vé sự kiện InterGreat với mã QR đính kèm và nhận diện thương hiệu.
- `components/Navbar.tsx` - Thanh điều hướng chung với Logo InterGreat, menu Sự kiện, Check-in, Admin.
- `app/layout.tsx` - Layout gốc cấu hình metadata và nhận diện thương hiệu InterGreat.
- `app/page.tsx` - Trang chủ giao diện InterGreat Education Group dẫn lối sự kiện.
- `app/events/page.tsx` - Trang danh sách các sự kiện đang mở của InterGreat.
- `app/events/[slug]/page.tsx` - Trang chi tiết sự kiện & form đăng ký chuẩn Brand.
- `app/tickets/[ticketCode]/page.tsx` - Trang hiển thị vé điện tử phong cách InterGreat.
- `app/admin/page.tsx` - Live Dashboard với Dropdown chọn sự kiện và thống kê riêng biệt.
- `app/admin/events/page.tsx` - Trang quản trị sự kiện: Tạo mới, Chỉnh sửa, Đóng/Mở đăng ký, Xóa.
- `app/admin/settings/email/page.tsx` - Trang cấu hình Email: Chuyển đổi provider, nhập SMTP/Resend, test email.
- `app/checkin/page.tsx` - Trang quét vé QR hỗ trợ chọn sự kiện và bảo vệ bằng PIN.
- `app/api/admin/events/route.ts` - API CRUD sự kiện.
- `app/api/admin/stats/route.ts` - API cung cấp số liệu thống kê theo sự kiện.
- `app/api/admin/settings/email/route.ts` - API đọc/lưu cấu hình email và gửi email kiểm tra kết nối.
- `app/api/admin/tickets/resend/route.ts` - API gửi lại vé mời qua email cho khách.
- `app/api/register/route.ts` - API đăng ký vé tích hợp gửi email tự động.

### Notes

- Cấu hình SMTP Gmail yêu cầu sử dụng **Mật khẩu ứng dụng (Google App Password)**.
- Gửi email chạy bất đồng bộ trong background để không làm chậm thời gian phản hồi khi đăng ký vé.

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

- [x] 0.0 Create feature branch for Phase 2
  - [x] 0.1 Tạo và checkout nhánh mới `feature/intergreat-phase2` từ nhánh hiện tại.

- [x] 1.0 InterGreat Education Group Brand Identity & Theme Integration
  - [x] 1.1 Cập nhật bảng màu nhận diện thương hiệu InterGreat trong CSS (Teal `#2cb696`, Slate Charcoal `#334155`).
  - [x] 1.2 Xây dựng component `Navbar.tsx` chuẩn nhận diện với Logo InterGreat Education Group và điều hướng nhanh.
  - [x] 1.3 Thiết kế lại Trang chủ `app/page.tsx` theo phong cách giáo dục quốc tế của InterGreat.
  - [x] 1.4 Đồng bộ giao diện Thẻ vé điện tử `app/tickets/[ticketCode]/page.tsx` với màu sắc và logo InterGreat.

- [x] 2.0 Multi-Event Management System & Public Event Portal
  - [x] 2.1 Cập nhật `prisma/schema.prisma` bổ sung model `SystemSetting` và chạy migration/push database.
  - [x] 2.2 Xây dựng API Quản lý Sự kiện `app/api/admin/events/route.ts` (GET danh sách kèm thống kê vé, POST tạo mới, PUT cập nhật, DELETE xóa).
  - [x] 2.3 Xây dựng Trang Quản trị Sự kiện `app/admin/events/page.tsx` (Bảng quản lý, Modal tạo sự kiện, chuyển đổi trạng thái Đóng/Mở).
  - [x] 2.4 Xây dựng Trang Cổng Sự kiện Công khai `app/events/page.tsx` cho phép khách mời xem và chọn sự kiện đăng ký.

- [x] 3.0 Event-Scoped Live Dashboard & Statistics
  - [x] 3.1 Cập nhật API `app/api/admin/stats/route.ts` để lọc thống kê chính xác theo từng sự kiện (`slug` hoặc `eventId`).
  - [x] 3.2 Tích hợp **Dropdown Chọn Sự Kiện** trên thanh công cụ Dashboard `app/admin/page.tsx` giúp chuyển đổi dữ liệu tức thời.
  - [x] 3.3 Đồng bộ `StatsCards.tsx`, `AttendeeTable.tsx`, và phân tích phòng ban theo từng sự kiện được chọn.
  - [x] 3.4 Bổ sung lựa chọn sự kiện trên máy quét `app/checkin/page.tsx` để nhân viên đón tiếp xác thực đúng vé của từng sự kiện.

- [x] 4.0 Dynamic Email Engine with In-App Provider Switching
  - [x] 4.1 Cài đặt các thư viện gửi email: `nodemailer`, `@types/nodemailer`, `resend`.
  - [x] 4.2 Xây dựng module `lib/email.ts` điều phối gửi mail linh hoạt (hỗ trợ chuyển đổi giữa Resend API, SMTP Gmail/Outlook, và Mock Preview).
  - [x] 4.3 Xây dựng API cấu hình Email `app/api/admin/settings/email/route.ts` (Đọc cấu hình, Ghi đè cấu hình, Gửi email thử nghiệm).
  - [x] 4.4 Xây dựng Giao diện Cài đặt Email `app/admin/settings/email/page.tsx` cho phép BTC đổi cách gửi email và kiểm tra kết nối ngay trên Web.

- [x] 5.0 Automated Ticket Email Dispatch & Resend Capability
  - [x] 5.1 Xây dựng mẫu HTML Email Vé Sự Kiện `lib/email-template.ts` chuẩn nhận diện InterGreat với mã QR đính kèm và nút xem vé.
  - [x] 5.2 Tích hợp kích hoạt gửi email vé tự động ngay khi khách đăng ký thành công trong `app/api/register/route.ts`.
  - [x] 5.3 Xây dựng API gửi lại vé `app/api/admin/tickets/resend/route.ts`.
  - [x] 5.4 Thêm nút "Gửi lại vé qua email" trong bảng danh sách khách mời `AttendeeTable.tsx` kèm thông báo trạng thái gửi.

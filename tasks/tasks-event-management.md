# Tasks: Nền tảng Đăng ký & Check-in Sự kiện (Event Management Platform)

## Relevant Files

- `package.json` - Cấu hình dự án Next.js, TypeScript, Tailwind CSS, và các thư viện phụ thuộc (Prisma, html5-qrcode, qrcode, v.v.).
- `prisma/schema.prisma` - Định nghĩa cấu trúc cơ sở dữ liệu cho các bảng `Event` và `Ticket`.
- `prisma/seed.ts` - Script khởi tạo dữ liệu mẫu cho sự kiện ban đầu để chạy thử GĐ1.
- `lib/prisma.ts` - Khởi tạo Prisma Client singleton cho toàn bộ ứng dụng.
- `lib/qrcode.ts` - Hàm tiện ích sinh mã QR và xử lý dữ liệu vé.
- `lib/types.ts` - Định nghĩa TypeScript interfaces/types cho sự kiện, vé, kết quả check-in và thống kê.
- `app/page.tsx` - Trang đích chuyển hướng hoặc hiển thị sự kiện mẫu (GĐ1).
- `app/events/[slug]/page.tsx` - Trang thông tin sự kiện & Form đăng ký cho khách mời.
- `app/events/[slug]/RegisterForm.tsx` - Client component form đăng ký với validation.
- `app/tickets/[ticketCode]/page.tsx` - Trang hiển thị vé điện tử kèm mã QR và nút tải vé.
- `app/tickets/[ticketCode]/DownloadTicketButton.tsx` - Xử lý tải ảnh vé QR về máy.
- `app/checkin/page.tsx` - Trang bảo vệ bằng mã PIN & Giao diện quét check-in dành cho nhân viên đón khách.
- `app/checkin/QrScanner.tsx` - Component quét mã QR bằng camera trực tiếp trên trình duyệt.
- `app/checkin/ManualCodeInput.tsx` - Component nhập tay mã vé dự phòng.
- `app/checkin/ScanFeedbackModal.tsx` - Hiển thị phản hồi kết quả quét (thành công / đã check-in / không hợp lệ).
- `app/admin/page.tsx` - Dashboard quản trị và thống kê trực tiếp cho Ban tổ chức.
- `app/admin/StatsCards.tsx` - Component hiển thị các thẻ số liệu: Tổng đăng ký, Đã check-in, Chưa đến, Tỷ lệ %.
- `app/admin/AttendeeTable.tsx` - Bảng danh sách người tham gia, tìm kiếm, lọc phòng ban và trạng thái.
- `app/admin/events/page.tsx` - Trang quản lý danh sách và tạo sự kiện mới (GĐ2).
- `app/api/register/route.ts` - API xử lý đăng ký vé, kiểm tra trùng lặp và cấp phát mã vé.
- `app/api/checkin/route.ts` - API xử lý xác thực mã vé, cập nhật trạng thái check-in và thời gian.
- `app/api/admin/stats/route.ts` - API cung cấp dữ liệu thống kê trực tiếp cho dashboard.
- `app/api/admin/export/route.ts` - API xuất danh sách người tham dự ra định dạng Excel/CSV (GĐ2).
- `lib/email.ts` - Module cấu hình dịch vụ gửi email vé kèm QR code (GĐ2).

### Notes

- Các bài kiểm thử đơn vị hoặc integration test (nếu có) nên được đặt song song với file logic cần kiểm tra (ví dụ: `lib/qrcode.test.ts`, `app/api/checkin/route.test.ts`).
- Quét camera WebRTC yêu cầu môi trường bảo mật (`https://` khi chạy thực tế hoặc `localhost` khi chạy dev).

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (`feature/event-checkin-platform`)
- [x] 1.0 Project Setup & Database Architecture (Next.js, Tailwind CSS, Prisma ORM & Database Schema)
  - [x] 1.1 Khởi tạo dự án Next.js (App Router) với TypeScript, Tailwind CSS, và các icon cần thiết (`lucide-react`).
  - [x] 1.2 Cấu hình Prisma ORM với cơ sở dữ liệu SQLite (hỗ trợ chuyển đổi sang PostgreSQL khi lên mạng).
  - [x] 1.3 Thiết kế `prisma/schema.prisma` với 2 bảng chính: `Event` (thông tin sự kiện, thời gian, địa điểm, sức chứa) và `Ticket` (thông tin khách mời, mã vé duy nhất, trạng thái check-in, thời gian check-in).
  - [x] 1.4 Viết script `prisma/seed.ts` để nạp sẵn 1 sự kiện công ty mẫu hoàn chỉnh phục vụ chạy thử GĐ1.
  - [x] 1.5 Cấu hình file `.env.example` và biến môi trường (`ADMIN_PIN`, `STAFF_PIN`, `DATABASE_URL`).

- [x] 2.0 Guest Registration & QR Ticket Generation Module (GĐ1)
  - [x] 2.1 Xây dựng trang thông tin sự kiện và Form đăng ký (`app/events/[slug]/page.tsx`).
  - [x] 2.2 Xây dựng Form đăng ký phía client với các trường bắt buộc: Họ tên, Email, Số điện thoại, Mã nhân viên, Phòng ban kèm validation.
  - [x] 2.3 Xây dựng API Route đăng ký (`POST /api/register`): kiểm tra trùng lặp email hoặc mã nhân viên trong sự kiện, tạo vé mới với mã định danh duy nhất (UUID/NanoID).
  - [x] 2.4 Xây dựng module sinh mã QR (`lib/qrcode.ts`) để mã hóa thông tin mã vé.
  - [x] 2.5 Xây dựng trang hiển thị vé điện tử (`app/tickets/[ticketCode]/page.tsx`): hiển thị thông tin sự kiện, thông tin khách mời và mã QR độ tương phản cao.
  - [x] 2.6 Tích hợp tính năng "Tải ảnh vé QR" về điện thoại để khách xuất trình offline tại sự kiện.

- [x] 3.0 Web-based Check-in Scanner Module (GĐ1)
  - [x] 3.1 Xây dựng màn hình xác thực mã PIN truy cập cho nhân viên đón khách (`app/checkin/page.tsx`).
  - [x] 3.2 Tích hợp thư viện quét mã QR qua camera trình duyệt (`html5-qrcode`) hỗ trợ chuyển đổi camera trước/sau trên điện thoại di động.
  - [x] 3.3 Xây dựng form nhập tay mã vé dự phòng (Manual Ticket Code Input) đặt song song với camera.
  - [x] 3.4 Xây dựng API Route xác thực check-in (`POST /api/checkin`): kiểm tra tính hợp lệ, trạng thái vé, chống điểm danh trùng lặp và ghi nhận thời gian `checkedInAt`.
  - [x] 3.5 Xây dựng thông báo phản hồi trực quan trên màn hình quét:
    - Thành công (Màu xanh lá): hiển thị tên khách mời, phòng ban và âm thanh chuông báo nhận diện.
    - Đã check-in trước đó (Màu vàng/đỏ): cảnh báo rõ ràng thời gian đã check-in trước đó.
    - Không hợp lệ (Màu đỏ): cảnh báo mã vé không tồn tại.
  - [x] 3.6 Hiển thị danh sách 5 lượt check-in gần nhất trên màn hình máy quét để nhân viên tiếp đón dễ dàng đối soát.

- [x] 4.0 Real-time Statistics Dashboard & Attendee Management (GĐ1)
  - [x] 4.1 Xây dựng màn hình xác thực mã PIN cho Ban tổ chức truy cập trang quản trị (`app/admin/page.tsx`).
  - [x] 4.2 Xây dựng các thẻ thống kê tổng quan (Stats Cards): Tổng số đăng ký, Đã check-in, Chưa đến, Tỷ lệ tham dự (%).
  - [x] 4.3 Xây dựng bảng danh sách người tham gia (Attendee Table) hiển thị họ tên, email, phòng ban, trạng thái (Chưa đến / Đã check-in) và thời gian check-in.
  - [x] 4.4 Tích hợp thanh tìm kiếm nhanh (theo tên, mã vé, phòng ban) và bộ lọc theo trạng thái check-in.
  - [x] 4.5 Cài đặt cơ chế cập nhật dữ liệu tự động (auto-refresh/polling định kỳ) để dashboard hiển thị số liệu trực tiếp khi có người vừa check-in.

- [ ] 5.0 Multi-Event Management & Admin Portal (GĐ2)
  - [ ] 5.1 Xây dựng giao diện trang danh sách sự kiện và modal/form tạo sự kiện mới cho BTC (`app/admin/events/page.tsx`).
  - [ ] 5.2 Xây dựng API CRUD sự kiện (`/api/admin/events`): cho phép tạo, sửa thông tin, đặt số lượng tối đa (Capacity) và đóng/mở đăng ký.
  - [ ] 5.3 Cập nhật luồng đăng ký để kiểm tra điều kiện giới hạn số lượng tham gia (tự động báo hết chỗ khi đạt giới hạn).
  - [ ] 5.4 Điều hướng động các sự kiện theo đường dẫn riêng (`/events/[slug]`).

- [ ] 6.0 Automated Email Service & Data Export (GĐ2)
  - [ ] 6.1 Tích hợp dịch vụ gửi email tự động (Resend SDK / Nodemailer) với mẫu email HTML vé sự kiện kèm mã QR đính kèm.
  - [ ] 6.2 Kích hoạt gửi email xác nhận vé tự động ngay sau khi khách mời đăng ký thành công.
  - [ ] 6.3 Thêm nút "Gửi lại vé qua email" (Resend Ticket) trong bảng quản trị người tham dự phòng trường hợp thất lạc vé.
  - [ ] 6.4 Xây dựng chức năng xuất báo cáo danh sách tham dự và lịch sử check-in ra file Excel (`.xlsx`) hoặc CSV (`app/api/admin/export/route.ts`).
  - [ ] 6.5 Bổ sung biểu đồ thống kê cơ cấu tham dự theo phòng ban và biểu đồ lưu lượng check-in theo mốc thời gian.

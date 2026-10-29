# PRD: Hệ Thống Đa Sự Kiện & Gửi Email Vé Thật — InterGreat Education Group

## 1. Introduction / Overview

Sau khi hoàn thành thử nghiệm thành công Giai đoạn 1 (POC 1 sự kiện), dự án được nâng cấp lên **Giai đoạn 2** nhằm phục vụ toàn diện nhu cầu tổ chức sự kiện chuyên nghiệp cho tập đoàn **InterGreat Education Group**.

Bản nâng cấp này giải quyết 4 bài toán trọng tâm:
1. **Hỗ trợ Đa sự kiện cùng lúc:** Quản lý không giới hạn các buổi hội thảo giáo dục, kỳ thi thử IELTS, hội thảo du học, teambuilding nội bộ hoặc Gala của tập đoàn.
2. **Cổng Quản trị Đa năng (Admin Event Hub):** Cho phép Ban tổ chức (BTC) tạo mới, chỉnh sửa thông tin, thiết lập sức chứa, và đóng/mở cổng đăng ký sự kiện chỉ với 1 click.
3. **Thống kê chuyên biệt theo từng sự kiện:** Bộ lọc và bảng điều khiển trực tiếp (Live Dashboard) chuyển đổi linh hoạt theo từng sự kiện cụ thể.
4. **Dịch vụ Gửi Email Vé Thật Đa Kênh (Dynamic Email Engine):** Tự động gửi email vé kèm mã QR trực tiếp đến hòm thư người tham dự; đặc biệt cho phép **chuyển đổi phương thức gửi email giữa chừng** (giữa Resend API, SMTP Gmail/Outlook, hoặc Mock Preview) ngay trên giao diện Web mà không cần khởi động lại máy chủ.
5. **Đồng bộ Nhận diện Thương hiệu InterGreat Education Group:** Ứng dụng toàn diện màu sắc thương hiệu (Teal `#2cb696` / Slate Charcoal `#334155`), logo chính thức của tập đoàn và phong cách thiết kế giáo dục quốc tế thanh lịch.

---

## 2. Goals

- **Mở rộng năng lực vận hành:** Cho phép đồng thời tổ chức và quản lý hàng chục sự kiện với các đường dẫn đăng ký độc lập (`/events/[slug]`).
- **Tự động hóa thông báo vé:** 100% người đăng ký nhận được email vé vào hòm thư cá nhân trong vòng 5 giây kèm mã QR đính kèm và hướng dẫn chi tiết.
- **Linh hoạt hạ tầng gửi mail:** Cho phép quản trị viên thay đổi nhà cung cấp gửi mail (Resend API ↔ SMTP Gmail ↔ Chế độ Test/Mô phỏng) bất kỳ lúc nào ngay trên trang Cài đặt của Admin.
- **Thống kê độc lập & Chính xác:** Xem riêng rẽ tỷ lệ check-in, số lượng đăng ký, và tiến độ đón tiếp của từng sự kiện trên cùng một Dashboard.
- **Độ tin cậy thương hiệu:** Nâng cao uy tín và trải nghiệm của nhân viên/học viên với giao diện chuẩn brand InterGreat Education Group.

---

## 3. User Stories

### 3.1. Khách mời / Học viên / Nhân viên
- **US-G1:** Là người tham dự, tôi muốn duyệt xem danh sách các sự kiện đang mở của InterGreat để chọn sự kiện phù hợp.
- **US-G2:** Là người tham dự, tôi muốn nhận được một email vé vào cửa chuyên nghiệp mang thương hiệu InterGreat, trong đó có sẵn mã QR và nút bấm mở vé trực tuyến để không phải lo lưu link thủ công.
- **US-G3:** Là người tham dự, nếu lỡ làm mất email hoặc vé, tôi có thể yêu cầu Ban tổ chức gửi lại vé vào email chỉ trong vài giây.

### 3.2. Nhân viên đón khách (Check-in Staff)
- **US-S1:** Là nhân viên đón khách, tôi muốn chọn chính xác sự kiện mà mình đang trực đón tiếp để máy quét chỉ xác thực vé thuộc sự kiện đó (tránh check-in nhầm vé sự kiện khác).
- **US-S2:** Là nhân viên đón khách, tôi muốn máy quét phản hồi tức thì với giao diện trực quan, không bị lỗi màn hình đen và có thể chủ động bật/tắt camera khi cần.

### 3.3. Ban tổ chức (InterGreat Event Admin)
- **US-A1:** Là admin BTC, tôi muốn truy cập trang Quản lý Sự kiện để tạo sự kiện mới (tiêu đề, địa điểm, ngày giờ, số lượng chỗ tối đa, mô tả sự kiện).
- **US-A2:** Là admin BTC, tôi muốn dễ dàng chuyển đổi nhanh giữa các sự kiện trên thanh công cụ Dashboard để xem biểu đồ và danh sách khách của từng sự kiện.
- **US-A3:** Là admin BTC, tôi muốn có trang Cài đặt Email để cấu hình thông số gửi mail (chọn Resend API hoặc SMTP Gmail) và có nút "Gửi thử nghiệm" (Test Connection) để đảm bảo mail hoạt động trơn tru trước giờ G.
- **US-A4:** Là admin BTC, tôi muốn có nút "Gửi lại vé" (Resend Ticket) cạnh tên mỗi khách mời trong bảng danh sách để hỗ trợ khách khi cần.

---

## 4. Functional Requirements

### 4.1. Nhận diện Thương hiệu InterGreat Education Group (Branding System)
- **FR-B.1:** Hệ thống sử dụng Logo chính thức của **InterGreat Education Group** trên Navbar, trang chủ, trang đăng ký, thẻ vé điện tử và trong nội dung Email.
- **FR-B.2:** Hệ thống áp dụng bảng màu nhận diện thương hiệu:
  - Màu chủ đạo (Primary Teal): `#2cb696` (nút bấm, active tabs, highlight, QR framing).
  - Màu phụ trợ (Secondary Slate Charcoal): `#334155` / `#1e293b` (tiêu đề, thanh điều hướng, card nền).
  - Màu nền: Phong cách hiện đại (Clean Slate) kết hợp nền tối sang trọng cho máy quét và dashboard.

### 4.2. Quản lý Đa sự kiện (Multi-Event Management)
- **FR-E.1:** Xây dựng trang Quản lý Sự kiện (`app/admin/events/page.tsx`):
  - Hiển thị danh sách tất cả sự kiện kèm trạng thái (Đang mở đăng ký, Đã đóng, Đã kết thúc).
  - Nút **"Tạo Sự Kiện Mới"** mở form/modal nhập: Tiêu đề, Slug (tự động tạo hoặc tùy chỉnh), Địa điểm, Thời gian bắt đầu, Thời gian kết thúc, Sức chứa tối đa (Capacity), Mô tả.
  - Nút **"Chỉnh sửa"** thông tin sự kiện và **"Đóng / Mở lại đăng ký"**.
  - Nút **"Xóa sự kiện"** (kèm cảnh báo xác nhận nếu đã có vé đăng ký).
- **FR-E.2:** Hỗ trợ trang danh sách sự kiện công khai (`app/events/page.tsx`) cho khách mời lựa chọn sự kiện để đăng ký.
- **FR-E.3:** Mỗi sự kiện có đường dẫn đăng ký độc lập: `/events/[slug]`.

### 4.3. Thống kê & Phân tích theo từng sự kiện (Event-scoped Dashboard)
- **FR-D.1:** Trang Admin Dashboard (`app/admin/page.tsx`) tích hợp **Dropdown Chọn Sự Kiện**:
  - Cho phép chuyển đổi tức thì giữa các sự kiện khác nhau.
  - Tự động lưu sự kiện đang xem vào `sessionStorage` hoặc URL query (`?event=slug`).
- **FR-D.2:** Các thẻ KPI (Tổng đăng ký, Đã check-in, Chưa đến, Tỷ lệ %) và Bảng danh sách người tham dự tự động cập nhật theo sự kiện được chọn.
- **FR-D.3:** API `/api/admin/stats` hỗ trợ tham số `eventId` hoặc `eventSlug` để trả về số liệu chính xác của sự kiện đó.

### 4.4. Dịch vụ Gửi Email Vé Thật Đa Kênh (Dynamic Email Engine)
- **FR-M.1:** Xây dựng module gửi email trung tâm (`lib/email.ts`) hỗ trợ 3 chế độ (Providers):
  1. **Resend API:** Dùng Resend SDK (khuyên dùng khi gửi link công khai, tỉ lệ vào Inbox 99%).
  2. **SMTP Cá nhân / Doanh nghiệp:** Dùng Nodemailer kết nối với SMTP Gmail (App Password), Outlook 365 hoặc máy chủ mail công ty.
  3. **Mock Mode (Preview):** Dành cho lúc thử nghiệm nội bộ, in nội dung email ra console log hoặc trả về preview URL mà không tốn quota gửi thật.
- **FR-M.2:** Trang **Cài đặt Email** (`app/admin/settings/email/page.tsx` hoặc modal cấu hình):
  - Cho phép quản trị viên xem cấu hình hiện tại (lấy từ `.env`).
  - Cho phép **ghi đè cấu hình trực tiếp trên Web**: chọn Provider, nhập API Key / SMTP Host / Port / User / Pass / Sender Name.
  - Nút **"Gửi Email Thử Nghiệm"**: gửi 1 email test đến địa chỉ bất kỳ để kiểm tra kết nối ngay tức thì.
- **FR-M.3:** Mẫu Email Vé (HTML Template):
  - Thiết kế chuẩn responsive, chèn Logo InterGreat Education Group.
  - Thông tin sự kiện: Tên sự kiện, thời gian, địa điểm tổ chức.
  - Hình ảnh mã QR vé đính kèm (CID attachment hoặc base64 image).
  - Nút bấm trực tiếp: **"Xem Vé Trực Tuyến & Tải Vé Về Máy"**.
- **FR-M.4:** Tự động gửi email vé cho khách ngay sau khi đăng ký thành công qua API `POST /api/register`.
- **FR-M.5:** Nút **"Gửi Lại Vé Qua Email"** trong bảng quản lý khách mời (`AttendeeTable.tsx`) kèm thông báo trạng thái gửi (Thành công / Thất bại).

---

## 5. Non-Goals (Out of Scope)

- **Cổng thanh toán / Bán vé thu phí:** Toàn bộ vé tham dự đều là vé miễn phí/nội bộ.
- **Ứng dụng Native Mobile (iOS/Android store):** Toàn bộ trải nghiệm vận hành trên nền tảng Web Responsive.
- **Chiến dịch Email Marketing hàng loạt (Newsletter / Cold Email):** Chỉ phục vụ gửi email transactional (vé mời, xác nhận đăng ký).

---

## 6. Design Considerations (InterGreat Brand System)

- **Logo:** [public/intergreat-logo.png](file:///home/long/Event%20App/public/intergreat-logo.png) (Logo chính thức gồm biểu tượng liên kết lồng nhau và dòng chữ InterGreat Education Group).
- **Bảng màu:**
  - **Teal / Ngọc lam (Chủ đạo):** `#2cb696` (nút bấm, active state, accents, viền scanner).
  - **Dark Teal Hover:** `#23977c`.
  - **Slate / Than chì:** `#1e293b` (Navbar, Dark cards), `#334155` (Text heading).
  - **Light Surface:** `#f8fafc` / `#ffffff` cho các khối đăng ký và email.
- **Typography:** Sans-serif hiện đại, nét chữ tròn trịa, khoảng cách chữ thoáng, phong cách giáo dục quốc tế chuyên nghiệp.

---

## 7. Technical Considerations

- **Thư viện gửi Email:** Cài đặt `nodemailer` (`@types/nodemailer`) và `resend`.
- **Cơ sở dữ liệu:**
  - Bảng `Event` đã có cấu trúc chuẩn; bổ sung quan hệ chặt chẽ giữa các sự kiện và vé.
  - Bổ sung bảng hoặc key-value cấu hình `SystemSetting` trong database để lưu thông tin provider email khi admin tùy biến trên Web.
- **Tối ưu Camera Scanner:** Đảm bảo DOM container không bị ẩn (`display: none`) lúc init để camera hiển thị video feed mượt mà trên cả laptop và điện thoại.

---

## 8. Success Metrics

1. **Khả năng đa nhiệm:** Hỗ trợ tạo và vận hành mượt mà từ 5 sự kiện trở lên cùng thời điểm mà không bị lẫn lộn dữ liệu vé.
2. **Tỷ lệ gửi Email thành công:** Đạt trên 98% lượt đăng ký nhận được email vé vào hòm thư.
3. **Thời gian chuyển đổi cấu hình mail:** Dưới 30 giây để admin đổi từ Resend sang Gmail SMTP và gửi email thử nghiệm thành công.
4. **Mức độ nhận diện thương hiệu:** 100% các màn hình hiển thị đồng bộ logo và màu sắc của InterGreat Education Group.

---

## 9. Open Questions

1. Khi admin chuyển sự kiện trên Dashboard, có cần lưu lại sự kiện vừa chọn để khi đăng nhập lại vẫn hiển thị đúng sự kiện đó không? (Mặc định: Có, lưu vào session).
2. Khi xóa 1 sự kiện đã có người đăng ký vé, hệ thống sẽ xóa luôn tất cả vé liên quan (Cascade Delete) hay cần yêu cầu nhập mật mã xác nhận? (Mặc định: Cảnh báo số lượng vé sẽ bị xóa và yêu cầu xác nhận).

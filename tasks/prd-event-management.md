# PRD: Nền tảng Đăng ký & Check-in Sự kiện Nội bộ (Event Check-in Platform)

## 1. Introduction / Overview

Hiện tại, quy trình tổ chức các sự kiện nội bộ của công ty (town hall, workshop, teambuilding, gala, v.v.) đang thực hiện đăng ký và điểm danh hoàn toàn thủ công thông qua bảng tính Excel. Cách làm này gây ra nhiều bất cập: tốn thời gian đón tiếp, dễ trùng lặp/sai sót thông tin, tình trạng ùn tắc tại bàn tiếp đón, và Ban tổ chức (BTC) không nắm bắt được số liệu tham dự theo thời gian thực.

Dự án **Event Check-in Platform** được xây dựng nhằm tự động hóa toàn bộ quy trình: từ lúc nhân viên tự đăng ký tham gia trên Web, nhận vé điện tử kèm mã QR, nhân viên tiếp đón quét mã check-in tức thì bằng camera trình duyệt, đến bảng điều khiển (Dashboard) hiển thị số liệu trực tiếp cho BTC.

Tài liệu PRD này mô tả chi tiết yêu cầu sản phẩm cho **Giai đoạn 1 (Bản dùng thử POC)** và **Giai đoạn 2 (Hoàn thiện & Mở rộng)**.

---

## 2. Goals

- **Số hóa 100% quy trình đăng ký & điểm danh sự kiện:** Thay thế bảng tính Excel thủ công bằng hệ thống web tự động.
- **Rút ngắn thời gian tiếp đón:** Thời gian xử lý check-in một khách mời đạt dưới 3 giây/người.
- **Dữ liệu thời gian thực (Real-time data):** Cập nhật ngay lập tức tỷ lệ check-in trên Dashboard của BTC khi có lượt quét hợp lệ.
- **Trải nghiệm mượt mà:** Khách mời dễ dàng đăng ký và lưu vé QR trên điện thoại cá nhân mà không cần cài đặt ứng dụng.
- **Độ tin cậy cao:** Mỗi vé có mã QR duy nhất, cơ chế chống check-in trùng lặp (chỉ được điểm danh 1 lần).

---

## 3. User Stories

### 3.1. Khách mời (Nhân viên công ty)
- **US-01:** Là một nhân viên, tôi muốn truy cập trang sự kiện để xem thông tin chi tiết (thời gian, địa điểm, nội dung).
- **US-02:** Là một nhân viên, tôi muốn đăng ký tham gia bằng thông tin cá nhân (Họ tên, Email, SĐT, Mã NV, Phòng ban) để giữ chỗ tham dự.
- **US-03:** Là một nhân viên, tôi muốn nhận được vé điện tử có mã QR ngay trên màn hình (GĐ1) và qua Email cá nhân (GĐ2) để xuất trình khi đến sự kiện.
- **US-04:** Là một nhân viên, tôi muốn có thể tải ảnh vé QR hoặc lưu đường link vé để dễ dàng mở lại khi tới bàn check-in.

### 3.2. Nhân viên đón khách (Check-in Staff)
- **US-05:** Là một nhân viên đón khách, tôi muốn mở trang quét mã trên trình duyệt điện thoại và nhập mã PIN để bắt đầu làm việc mà không cần đăng nhập phức tạp.
- **US-06:** Là một nhân viên đón khách, tôi muốn dùng camera điện thoại quét mã QR của khách để hệ thống tự động xác thực và ghi nhận check-in thành công.
- **US-07:** Là một nhân viên đón khách, tôi muốn có ô nhập tay mã vé để xử lý điểm danh trong trường hợp điện thoại khách bị mờ, vỡ màn hình hoặc camera không nhận diện được.
- **US-08:** Là một nhân viên đón khách, tôi muốn nhận được phản hồi trực quan (màu xanh lá: thành công, màu đỏ: mã không hợp lệ hoặc đã check-in trước đó kèm âm thanh báo) để thao tác nhanh và chính xác.

### 3.3. Ban tổ chức (Event Organizer / Admin)
- **US-09:** Là thành viên BTC, tôi muốn truy cập trang quản trị bằng liên kết nội bộ kèm mã PIN để xem danh sách khách đăng ký và tiến độ check-in.
- **US-10:** Là thành viên BTC, tôi muốn theo dõi biểu đồ/con số thống kê trực tiếp: Tổng số đăng ký, Đã check-in, Chưa đến, Tỷ lệ tham dự theo từng phòng ban.
- **US-11:** Là thành viên BTC (GĐ2), tôi muốn tạo nhiều sự kiện mới, tùy chỉnh thời gian mở/đóng đăng ký và giới hạn số lượng khách.
- **US-12:** Là thành viên BTC (GĐ2), tôi muốn xuất danh sách khách mời (kèm trạng thái điểm danh và thời gian check-in) ra file Excel/CSV để làm báo cáo tổng kết.

---

## 4. Functional Requirements

### 4.1. Giai đoạn 1: Bản dùng thử đầu tiên (POC)

#### Quản lý Sự kiện & Đăng ký
- **FR-1.1:** Hệ thống hỗ trợ 1 sự kiện mẫu được cấu hình sẵn (Tên sự kiện, thời gian, địa điểm, mô tả).
- **FR-1.2:** Form đăng ký yêu cầu các trường thông tin bắt buộc:
  - Họ và tên (`fullName` - chuỗi)
  - Email công ty (`email` - định dạng email hợp lệ)
  - Số điện thoại (`phoneNumber` - chuỗi số 10 ký tự)
  - Mã nhân viên (`employeeId` - chuỗi)
  - Phòng ban (`department` - danh sách chọn hoặc nhập văn bản)
- **FR-1.3:** Hệ thống kiểm tra trùng lặp email hoặc mã nhân viên trong cùng 1 sự kiện (không cho phép 1 người đăng ký 2 lần).
- **FR-1.4:** Sau khi đăng ký thành công, hệ thống tự động cấp phát một mã vé định danh duy nhất (UUID/CUID) và hiển thị trang Vé điện tử:
  - Chứa mã QR (mã hóa đường dẫn hoặc mã định danh vé)
  - Thông tin người đăng ký và thông tin sự kiện
  - Nút "Tải ảnh vé QR" hoặc "Lưu mã vé"

#### Phân hệ Check-in (Mobile Web Scanner)
- **FR-1.5:** Trang check-in bảo vệ bằng một mã PIN truy cập nội bộ (cấu hình qua biến môi trường hoặc file config).
- **FR-1.6:** Hỗ trợ quét mã QR qua Camera điện thoại/máy tính bảng trực tiếp trên trình duyệt Web (sử dụng WebRTC / HTML5 Camera API).
- **FR-1.7:** Hỗ trợ ô nhập liệu mã vé thủ công (Manual Code Input) và nút "Xác nhận check-in" hoạt động song song với camera.
- **FR-1.8:** Xử lý kết quả check-in:
  - **Hợp lệ:** Chuyển trạng thái vé thành `CHECKED_IN`, lưu thời gian check-in (`checkedInAt`), hiển thị thông tin khách mời (Họ tên, Phòng ban) với thông báo màu xanh thành công.
  - **Đã check-in trước đó:** Hiển thị cảnh báo màu vàng/đỏ: "Vé này đã được check-in vào lúc [HH:mm:ss] bởi [Nhân viên đón khách]".
  - **Không hợp lệ:** Hiển thị cảnh báo màu đỏ: "Mã vé không tồn tại trong hệ thống".
- **FR-1.9:** Cho phép quét liên tục mà không cần tải lại trang.

#### Phân hệ Thống kê cơ bản (Live Dashboard)
- **FR-1.10:** Trang Dashboard được bảo vệ bằng mã PIN Admin.
- **FR-1.11:** Hiển thị các chỉ số tổng quan thời gian thực:
  - Tổng số lượng đăng ký
  - Tổng số đã check-in
  - Số lượng chưa check-in
  - Tỷ lệ tham dự (%)
- **FR-1.12:** Bảng danh sách người tham gia hiển thị trạng thái (Chưa đến / Đã check-in kèm thời gian). Dữ liệu tự động cập nhật (qua polling ngắn hạn hoặc Server-Sent Events / WebSocket).

---

### 4.2. Giai đoạn 2: Hoàn thiện & Mở rộng

#### Quản lý Đa sự kiện & Cổng Quản trị (Admin Portal)
- **FR-2.1:** Trang Quản trị cho phép tạo, sửa, đóng/mở đăng ký và xóa nhiều sự kiện khác nhau.
- **FR-2.2:** Mỗi sự kiện có trang đăng ký công khai riêng biệt (theo `slug` hoặc `event_id`).
- **FR-2.3:** Hỗ trợ thiết lập số lượng đăng ký tối đa (Capacity limit) và tự động khóa đăng ký khi đạt giới hạn.

#### Dịch vụ Gửi Email Tự động (Email Service)
- **FR-2.4:** Tích hợp dịch vụ gửi email tự động (Resend / SendGrid / SMTP):
  - Gửi email xác nhận đăng ký thành công ngay sau khi điền form.
  - Nội dung email bao gồm: Lời chào cá nhân hóa, thông tin sự kiện, hình ảnh mã QR vé đính kèm, đường link truy cập vé trực tuyến.
- **FR-2.5:** Chức năng gửi lại vé qua email (Resend ticket) từ giao diện quản trị nếu khách bị thất lạc email.

#### Báo cáo & Xuất Dữ liệu
- **FR-2.6:** Xuất danh sách người tham dự kèm thời gian check-in ra file định dạng Excel (`.xlsx`) hoặc CSV.
- **FR-2.7:** Biểu đồ phân tích tỷ lệ tham dự theo phòng ban và biểu đồ lưu lượng khách check-in theo mốc thời gian (timeline influx).

---

## 5. Non-Goals (Out of Scope)

Những tính năng **KHÔNG** thuộc phạm vi của GĐ1 và GĐ2:
- **Ứng dụng Native di động:** Không xây dựng app tải từ App Store / Google Play; toàn bộ chạy trên nền tảng Web Responsive.
- **Cổng thanh toán / Bán vé:** Sự kiện nội bộ hoàn toàn miễn phí, không có luồng thanh toán.
- **Hệ thống SSO / Phân quyền phức tạp (OAuth2, LDAP, RBAC đa cấp):** GĐ1 & GĐ2 dùng URL phân định và mã PIN xác thực để tinh gọn và triển khai nhanh.
- **Gửi SMS / Zalo ZNS:** Chỉ sử dụng Web và Email.
- **Khảo sát phản hồi sau sự kiện (Feedback Form):** Dành riêng cho Giai đoạn 4.

---

## 6. Design Considerations

- **Giao diện Khách mời (Mobile-First):** Thiết kế tối ưu cho màn hình điện thoại cá nhân; giao diện trang vé hiển thị mã QR to, rõ ràng, độ tương phản cao để camera máy quét dễ nhận diện ngay cả trong điều kiện thiếu sáng.
- **Giao diện Tiếp đón (Check-in Scanner):**
  - Giao diện full màn hình với khung ngắm camera tiện lợi.
  - Phản hồi trạng thái cực kỳ rõ ràng (visual badge + âm thanh bip khi thành công hoặc buzzer khi lỗi).
  - Có nút chuyển đổi camera trước/sau trên điện thoại.
- **Giao diện Dashboard Quản trị:** Tối ưu hiển thị trên màn hình laptop/máy tính bảng của ban tổ chức với các card thông số nổi bật và bảng tìm kiếm nhanh.

---

## 7. Technical Considerations

- **Kiến trúc đề xuất:**
  - **Full-stack Framework:** Next.js (App Router) hoặc React + Node.js/Fastify/Express.
  - **Ngôn ngữ:** TypeScript để đảm bảo tính chặt chẽ về dữ liệu và type safety cho junior developer.
  - **Cơ sở dữ liệu:** SQLite (cho POC GĐ1 nhẹ gọn, không cần cấu hình phức tạp) và chuyển đổi linh hoạt sang PostgreSQL (cho GĐ2/GĐ3).
  - **ORM:** Prisma hoặc Drizzle ORM để dễ quản lý migration dữ liệu.
  - **Thư viện Quét QR:** `@zxing/library` hoặc `html5-qrcode` (hoạt động tốt trên trình duyệt Safari iOS và Chrome Android).
  - **Tạo mã QR:** `qrcode` hoặc `react-qr-code`.
  - **Gửi Email (GĐ2):** Resend SDK hoặc Nodemailer.
- **Yêu cầu bảo mật cơ bản:**
  - Camera WebRTC yêu cầu môi trường HTTPS hoặc `localhost` khi thử nghiệm.
  - Mã vé QR sử dụng chuỗi ngẫu nhiên khó đoán (UUID v4 / nanoID) để tránh đoán vé của người khác.

---

## 8. Success Metrics

1. **Hiệu suất Check-in:** Trung bình dưới 3 giây cho một lượt xác thực check-in thành công.
2. **Tỷ lệ lỗi quét:** Dưới 1% lượt quét bị lỗi kỹ thuật (luôn có luồng nhập tay dự phòng).
3. **Độ chính xác dữ liệu:** 0% trường hợp check-in trùng lặp vượt qua hệ thống mà không bị cảnh báo.
4. **Tỷ lệ nhận vé thành công:** 100% người đăng ký hợp lệ nhận được mã vé hiển thị tức thì.

---

## 9. Open Questions

1. **Âm thanh thông báo khi quét:** Có cần phát âm thanh hiệu ứng "bíp" thành công / cảnh báo lỗi trên thiết bị của nhân viên đón khách không?
2. **Chính sách hủy/sửa vé:** Nhân viên sau khi đăng ký có cần chức năng tự hủy vé hoặc sửa đổi thông tin trước sự kiện không, hay chỉ cần liên hệ trực tiếp BTC?
3. **Môi trường triển khai:** Công ty dự kiến chạy trên server nội bộ (On-premise / Docker nội bộ) hay triển khai lên cloud (Vercel, Render, Supabase)?

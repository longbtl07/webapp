# Hệ Thống Đăng Ký & Quét Mã QR Check-in Sự Kiện Nội Bộ

> **POC Web App** giải quyết bài toán đăng ký và điểm danh sự kiện nội bộ công ty: thay thế bảng tính Excel thủ công, chống gian lận/trùng lặp vé, check-in siêu tốc dưới 3 giây bằng camera trình duyệt, và Dashboard thống kê thời gian thực.

---

## 🌟 3 Đối tượng Người dùng & Tính năng cốt lõi

1. **Khách mời (Nhân viên công ty):**
   - Truy cập trang sự kiện xem thông tin (ngày giờ, địa điểm, sức chứa).
   - Đăng ký tham dự bằng thông tin cá nhân (Họ tên, Email, SĐT, Mã NV, Phòng ban).
   - Hệ thống tự động kiểm tra trùng lặp email / mã nhân viên.
   - Nhận vé điện tử hiển thị mã QR sắc nét tức thì.
   - Hỗ trợ tải ảnh vé chất lượng cao (PNG) về máy hoặc sao chép link vé để xuất trình offline.

2. **Nhân viên đón khách (Check-in Staff):**
   - Đăng nhập nhanh bằng **Mã PIN: `8888`** và ghi nhận tên cổng/nhân viên trực.
   - Máy quét QR trực tiếp qua Camera trình duyệt (tự động nhận diện camera sau, có nút đổi camera).
   - Ô nhập tay mã vé dự phòng khi điện thoại khách bị vỡ/mờ màn hình.
   - Phản hồi trực quan bằng màu sắc và hiệu ứng âm thanh (Web Audio API):
     - 🟢 **Xanh lá (Thành công):** Chuông báo nhận diện, hiển thị tên khách và phòng ban.
     - 🟡 **Vàng/Cam (Cảnh báo):** Vé đã được check-in trước đó (kèm mốc giờ và người thực hiện).
     - 🔴 **Đỏ (Không hợp lệ):** Mã vé không tồn tại.
   - Danh sách 5 lượt quét gần nhất để đối soát ngay trên máy quét.

3. **Ban tổ chức (Event Organizer / Admin):**
   - Truy cập an toàn bằng **Mã PIN: `123456`**.
   - Thẻ số liệu KPI thời gian thực: Tổng đăng ký, Đã check-in, Chưa đến, Tỷ lệ tham dự (%).
   - Tự động cập nhật số liệu (Live Polling mỗi 4 giây) không cần tải lại trang.
   - Tiến độ điểm danh chi tiết theo từng phòng ban.
   - Bảng danh sách khách mời đầy đủ: tìm kiếm nhanh, lọc theo trạng thái, lọc theo phòng ban.
   - Hỗ trợ điểm danh thủ công hoặc hoàn tác trạng thái check-in.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Khởi tạo Cơ sở dữ liệu & Nạp dữ liệu mẫu
```bash
# Đồng bộ lược đồ Prisma vào SQLite
npx prisma db push

# Nạp sự kiện công ty mẫu và vé test
npx prisma db seed
```

### 3. Chạy môi trường Phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: **`http://localhost:3000`**

### 4. Build sản phẩm (Production)
```bash
npm run build
npm start
```

---

## 🔐 Cấu hình Mã PIN truy cập (.env)

| Vai trò | Biến môi trường | Mã PIN mặc định | Đường dẫn truy cập |
| :--- | :--- | :--- | :--- |
| **Trang chủ điều hướng** | - | - | `/` |
| **Đăng ký sự kiện mẫu** | - | - | `/events/townhall-q4-2026` |
| **Nhân viên đón khách** | `STAFF_PIN` | `8888` | `/checkin` |
| **Ban tổ chức (Admin)** | `ADMIN_PIN` | `123456` | `/admin` |

---

## 📋 Tài liệu dự án
- [Tài liệu PRD chi tiết (tasks/prd-event-management.md)](./tasks/prd-event-management.md)
- [Danh sách công việc & Tiến độ (tasks/tasks-event-management.md)](./tasks/tasks-event-management.md)

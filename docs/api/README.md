# GradStudio API Contract

Tài liệu này là **nguồn chân lý duy nhất (Single Source of Truth)** cho toàn bộ giao tiếp giữa Frontend (`client/`), Mock Server (`mock/server.mjs`) ở PA#3 và Express Server ở PA#4.

---

## 1. Base Path & Proxy

- **Frontend:** Mọi request từ React app bắt buộc dùng đường dẫn tương đối bắt đầu bằng `/api` (ví dụ `/api/auth/login`, `/api/catalogue`, `/api/bookings`). Tuyệt đối không hardcode `http://localhost:3001`.
- **Mock / Backend Server:** Mặc định chạy tại `http://localhost:3001` (cấu hình qua biến môi trường `PORT`, mặc định `3001`).
- **Vite Proxy:** `client/vite.config.js` forward toàn bộ `/api/*` sang `http://localhost:3001` cho cả `npm run dev` (`server.proxy`) và `npx vite preview` (`preview.proxy`).

---

## 2. Authentication & Roles

### Header xác thực
Với các endpoint yêu cầu đăng nhập, client phải gửi header:

```text
Authorization: Bearer <token>
```

Token nhận được từ `POST /api/auth/login`. Trong các ví dụ của `docs/api/*.md`, token demo được viết dưới dạng `{{token:<name>}}` (tham chiếu cột *Name in examples* trong bảng **Demo accounts** ở [01-auth.md](01-auth.md) và `FRONTEND.md`).

### Phân quyền (Roles)

| Role | Mô tả | Tài khoản mẫu |
|---|---|---|
| `public` | Khách vãng lai chưa đăng nhập (chỉ xem G1 và đăng nhập) | — |
| `customer` | Khách hàng đặt lịch, chat, thanh toán, chọn ảnh, nhận ảnh | `linh` (Linh) |
| `staff` | Nhân sự thực hiện (make-up, chụp ảnh, chỉnh sửa & upload preview) | `mai` (Mai), `tuan` (Tuấn) |
| `admin` | Điều phối viên tư vấn chat, kiểm tra trùng lịch, tạo/sửa booking, gắn link ảnh | `thao` (Admin Thảo) |
| `superadmin` | Quản trị cấp cao tạo tài khoản Admin và cấu hình hệ thống | `superadmin` |

---

## 3. Quy ước dữ liệu & Trạng thái

- **Content-Type:** `application/json; charset=utf-8` cho mọi request/response JSON. Riêng endpoint upload ảnh preview (`POST /api/bookings/:id/previews`) dùng `multipart/form-data`.
- **Quy ước đặt tên key:** `camelCase`.
- **Ngày và giờ:**
  - Ngày: `YYYY-MM-DD` (ví dụ `2026-10-24`).
  - Giờ trong ngày: `HH:mm` theo chuẩn 24h (ví dụ `09:00`, `14:00`).
  - Timestamp: ISO 8601 (ví dụ `2026-10-24T09:18:00+07:00`).
- **Tiền tệ:** Số nguyên tính theo VNĐ (ví dụ `1800000`, `540000`, `1260000`). Frontend chịu trách nhiệm định dạng hiển thị (`1.800.000đ`).

### Tên trạng thái chuẩn (Status Enums)

Tuân thủ chính xác danh sách trạng thái nghiệp vụ của GradStudio:

- **Conversation (`status`):**
  - `Chưa trả lời`
  - `Đang tư vấn`
  - `Đã chốt lịch`
  - `Hoàn thành`
- **Booking (`status`):**
  - `Chờ cọc 30%`
  - `Đã đặt lịch`
  - `Hoàn thành`
  - `Đã hủy`
- **Booking Payment Status (`paymentStatus`):**
  - `Chờ cọc 30%`
  - `Đã cọc 30%`
  - `Đã thanh toán đủ`
- **Payment Transaction (`status`):**
  - `pending`
  - `succeeded`
  - `failed`
- **Staff Job (`status`):**
  - `Chưa thực hiện`
  - `Đang thực hiện`
  - `Hoàn thành`

### Dữ kiện nghiệp vụ chuẩn (Story Fixtures)

- **Khách hàng:** `Linh` (`u-linh`)
- **Admin:** `Thảo` (`u-thao`)
- **Nhân sự:** Make-up artist `Mai` (`u-mai`), Photographer `Tuấn` (`u-tuan`)
- **Phòng studio:** `Phòng B`
- **Booking chính:** `GS-1024`, `Gói Tốt nghiệp Premium` (2 giờ, tối đa 30 ảnh chỉnh sửa), loại chụp `Tốt nghiệp cá nhân`, giá `1.800.000đ`, cọc 30% `540.000đ`, còn lại 70% `1.260.000đ`.
- **Tình huống trùng lịch:** Linh hỏi `24/10/2026` lúc `09:00`; `Mai` bận `08:00–12:00` nên `09:00` trùng lịch; đề xuất mới là make-up `13:00–14:00` với `Mai` và chụp `14:00–16:00` với `Tuấn` tại `Phòng B`. Lịch chỉ được giữ sau khi thanh toán cọc 30% thành công.
- **Booking đã có trước đó:** `GS-1023` (trạng thái `Đã đặt lịch`, đã cọc 30%, có ảnh preview để chọn và chờ thanh toán 70% còn lại).

---

## 4. Chuẩn báo lỗi thống nhất (Standard Error Shape)

Mọi phản hồi lỗi (`400`, `401`, `403`, `404`, `409`, `500`) từ API đều dùng **duy nhất một cấu trúc JSON** sau:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu gửi lên không hợp lệ.",
    "fields": {
      "email": "Vui lòng nhập email hợp lệ."
    }
  }
}
```

| Trường | Kiểu | Mô tả |
|---|---|---|
| `error.code` | `string` | Mã lỗi dạng `UPPER_SNAKE_CASE` (ví dụ `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`). |
| `error.message` | `string` | Thông báo lỗi tổng quát bằng tiếng Việt, hiển thị trực tiếp cho người dùng. |
| `error.fields` | `object` | Map `<fieldName>: <errorMessage>` cho lỗi từng trường ở HTTP `400` (để `react-hook-form` gắn lỗi vào đúng input). Với các lỗi không gắn riêng trường (`401`, `403`, `404`, `409`, `500`), trả về object rỗng `{}`. |

---

## 5. HTTP Status Codes

| Status | Ý nghĩa | Khi nào trả về |
|---|---|---|
| `200 OK` | Thành công | Truy vấn `GET`, cập nhật `PUT`/`PATCH`, đăng nhập, đăng xuất, kiểm tra trùng lịch, xác nhận thanh toán, phản hồi đề xuất, nhận ảnh. |
| `201 Created` | Tạo mới thành công | Tạo hội thoại/booking request, gửi tin nhắn, tạo booking, khởi tạo giao dịch thanh toán, upload ảnh preview, tạo tài khoản Admin. |
| `400 Bad Request` | Dữ liệu không hợp lệ | Thiếu trường bắt buộc, sai định dạng email/ngày/giờ, vượt quá độ dài/giới hạn, file upload sai định dạng hoặc vượt dung lượng. Luôn kèm chi tiết trong `error.fields`. |
| `401 Unauthorized` | Chưa xác thực | Thiếu header `Authorization: Bearer <token>`, token không hợp lệ, hoặc sai email/mật khẩu khi đăng nhập. |
| `403 Forbidden` | Không có quyền | Đã đăng nhập nhưng `role` không được phép gọi endpoint hoặc truy cập tài nguyên thuộc người dùng khác. |
| `404 Not Found` | Không tìm thấy | `id` gói chụp, hội thoại, booking, payment, job hoặc trang không tồn tại. |
| `409 Conflict` | Xung đột nghiệp vụ | Trùng lịch nhân sự/phòng khi tạo/đổi booking, tạo booking khi khách chưa đồng ý lịch, thanh toán sai trạng thái booking, xác nhận lại giao dịch đã kết thúc, chọn quá số ảnh cho phép, email Admin đã tồn tại. |
| `500 Internal Server Error` | Lỗi hệ thống | Lỗi bất ngờ ở server hoặc khi chạy mock với `MOCK_MODE=error`. |

---

## 6. Quy ước `MOCK_MODE` (PA#3 Mock Server)

`mock/server.mjs` hỗ trợ 4 chế độ thông qua biến môi trường `MOCK_MODE`:

| Mode | Hành vi quy ước |
|---|---|
| `normal` | Mặc định. Trả lời đúng dữ liệu từ `mock/data/` sau khoảng `150 ms`. |
| `slow` | Trì hoãn khoảng `2000 ms` trước khi trả lời để kiểm tra trạng thái `loading` và chống double submit. |
| `error` | Trả về `500 Internal Server Error` theo chuẩn error shape cho mọi endpoint (ngoại trừ `POST /api/auth/login` để giữ phiên đăng nhập test nút **Retry**). |
| `empty` | Mọi mảng trong response (kể cả mảng nằm bên trong object như `services`, `packages`, `conversations`, `bookings`...) đều trả về `[]`. Các endpoint trả về một object đơn (như 1 gói chụp, 1 booking, 1 payment) vẫn trả dữ liệu bình thường. |

---

## 7. Mục lục tài nguyên & Bảng toàn bộ Endpoint

| Method | Path | Roles được phép | Tài liệu chi tiết | Mô tả |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `public` | [01-auth.md](01-auth.md) | Đăng nhập bằng email & mật khẩu, nhận token và user |
| `GET` | `/api/auth/me` | `customer`, `staff`, `admin`, `superadmin` | [01-auth.md](01-auth.md) | Lấy thông tin người dùng hiện tại từ token |
| `POST` | `/api/auth/logout` | `customer`, `staff`, `admin`, `superadmin` | [01-auth.md](01-auth.md) | Đăng xuất phiên làm việc hiện tại |
| `GET` | `/api/catalogue` | `public` | [02-catalogue.md](02-catalogue.md) | Lấy thông tin studio, dịch vụ, gói chụp, extras, ảnh mẫu và reviews |
| `GET` | `/api/packages/:id` | `public` | [02-catalogue.md](02-catalogue.md) | Lấy chi tiết một gói chụp theo ID |
| `GET` | `/api/conversations` | `customer`, `admin` | [03-chat.md](03-chat.md) | Lấy danh sách hội thoại (hỗ trợ lọc `?status=...`) |
| `POST` | `/api/conversations` | `customer` | [03-chat.md](03-chat.md) | Tạo hội thoại mới / gửi Booking Request |
| `GET` | `/api/conversations/:id` | `customer`, `admin` | [03-chat.md](03-chat.md) | Lấy chi tiết hội thoại, tin nhắn và đề xuất lịch |
| `POST` | `/api/conversations/:id/messages` | `customer`, `admin` | [03-chat.md](03-chat.md) | Gửi tin nhắn mới trong hội thoại |
| `POST` | `/api/conversations/:id/proposal` | `admin` | [03-chat.md](03-chat.md) | Admin gửi đề xuất khung giờ vào hội thoại |
| `POST` | `/api/conversations/:id/proposal/respond` | `customer` | [03-chat.md](03-chat.md) | Khách hàng đồng ý hoặc từ chối khung giờ đề xuất |
| `GET` | `/api/schedule/resources` | `admin` | [04-schedule.md](04-schedule.md) | Xem lịch nhân sự & phòng theo ngày (`?date=YYYY-MM-DD`) |
| `POST` | `/api/schedule/clash-check` | `admin` | [04-schedule.md](04-schedule.md) | Kiểm tra trùng lịch nhân sự & phòng, gợi ý giờ trống bằng chữ |
| `GET` | `/api/bookings` | `customer`, `admin` | [05-bookings.md](05-bookings.md) | Lấy danh sách booking theo quyền người gọi |
| `POST` | `/api/bookings` | `admin` | [05-bookings.md](05-bookings.md) | Tạo booking mới từ hội thoại đã chốt lịch (`Chờ cọc 30%`) |
| `GET` | `/api/bookings/:id` | `customer`, `staff`, `admin` | [05-bookings.md](05-bookings.md) | Xem chi tiết một booking |
| `PATCH` | `/api/bookings/:id` | `admin` | [05-bookings.md](05-bookings.md) | Đổi lịch (có clash check) hoặc hủy booking |
| `GET` | `/api/bookings/:id/gallery` | `customer`, `staff`, `admin` | [05-bookings.md](05-bookings.md) | Xem danh sách ảnh preview, ảnh đã chọn và link file cuối |
| `PUT` | `/api/bookings/:id/gallery/selection` | `customer` | [05-bookings.md](05-bookings.md) | Lưu danh sách ảnh khách chọn để chỉnh sửa (tối đa theo gói) |
| `PATCH` | `/api/bookings/:id/final-link` | `admin` | [05-bookings.md](05-bookings.md) | Admin gắn link file ảnh hoàn chỉnh cho booking |
| `POST` | `/api/bookings/:id/receive` | `customer` | [05-bookings.md](05-bookings.md) | Khách bấm `Nhận ảnh`, chuyển booking sang `Hoàn thành` |
| `GET` | `/api/payments` | `customer`, `admin` | [06-payments.md](06-payments.md) | Lấy danh sách giao dịch thanh toán (lọc `?bookingId=...`) |
| `POST` | `/api/payments` | `customer` | [06-payments.md](06-payments.md) | Khởi tạo giao dịch cọc 30% hoặc 70% còn lại và nhận URL test gateway |
| `GET` | `/api/payments/:id` | `customer`, `admin` | [06-payments.md](06-payments.md) | Lấy chi tiết giao dịch thanh toán cho màn Test Payment Gateway |
| `POST` | `/api/payments/:id/confirm` | `customer` | [06-payments.md](06-payments.md) | Xác nhận kết quả thanh toán (thành công hoặc thất bại) từ test gateway |
| `GET` | `/api/staff/jobs` | `staff`, `admin` | [07-staff.md](07-staff.md) | Lấy danh sách công việc được giao cho nhân sự |
| `PATCH` | `/api/staff/jobs/:id` | `staff`, `admin` | [07-staff.md](07-staff.md) | Cập nhật trạng thái công việc của nhân sự |
| `POST` | `/api/bookings/:id/previews` | `staff`, `admin` | [07-staff.md](07-staff.md) | Upload ảnh preview vào booking (`multipart/form-data`) |
| `GET` | `/api/admin/accounts` | `superadmin` | [08-admin.md](08-admin.md) | Lấy danh sách tài khoản Admin |
| `POST` | `/api/admin/accounts` | `superadmin` | [08-admin.md](08-admin.md) | Tạo tài khoản Admin mới |
| `GET` | `/api/admin/settings` | `admin`, `superadmin` | [08-admin.md](08-admin.md) | Lấy cấu hình hệ thống (giờ mở cửa, thời gian nhắc lịch) |
| `PUT` | `/api/admin/settings` | `superadmin` | [08-admin.md](08-admin.md) | Cập nhật cấu hình hệ thống |
| `GET` | `/api/notifications` | `customer` | [09-notifications.md](09-notifications.md) | Lấy danh sách nhắc lịch trong tài khoản khách hàng kèm trạng thái email |

---

## Changes

- `2026-11-27`: Khởi tạo quy ước chung và bảng toàn bộ endpoint cho GradStudio API Contract (Task T03).

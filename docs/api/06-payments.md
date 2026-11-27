# 06 · Payments API

Đặc tả các endpoint thanh toán qua **Test Payment Gateway** cho khoản cọc **30%** (luồng **G7**) và khoản **70%** còn lại (luồng **G9**), cũng như lịch sử thanh toán để khách hàng và Admin theo dõi (**G10**).

> **Thiết kế sẵn sàng cho PA#4:** Ở PA#3, `POST /api/payments` trả về `checkoutUrl` trỏ tới route test nội bộ (`/test-payment/:id`) trong React app. Sang PA#4, backend chỉ cần thay `checkoutUrl` bằng URL sandbox của cổng thanh toán thật mà không cần đổi luồng gọi API ở Frontend.

---

## 1. `GET /api/payments`

- **Roles được phép:** `customer`, `admin`.
- **Mô tả:** Lấy danh sách giao dịch thanh toán. `customer` chỉ nhận được các giao dịch thuộc booking của chính mình; `admin` nhận được toàn bộ giao dịch để đối soát ở màn G10. Trong `MOCK_MODE=empty`, `payments` trả về `[]`.

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `bookingId` | `string` | Không | Lọc theo mã booking (ví dụ `GS-1024`), độ dài `1–20` ký tự, `[A-Za-z0-9-]` |
| `status` | `string` | Không | Một trong: `pending`, `succeeded`, `failed` |

### Ví dụ thành công (`200 OK`)

```http
GET /api/payments
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payments": [
    {
      "id": "PAY-1023-DEP",
      "bookingId": "GS-1023",
      "customerId": "u-linh",
      "packageName": "Gói Tốt nghiệp Premium",
      "type": "deposit",
      "amount": 540000,
      "status": "succeeded",
      "checkoutUrl": "/test-payment/PAY-1023-DEP",
      "redirectUrl": "/my-bookings?bookingId=GS-1023",
      "failureReason": null,
      "createdAt": "…",
      "paidAt": "…"
    },
    …
  ]
}
```

### Ví dụ lỗi tham số lọc không hợp lệ (`400 Bad Request`)

```http
GET /api/payments?status=unknown
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tham số lọc giao dịch không hợp lệ.",
    "fields": {
      "status": "Trạng thái phải là pending, succeeded hoặc failed."
    }
  }
}
```

### Ví dụ lỗi chưa đăng nhập (`401 Unauthorized`)

```http
GET /api/payments
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Bạn cần đăng nhập để xem lịch sử thanh toán.",
    "fields": {}
  }
}
```

### Ví dụ lỗi sai vai trò (`403 Forbidden`)

```http
GET /api/payments
Authorization: Bearer {{token:mai}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "FORBIDDEN",
    "message": "Tài khoản nhân sự không có quyền truy cập danh sách thanh toán.",
    "fields": {}
  }
}
```

---

## 2. `POST /api/payments`

- **Roles được phép:** `customer`.
- **Mô tả:** Khởi tạo một phiên thanh toán cho cọc 30% (`deposit`) hoặc 70% còn lại (`remaining`). Số tiền `amount` được tính tự động ở phía server theo gói của booking (`GS-1024`: `540000` cho `deposit`, `1260000` cho `remaining`), client không tự gửi số tiền.

### Request Body

| Trường | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `bookingId` | `string` | Có | Mã booking hợp lệ, độ dài `1–20` ký tự |
| `type` | `string` | Có | Một trong: `deposit`, `remaining` |

### Quy tắc nghiệp vụ (`409 Conflict`)

- `type = "deposit"` chỉ được phép khi booking đang ở trạng thái `Chờ cọc 30%`.
- `type = "remaining"` chỉ được phép khi booking đang ở trạng thái `Đã đặt lịch` và `paymentStatus` là `Đã cọc 30%` (chưa thanh toán đủ).

### Ví dụ thành công — Tạo giao dịch 70% còn lại cho `GS-1023` (`201 Created`)

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1023", "type": "remaining"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1023-REM",
    "bookingId": "GS-1023",
    "customerId": "u-linh",
    "packageName": "Gói Tốt nghiệp Premium",
    "type": "remaining",
    "amount": 1260000,
    "status": "pending",
    "checkoutUrl": "/test-payment/PAY-1023-REM",
    "redirectUrl": "/bookings/GS-1023/gallery",
    "failureReason": null,
    "createdAt": "…",
    "paidAt": null
  }
}
```

### Ví dụ thành công — Tạo giao dịch cọc 30% cho `GS-1024` (`201 Created`)

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "type": "deposit"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1024-DEP",
    "bookingId": "GS-1024",
    "customerId": "u-linh",
    "packageName": "Gói Tốt nghiệp Premium",
    "type": "deposit",
    "amount": 540000,
    "status": "pending",
    "checkoutUrl": "/test-payment/PAY-1024-DEP",
    "redirectUrl": "/my-bookings?bookingId=GS-1024",
    "failureReason": null,
    "createdAt": "…",
    "paidAt": null
  }
}
```

### Ví dụ lỗi Validation (`400 Bad Request`)

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "", "type": "full"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Thông tin khởi tạo thanh toán chưa hợp lệ.",
    "fields": {
      "bookingId": "Vui lòng chọn mã booking cần thanh toán.",
      "type": "Loại thanh toán phải là deposit hoặc remaining."
    }
  }
}
```

### Ví dụ lỗi không đúng vai trò (`403 Forbidden`)

```http
POST /api/payments
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"bookingId": "GS-1024", "type": "deposit"}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "FORBIDDEN",
    "message": "Chỉ khách hàng mới được khởi tạo giao dịch thanh toán.",
    "fields": {}
  }
}
```

### Ví dụ lỗi không tìm thấy booking (`404 Not Found`)

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-9999", "type": "deposit"}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy booking GS-9999.",
    "fields": {}
  }
}
```

---

## 3. `GET /api/payments/:id`

- **Roles được phép:** `customer`, `admin`.
- **Mô tả:** Lấy chi tiết một phiên thanh toán và thông tin tóm tắt của booking liên quan để hiển thị trên trang Test Payment Gateway (`/test-payment/:id`). Nếu mở trực tiếp URL với ID chưa tồn tại (ví dụ trước bước G7), trả về `404` để Frontend hiển thị thông báo rõ ràng thay vì trắng trang.

### Path Parameters

| Tham số | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `id` | `string` | Có | Mã giao dịch thanh toán, độ dài `1–40` ký tự |

### Ví dụ thành công (`200 OK`)

```http
GET /api/payments/PAY-1024-DEP
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1024-DEP",
    "bookingId": "GS-1024",
    "customerId": "u-linh",
    "packageName": "Gói Tốt nghiệp Premium",
    "type": "deposit",
    "amount": 540000,
    "status": "pending",
    "checkoutUrl": "/test-payment/PAY-1024-DEP",
    "redirectUrl": "/my-bookings?bookingId=GS-1024",
    "failureReason": null,
    "createdAt": "…",
    "paidAt": null
  },
  "booking": {
    "id": "GS-1024",
    "packageName": "Gói Tốt nghiệp Premium",
    "status": "Chờ cọc 30%",
    "paymentStatus": "Chờ cọc 30%",
    "price": 1800000,
    "depositAmount": 540000,
    "remainingAmount": 1260000
  }
}
```

### Ví dụ không tìm thấy giao dịch (`404 Not Found`)

```http
GET /api/payments/PAY-KHONG-TON-TAI
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy phiên thanh toán hoặc giao dịch chưa được khởi tạo.",
    "fields": {}
  }
}
```

---

## 4. `POST /api/payments/:id/confirm`

- **Roles được phép:** `customer`.
- **Mô tả:** Xác nhận kết quả thanh toán từ Test Payment Gateway (`success` hoặc `failed`).
  - Nếu `outcome = "failed"`: `payment.status` chuyển thành `failed`; booking giữ nguyên trạng thái trước đó (ví dụ vẫn là `Chờ cọc 30%` với cọc, hoặc `Đã đặt lịch` với phần còn lại) kèm lý do để khách thử lại.
  - Nếu `outcome = "success"`: `payment.status` chuyển thành `succeeded`; nếu `type = "deposit"`, booking chuyển từ `Chờ cọc 30%` → `Đã đặt lịch` và `paymentStatus` thành `Đã cọc 30%`; nếu `type = "remaining"`, `paymentStatus` thành `Đã thanh toán đủ`.

### Path Parameters

| Tham số | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `id` | `string` | Có | Mã giao dịch thanh toán, độ dài `1–40` ký tự |

### Request Body

| Trường | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `outcome` | `string` | Có | Một trong: `success`, `failed` |
| `failureReason` | `string` | Không | Tối đa `200` ký tự; mô tả lý do khi `outcome = "failed"` |

### Ví dụ mô phỏng thanh toán thất bại (`200 OK`)

```http
POST /api/payments/PAY-1023-REM/confirm
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"outcome": "failed", "failureReason": "Giao dịch bị hủy tại cổng thanh toán thử nghiệm."}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1023-REM",
    "bookingId": "GS-1023",
    "customerId": "u-linh",
    "packageName": "Gói Tốt nghiệp Premium",
    "type": "remaining",
    "amount": 1260000,
    "status": "failed",
    "checkoutUrl": "/test-payment/PAY-1023-REM",
    "redirectUrl": "/bookings/GS-1023/gallery",
    "failureReason": "Giao dịch bị hủy tại cổng thanh toán thử nghiệm.",
    "createdAt": "…",
    "paidAt": null
  },
  "booking": {
    "id": "GS-1023",
    "status": "Đã đặt lịch",
    "paymentStatus": "Đã cọc 30%"
  },
  "redirectUrl": "/bookings/GS-1023/gallery"
}
```

### Ví dụ mô phỏng thanh toán cọc 30% thành công (`200 OK`)

```http
POST /api/payments/PAY-1024-DEP/confirm
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"outcome": "success"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "payment": {
    "id": "PAY-1024-DEP",
    "bookingId": "GS-1024",
    "customerId": "u-linh",
    "packageName": "Gói Tốt nghiệp Premium",
    "type": "deposit",
    "amount": 540000,
    "status": "succeeded",
    "checkoutUrl": "/test-payment/PAY-1024-DEP",
    "redirectUrl": "/my-bookings?bookingId=GS-1024",
    "failureReason": null,
    "createdAt": "…",
    "paidAt": "…"
  },
  "booking": {
    "id": "GS-1024",
    "status": "Đã đặt lịch",
    "paymentStatus": "Đã cọc 30%"
  },
  "redirectUrl": "/my-bookings?bookingId=GS-1024"
}
```

### Ví dụ lỗi Validation (`400 Bad Request`)

```http
POST /api/payments/PAY-1024-DEP/confirm
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"outcome": "invalid"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Kết quả xác nhận thanh toán không hợp lệ.",
    "fields": {
      "outcome": "Giá trị outcome phải là success hoặc failed."
    }
  }
}
```

### Ví dụ lỗi xung đột khi xác nhận lại giao dịch đã kết thúc (`409 Conflict`)

```http
POST /api/payments/PAY-1024-DEP/confirm
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"outcome": "success"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CONFLICT",
    "message": "Giao dịch thanh toán này đã được xử lý trước đó.",
    "fields": {}
  }
}
```

### Ví dụ lỗi xung đột khi tạo lại cọc cho booking đã thanh toán cọc (`409 Conflict`)

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "type": "deposit"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "CONFLICT",
    "message": "Booking GS-1024 đã thanh toán cọc 30%, không thể tạo lại giao dịch cọc.",
    "fields": {}
  }
}
```

---

## Changes

- `2026-11-27`: Khởi tạo contract cho `06-payments.md` (Task T03).

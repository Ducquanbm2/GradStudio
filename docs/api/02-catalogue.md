# 02 · Catalogue API

Đặc tả các endpoint công khai cho trang chủ & danh mục dịch vụ của GradStudio (phục vụ luồng **G1** — không yêu cầu đăng nhập, đồng thời cung cấp danh sách gói/dịch vụ bổ sung cho form đặt lịch ở **G3**).

---

## 1. `GET /api/catalogue`

- **Roles được phép:** `public` (không yêu cầu đăng nhập).
- **Mô tả:** Lấy thông tin giới thiệu studio, danh sách dịch vụ, các gói chụp, dịch vụ bổ sung (extras), ảnh mẫu và đánh giá khách hàng.
- **Lưu ý `MOCK_MODE=empty`:** Các mảng `services`, `packages`, `extras`, `samplePhotos`, `reviews` đều trả về `[]` để Frontend hiển thị trạng thái `empty` rõ ràng.

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `serviceId` | `string` | Không | Lọc danh sách `packages` và `samplePhotos` theo nhóm dịch vụ (`class`, `graduation`, `portrait`). Chỉ gồm `[a-z0-9-]`, tối đa `40` ký tự. |

### Response `200 OK`

| Trường | Kiểu | Mô tả |
|---|---|---|
| `studio` | `object` | Thông tin chung: `name`, `tagline`, `address`, `openingHours`, `holdPolicy` |
| `services` | `array` | Danh sách nhóm dịch vụ (`id`, `name`, `startingPrice`, `unit`, `description`) |
| `packages` | `array` | Danh sách gói chụp chi tiết (`id`, `serviceId`, `name`, `shootType`, `durationHours`, `editedPhotosLimit`, `price`, `depositRate`, `depositAmount`, `remainingAmount`, `description`, `includes`) |
| `extras` | `array` | Dịch vụ bổ sung (`id`, `name`, `price`, `unit`, `description`) |
| `samplePhotos` | `array` | Ảnh mẫu minh họa không chứa người thật (`id`, `serviceId`, `title`, `imageUrl`, `alt`) |
| `reviews` | `array` | Đánh giá khách hàng (`id`, `author`, `packageName`, `rating`, `comment`, `date`) |

### Ví dụ thành công (`200 OK`)

```http
GET /api/catalogue
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "studio": {
    "name": "GradStudio",
    "tagline": "Studio chụp ảnh tốt nghiệp, kỷ yếu và chân dung chuyên nghiệp.",
    "address": "Phòng B · 128 Nguyễn Văn Cừ, Q.5, TP.HCM",
    "openingHours": "08:00–20:00",
    "holdPolicy": "Lịch được giữ sau khi thanh toán cọc 30% thành công và hệ thống kiểm tra lại tài nguyên."
  },
  "services": [
    {
      "id": "class",
      "name": "Kỷ yếu lớp",
      "startingPrice": 350000,
      "unit": "/người",
      "description": "Một bộ ảnh chung để cả lớp lưu lại những năm tháng bên nhau."
    },
    …
  ],
  "packages": [
    {
      "id": "pkg-grad-premium",
      "serviceId": "graduation",
      "name": "Gói Tốt nghiệp Premium",
      "shootType": "Tốt nghiệp cá nhân",
      "durationHours": 2,
      "editedPhotosLimit": 30,
      "price": 1800000,
      "depositRate": 30,
      "depositAmount": 540000,
      "remainingAmount": 1260000,
      "description": "Gói chụp tốt nghiệp cá nhân trong 2 giờ, hỗ trợ make-up và chọn tối đa 30 ảnh chỉnh sửa.",
      "includes": […]
    },
    …
  ],
  "extras": [
    {
      "id": "ext-makeup",
      "name": "Make-up chuyên nghiệp",
      "price": 350000,
      "unit": "/lần",
      "description": "Trang điểm và làm tóc trước buổi chụp 60 phút."
    },
    …
  ],
  "samplePhotos": [
    {
      "id": "photo-sample-01",
      "serviceId": "graduation",
      "title": "Góc chụp tốt nghiệp tối giản",
      "imageUrl": "…",
      "alt": "Mũ tốt nghiệp xanh coban và cuộn bằng trên bục trắng tại phòng studio ánh sáng tự nhiên"
    },
    …
  ],
  "reviews": [
    {
      "id": "rev-01",
      "author": "Khách hàng M.H.",
      "packageName": "Gói Tốt nghiệp Premium",
      "rating": 5,
      "comment": "Tư vấn giờ chụp và make-up rõ ràng, chọn ảnh online rất tiện.",
      "date": "2026-10-12"
    },
    …
  ]
}
```

### Ví dụ lỗi lọc tham số không hợp lệ (`400 Bad Request`)

```http
GET /api/catalogue?serviceId=invalid_service_id!
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tham số lọc dịch vụ không hợp lệ.",
    "fields": {
      "serviceId": "Mã nhóm dịch vụ chỉ được chứa chữ thường, số và dấu gạch ngang."
    }
  }
}
```

---

## 2. `GET /api/packages/:id`

- **Roles được phép:** `public` (không yêu cầu đăng nhập).
- **Mô tả:** Lấy thông tin chi tiết của một gói chụp cụ thể theo `id`. Trong `MOCK_MODE=empty`, endpoint trả một object đơn vẫn hoạt động bình thường.

### Path Parameters

| Tham số | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `id` | `string` | Có | Độ dài `1–50` ký tự, chỉ gồm `[a-z0-9-]` |

### Ví dụ thành công (`200 OK`)

```http
GET /api/packages/pkg-grad-premium
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "package": {
    "id": "pkg-grad-premium",
    "serviceId": "graduation",
    "name": "Gói Tốt nghiệp Premium",
    "shootType": "Tốt nghiệp cá nhân",
    "durationHours": 2,
    "editedPhotosLimit": 30,
    "price": 1800000,
    "depositRate": 30,
    "depositAmount": 540000,
    "remainingAmount": 1260000,
    "description": "Gói chụp tốt nghiệp cá nhân trong 2 giờ, hỗ trợ make-up và chọn tối đa 30 ảnh chỉnh sửa.",
    "includes": […]
  }
}
```

### Ví dụ không tìm thấy gói chụp (`404 Not Found`)

```http
GET /api/packages/pkg-khong-ton-tai
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy gói chụp được yêu cầu.",
    "fields": {}
  }
}
```

---

## Changes

- `2026-11-27`: Khởi tạo contract cho `02-catalogue.md` (Task T03).

# 01 · Authentication API

Đặc tả các endpoint đăng nhập, lấy thông tin người dùng hiện tại và đăng xuất (phục vụ luồng **G2** và bảo vệ route cho cả 4 vai trò).

---

## Tài khoản Demo chuẩn (Demo Accounts)

Các tài khoản dưới đây được seed sẵn trong `mock/data/` và dùng chung với bảng *Demo accounts* trong `FRONTEND.md`:

| Name in examples | Role | E-mail | Password | User ID | Display Name |
|---|---|---|---|---|---|
| `linh` | `customer` | `linh@gradstudio.test` | `linh-demo` | `u-linh` | `Linh` |
| `thao` | `admin` | `thao@gradstudio.test` | `thao-demo` | `u-thao` | `Thảo` |
| `mai` | `staff` | `mai@gradstudio.test` | `mai-demo` | `u-mai` | `Mai` |
| `tuan` | `staff` | `tuan@gradstudio.test` | `tuan-demo` | `u-tuan` | `Tuấn` |
| `superadmin` | `superadmin` | `superadmin@gradstudio.test` | `superadmin-demo` | `u-superadmin` | `Quản trị viên cấp cao` |

---

## 1. `POST /api/auth/login`

- **Roles được phép:** `public` (không cần token).
- **Mô tả:** Xác thực bằng email và mật khẩu, trả về `token` và thông tin `user` để client lưu vào `AuthContext` và điều hướng về trang chủ của vai trò tương ứng.

### Request Body

| Trường | Kiểu | Bắt buộc | Giới hạn & Ràng buộc |
|---|---|---|---|
| `email` | `string` | Có | Định dạng email hợp lệ, độ dài `5–120` ký tự |
| `password` | `string` | Có | Độ dài `6–100` ký tự |

### Response `200 OK`

| Trường | Kiểu | Mô tả |
|---|---|---|
| `token` | `string` | Bearer token định danh phiên làm việc (ví dụ `token-u-linh`, giữ được qua lần restart mock) |
| `user.id` | `string` | ID người dùng |
| `user.name` | `string` | Tên hiển thị |
| `user.email` | `string` | Email đăng nhập |
| `user.role` | `string` | Một trong: `customer`, `staff`, `admin`, `superadmin` |
| `user.specialty` | `string \| null` | Chuyên môn nếu là `staff` (ví dụ `"Make-up"`, `"Chụp ảnh"`), `null` với các role khác |

### Ví dụ thành công (`200 OK`)

```http
POST /api/auth/login
Content-Type: application/json

{"email": "linh@gradstudio.test", "password": "linh-demo"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "u-linh",
    "name": "Linh",
    "email": "linh@gradstudio.test",
    "role": "customer",
    "specialty": null
  }
}
```

### Ví dụ lỗi Validation (`400 Bad Request`)

```http
POST /api/auth/login
Content-Type: application/json

{"email": "khong-phai-email", "password": ""}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Thông tin đăng nhập chưa hợp lệ.",
    "fields": {
      "email": "Email không đúng định dạng.",
      "password": "Vui lòng nhập mật khẩu (tối thiểu 6 ký tự)."
    }
  }
}
```

### Ví dụ lỗi sai thông tin (`401 Unauthorized`)

```http
POST /api/auth/login
Content-Type: application/json

{"email": "linh@gradstudio.test", "password": "sai-mat-khau"}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email hoặc mật khẩu không chính xác.",
    "fields": {}
  }
}
```

---

## 2. `GET /api/auth/me`

- **Roles được phép:** `customer`, `staff`, `admin`, `superadmin`.
- **Mô tả:** Lấy thông tin người dùng hiện tại từ header `Authorization: Bearer <token>`. Dùng để khôi phục/xác minh phiên đăng nhập khi reload trang.

### Headers

| Header | Bắt buộc | Mô tả |
|---|---|---|
| `Authorization` | Có | `Bearer <token>` |

### Ví dụ thành công (`200 OK`)

```http
GET /api/auth/me
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "user": {
    "id": "u-linh",
    "name": "Linh",
    "email": "linh@gradstudio.test",
    "role": "customer",
    "specialty": null
  }
}
```

### Ví dụ lỗi chưa xác thực (`401 Unauthorized`)

```http
GET /api/auth/me
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
    "fields": {}
  }
}
```

---

## 3. `POST /api/auth/logout`

- **Roles được phép:** `customer`, `staff`, `admin`, `superadmin`.
- **Mô tả:** Kết thúc phiên đăng nhập ở phía client.
- **Lưu ý cho Mock (PA#3):** Với các token demo tĩnh (`token-u-...`), mock server trả `200 OK` và không thu hồi token đó trên server để các bài kiểm thử tự động kế tiếp dùng `{{token:linh}}` vẫn thực hiện được; ở phía Frontend, client bắt buộc xóa sạch token và user khỏi `AuthContext` và storage.

### Headers

| Header | Bắt buộc | Mô tả |
|---|---|---|
| `Authorization` | Có | `Bearer <token>` |

### Ví dụ thành công (`200 OK`)

```http
POST /api/auth/logout
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ok": true,
  "message": "Đã đăng xuất thành công."
}
```

### Ví dụ lỗi chưa xác thực (`401 Unauthorized`)

```http
POST /api/auth/logout
Content-Type: application/json

{}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Bạn cần đăng nhập để thực hiện thao tác này.",
    "fields": {}
  }
}
```

---

## Changes

- `2026-11-27`: Khởi tạo contract cho `01-auth.md` (Task T03).

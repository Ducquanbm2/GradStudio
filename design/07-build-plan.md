# 07. Build plan trước khi code

## 1. Chốt quyết định với cả nhóm

Trước khi tạo component đầu tiên, nhóm nên thống nhất và ghi lại:

- [ ] Tên sản phẩm và visual direction: dùng concept Editorial Flow hoặc đổi tên.
- [ ] Stack: React + TypeScript + Vite, Node + TypeScript, PostgreSQL, Prisma.
- [ ] Cách auth: cookie session hoặc access/refresh token.
- [ ] Payment gateway sẽ mock ở local, tích hợp thật sau khi core flow ổn định.
- [ ] Object storage local: MinIO; không commit ảnh cá nhân vào repo.
- [ ] Các thành viên phụ trách module và người review pull request.

## 2. Cấu trúc repository đề xuất

```text
gradstudio/
├── apps/
│   ├── web/                 # React/Vite
│   ├── api/                 # Node/TypeScript modular monolith
│   └── worker/              # reminder + payment webhook jobs, có thể thêm sau
├── packages/
│   ├── domain/              # enums, value objects, transition rules
│   ├── contracts/           # request/response schemas
│   └── ui/                  # shared UI nếu nhóm cần
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── infra/
│   └── docker-compose.yml
├── docs/                    # link hoặc copy design pack đã duyệt
└── design/                  # bộ thiết kế hiện tại
```

Nếu nhóm chưa quen monorepo, có thể bắt đầu bằng `web/` và `api/` ở root; không cần dựng worker/Redis ngay ngày đầu.

## 3. Local infrastructure tối thiểu

Chỉ cần PostgreSQL trước. MinIO thêm khi bắt đầu gallery; Redis thêm khi có reminder worker.

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: gradstudio
      POSTGRES_USER: gradstudio
      POSTGRES_PASSWORD: gradstudio_dev
    ports:
      - "5432:5432"
    volumes:
      - gradstudio_pg:/var/lib/postgresql/data

volumes:
  gradstudio_pg:
```

Environment tối thiểu:

```text
DATABASE_URL=postgresql://gradstudio:gradstudio_dev@localhost:5432/gradstudio
APP_ORIGIN=http://localhost:5173
SESSION_SECRET=change-me-in-local-only
PAYMENT_MODE=mock
STORAGE_MODE=local
```

Không commit `.env`; chỉ commit `.env.example`.

## 4. Thứ tự làm vertical slice

### Slice 0 - Foundation

1. Tạo frontend/backend và lint/format/test script.
2. Chạy PostgreSQL bằng Docker Compose.
3. Tạo Prisma schema từ `database/schema.sql` hoặc chuyển schema sang Prisma.
4. Seed các role, package, resource và user demo.
5. Tạo health check `/health` và trang error boundary.

### Slice 1 - Catalogue -> conversation

1. GET package list.
2. Trang catalogue responsive.
3. Customer đăng nhập mock.
4. Tạo conversation và gửi message.
5. Admin xem inbox và thread.

### Slice 2 - Conflict -> waiting deposit booking

1. Admin tạo schedule proposal.
2. Scheduler trả conflict reason và suggested slot.
3. Customer agree proposal.
4. Admin tạo `AGREED_WAITING_DEPOSIT`.
5. Customer xem booking detail và payment snapshot.

### Slice 3 - Mock deposit -> confirmed booking

1. Tạo payment intent mock.
2. Nhận webhook idempotent.
3. Transaction re-check resource.
4. Update booking, assignments, tasks, notification.
5. Viết test race condition cho hai request cùng chiếm một resource.

### Slice 4 - Production -> gallery -> delivery

1. Staff xem task.
2. Upload preview metadata/object key.
3. Customer chọn ảnh trong giới hạn package.
4. Staff cập nhật progress và thêm delivery.
5. Mock balance payment và mark received.

## 5. Definition of Done cho từng slice

- API có validation và permission check;
- có loading, empty, error state trong UI;
- có unit test cho business rule;
- có một API integration test cho happy path;
- có audit event cho state transition;
- không dùng dữ liệu hard-code trong component nếu dữ liệu thuộc domain;
- cập nhật sơ đồ/state machine khi rule thay đổi;
- chạy được từ README trên máy thành viên mới.

## 6. Test cases ưu tiên

| Case | Kỳ vọng |
| --- | --- |
| 09:00 trùng Mai | API trả resource và interval gây conflict |
| Customer chưa agree | Không thể tạo booking |
| Booking chờ cọc | Không có assignment `CONFIRMED` |
| Webhook gửi hai lần | Chỉ có một payment success và một lần confirm |
| Hai customer cùng cọc một phòng | Một request thành công, một request bị conflict |
| Chọn hơn giới hạn ảnh | Không lưu selection |
| Customer xem booking người khác | 403 hoặc 404, không lộ dữ liệu |
| Hủy booking | Assignment được release, audit event được ghi |

## 7. Không nên làm ngay

- tách microservice;
- làm app mobile native;
- tích hợp cùng lúc nhiều payment gateway;
- upload file trực tiếp vào database;
- làm chat realtime WebSocket trước khi REST flow chạy ổn;
- xây dashboard doanh thu nếu chưa hoàn tất booking lifecycle.

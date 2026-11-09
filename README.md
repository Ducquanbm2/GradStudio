# GradStudio

GradStudio là hệ thống website giúp studio ảnh quản lý toàn bộ quy trình chụp ảnh: từ lúc khách xem dịch vụ và tư vấn, đến khi thống nhất lịch, thanh toán, thực hiện buổi chụp, chọn ảnh và nhận file hoàn thiện.

Đây là repository làm việc riêng của nhóm. Các tài liệu, giao diện, kiến trúc và database trong repo này là thiết kế của nhóm, không phụ thuộc vào prototype hay cách tổ chức của nhóm khác.

## 1. Mục tiêu sản phẩm

### Đối với khách hàng

- Xem gói chụp, dịch vụ thêm, portfolio và đánh giá.
- Gửi yêu cầu hoặc tư vấn trực tiếp với studio.
- Xem giờ đã thống nhất và các mốc cần có mặt.
- Thanh toán cọc 30% để giữ lịch chính thức.
- Theo dõi buổi chụp, xem gallery preview và chọn ảnh cần chỉnh.
- Thanh toán phần còn lại và nhận file hoàn thiện.

### Đối với studio

- Tiếp nhận và xử lý yêu cầu của khách.
- Kiểm tra lịch nhân viên, phòng và tài nguyên để tránh trùng lịch.
- Tạo, đổi, hủy và theo dõi booking.
- Phân công makeup artist, photographer, editor và phòng chụp.
- Theo dõi task, gallery, tiến độ chỉnh ảnh và giao file.

## 2. Các vai trò trong hệ thống

| Vai trò | Trách nhiệm chính |
| --- | --- |
| Customer | Tư vấn, thống nhất giờ, thanh toán, chọn ảnh và nhận file |
| Staff | Xem task được giao, cập nhật tiến độ, upload preview và chỉnh ảnh |
| Admin | Điều phối booking, nhân sự, tài nguyên, thanh toán và delivery |
| Superadmin | Quản lý Admin và cấu hình chung của hệ thống |

## 3. Trạng thái nghiệp vụ quan trọng

### Conversation

```text
Chưa trả lời -> Đang tư vấn -> Đã chốt lịch -> Hoàn thành
```

### Booking

```text
DRAFT
  -> AGREED_WAITING_DEPOSIT
  -> CONFIRMED
  -> PREPARING
  -> SHOOT_IN_PROGRESS
  -> AWAITING_SELECTION
  -> EDITING
  -> READY_TO_DELIVER
  -> COMPLETED
```

Quy tắc quan trọng: booking chỉ chiếm lịch chính thức sau khi thanh toán cọc thành công và hệ thống kiểm tra lại tài nguyên. Booking đang chờ cọc chưa được xem là đã giữ lịch.

## 4. Tài liệu thiết kế

Đọc theo thứ tự sau trước khi bắt đầu code:

1. [Product brief và use case](design/01-product-and-use-cases.md)
2. [Use case, activity và sequence diagrams](design/02-diagrams.md)
3. [UI direction và prototype specification](design/03-ui-and-prototype.md)
4. [Development view và deployment view](design/04-architecture.md)
5. [Class diagram và domain model](design/05-class-model.md)
6. [Database design và ERD](design/06-database.md)
7. [Build plan trước khi code](design/07-build-plan.md)

Tài liệu tổng hợp: [Design Pack](design/README.md).

## 5. Prototype UI

Prototype tĩnh nằm trong [design/prototype/](design/prototype/):

- [Customer catalogue](design/prototype/index.html)
- [Studio console](design/prototype/admin.html)
- [Customer booking detail](design/prototype/booking.html)

Chạy prototype bằng server tĩnh:

```bash
cd design
python3 -m http.server 4173
```

Mở trình duyệt tại:

```text
http://localhost:4173/prototype/
```

Prototype chỉ dùng để thống nhất flow và giao diện. Các nút thanh toán, gửi tin nhắn và những chức năng backend chưa có sẽ được tích hợp sau.

## 6. Database

Database sử dụng PostgreSQL. Schema khởi đầu nằm tại [design/database/schema.sql](design/database/schema.sql).

Schema hiện bao gồm:

- users, roles và profiles;
- packages và extra services;
- conversations, messages và schedule proposals;
- bookings, booking schedules và resource assignments;
- payments và production tasks;
- galleries, photo assets, photo selections và deliveries;
- notifications và audit events.

Schema dùng `pgcrypto` để tạo UUID và `btree_gist` để hỗ trợ constraint chống trùng resource assignment.

Nếu đã cài PostgreSQL, có thể tạo database và chạy schema:

```bash
createdb gradstudio
psql -d gradstudio -f design/database/schema.sql
```

Không commit password, API key hoặc file `.env` thật lên repository. Chỉ commit `.env.example`.

## 7. Công nghệ đề xuất

| Phần | Công nghệ |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + TypeScript + Express hoặc Fastify |
| ORM | Prisma |
| Database | PostgreSQL |
| File storage | MinIO local hoặc S3-compatible storage |
| Authentication | Cookie session hoặc access/refresh token |
| Testing | Vitest/Jest, Supertest và Playwright |
| Local environment | Docker Compose |

Ở phiên bản đầu, backend nên làm theo mô hình modular monolith. Chưa cần tách microservice.


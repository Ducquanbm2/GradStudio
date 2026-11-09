## Thứ tự bắt đầu công việc

### Bước 1 - Thống nhất trong nhóm

- Chốt stack và tên các module.
- Chia người phụ trách frontend, backend, database và UI.
- Thống nhất convention đặt tên, branch và pull request.
- Đọc toàn bộ design pack.

### Bước 2 - Khởi tạo môi trường

- Tạo frontend và backend.
- Chạy PostgreSQL bằng Docker Compose.
- Chuyển schema sang Prisma nếu sử dụng Prisma.
- Tạo seed cho role, package, resource và tài khoản demo.
- Tạo endpoint `/health`.

### Bước 3 - Làm vertical slice đầu tiên

Làm một flow hoàn chỉnh nhỏ trước:

```text
Catalogue
  -> Customer gửi conversation
  -> Admin xem conversation
  -> Admin đề xuất giờ
  -> Customer đồng ý
  -> Admin tạo booking chờ cọc
  -> Customer xem booking detail
```

Sau khi flow này chạy ổn mới thêm payment, gallery và delivery.

### Bước 4 - Các flow tiếp theo

1. Mock deposit payment và confirm booking.
2. Kiểm tra conflict và tạo resource assignment.
3. Phân công task cho Staff.
4. Upload preview và customer chọn ảnh.
5. Thanh toán balance và giao file.
6. Thêm notification, email và audit log.

## 9. Quy ước làm việc nhóm

- Không commit trực tiếp vào `main`.
- Mỗi chức năng làm trên một branch riêng, ví dụ `feature/customer-booking`.
- Pull request phải mô tả: mục tiêu, file chính, cách chạy và cách kiểm thử.
- Không tự ý đổi business rule nếu chưa cập nhật use case và diagram.
- Không hard-code dữ liệu nghiệp vụ trong component nếu dữ liệu đó thuộc database.
- Không lưu file ảnh thật hoặc thông tin cá nhân thật vào repository.
- Mọi thay đổi trạng thái booking phải đi qua service nghiệp vụ và có test.
- Khi sửa database, cập nhật cả migration, seed và tài liệu liên quan.

## 10. Definition of Done

Một chức năng chỉ được xem là hoàn thành khi:

- có UI cho trạng thái loading, empty và error;
- backend có validate input và kiểm tra quyền;
- có test cho business rule chính;
- database migration chạy được từ môi trường mới;
- không phá vỡ flow hiện có;
- README hoặc tài liệu module đã được cập nhật nếu cần.

## 11. Việc cần làm ngay

- [ ] Cả nhóm đọc [Design Pack](design/README.md).
- [ ] Chốt stack và cấu trúc repository.
- [ ] Tạo Docker Compose cho PostgreSQL.
- [ ] Khởi tạo frontend/backend.
- [ ] Tạo database migration và seed data.
- [ ] Làm flow catalogue -> conversation -> waiting deposit booking.
- [ ] Tạo issue/task tương ứng cho từng thành viên.

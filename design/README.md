# GradStudio - Design Pack

> Bộ tài liệu này là baseline thiết kế độc lập cho nhóm trước khi bắt đầu code. Nó tuân theo chủ đề và phạm vi của brief môn học, nhưng không sao chép prototype, layout hoặc mô hình dữ liệu của repository tham khảo.

## Ý tưởng thiết kế

**Tên concept:** GradStudio - Editorial Flow

**Định hướng:** xem mỗi booking như một hồ sơ sản xuất ảnh có timeline, tài nguyên, thanh toán và gallery riêng. Trọng tâm của thiết kế là:

- không tạo lịch chính thức trước khi cọc thành công;
- giải thích rõ lý do xung đột tài nguyên;
- liên kết mọi công việc của nhân viên với một booking;
- để khách chọn ảnh và nhận file trong cùng một hồ sơ.

## Thứ tự đọc và triển khai

1. [01 - Product and use cases](01-product-and-use-cases.md)
2. [02 - Diagrams](02-diagrams.md)
3. [03 - UI and prototype specification](03-ui-and-prototype.md)
4. [04 - Architecture views](04-architecture.md)
5. [05 - Class model](05-class-model.md)
6. [06 - Database design](06-database.md)
7. [07 - Build plan](07-build-plan.md)
8. [Prototype HTML](prototype/index.html)

## Prototype tĩnh

Mở `prototype/index.html` bằng trình duyệt hoặc chạy server tĩnh tại thư mục `design`:

```bash
cd design
python3 -m http.server 4173
```

Sau đó mở `http://localhost:4173/prototype/`. Các trang được thiết kế để mở trực tiếp:

- `prototype/index.html`: khách xem dịch vụ và cuộc tư vấn;
- `prototype/admin.html`: nhân viên xử lý xung đột và thấy trạng thái sau khi khách đồng ý;
- `prototype/booking.html`: khách xem timeline và booking đang chờ cọc.

## Phạm vi baseline

### Có trong baseline

- tài khoản Customer, Staff, Admin, Superadmin;
- catalogue gói chụp, dịch vụ thêm, portfolio, đánh giá;
- tư vấn và yêu cầu đặt lịch;
- kiểm tra xung đột nhân sự và tài nguyên;
- booking chờ cọc, cọc 30%, thanh toán 70% còn lại;
- phân công việc, trạng thái sản xuất;
- gallery ảnh xem trước, chọn ảnh cần chỉnh;
- giao file hoàn thiện và xác nhận nhận ảnh;
- thông báo trong tài khoản và email.

### Chưa làm ở phiên bản đầu

- đồng bộ tin nhắn Facebook/Zalo;
- marketplace nhiều studio;
- nhiều chi nhánh độc lập;
- app mobile native;
- chỉnh ảnh bằng AI hoặc nhận diện khuôn mặt.

## Quy ước nghiệp vụ quan trọng

1. `AGREED_WAITING_DEPOSIT` chỉ là thỏa thuận giờ, chưa chiếm lịch chính thức.
2. Chỉ transaction thanh toán cọc thành công và kiểm tra xung đột lần cuối mới chuyển booking sang `CONFIRMED`.
3. Mỗi booking có nhiều mốc thời gian và nhiều resource assignment; không giả định một booking chỉ có một khoảng giờ.
4. Tất cả tiền lưu dạng số nguyên VND trong database, không dùng floating point.
5. Ảnh preview và file hoàn thiện lưu object storage; database chỉ lưu metadata và object key.
6. Mọi thay đổi trạng thái booking quan trọng phải ghi audit log để dễ truy vết.

## Dữ liệu demo thống nhất

Để khớp brief của môn học, prototype dùng cùng câu chuyện kiểm thử: Linh hỏi gói tốt nghiệp ngày 24/10/2026 lúc 09:00; Mai bận 08:00-12:00; studio đề xuất makeup 13:00-14:00 với Mai và chụp 14:00-16:00 với Tuấn tại Phòng B; booking là `GS-1024`, giá 1.800.000 VND, cọc 540.000 VND.

Các tên và con số này chỉ là dữ liệu demo bắt buộc của brief. Thiết kế UI, domain model và cách tổ chức hệ thống trong bộ tài liệu là của concept này.

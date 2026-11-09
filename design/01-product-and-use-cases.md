# 01. Product brief và use case

## 1. Product brief

### 1.1 Problem statement

Khách thường phải hỏi studio qua nhiều kênh, không biết giờ nào đã được giữ thật, và dễ bỏ sót các mốc makeup, chụp hoặc nhận ảnh. Phía studio phải đối chiếu lịch nhân viên, phòng và trang phục bằng tay nên dễ xảy ra trùng lịch. Sau buổi chụp, việc chọn ảnh, theo dõi chỉnh sửa và giao file lại bị tách khỏi thông tin booking.

### 1.2 Product goal

GradStudio tạo một hồ sơ xuyên suốt cho mỗi yêu cầu chụp: từ catalogue và tư vấn, đến thống nhất giờ, cọc, phân công, chụp, chọn ảnh, thanh toán phần còn lại và nhận file.

### 1.3 Success criteria

| Mục tiêu | Cách kiểm chứng trong bản đầu |
| --- | --- |
| Không tạo booking chính thức khi chưa cọc | Booking chờ cọc không tạo assignment giữ lịch |
| Không xảy ra double booking | API và database cùng chặn resource overlap |
| Nhân viên biết mình phải làm gì | Mỗi assignment có role, thời gian, resource và trạng thái |
| Khách không lạc giữa các bước | Customer portal hiển thị timeline và next action |
| Có thể truy vết lỗi | Audit log cho đổi trạng thái, thanh toán, đổi lịch, giao file |

## 2. Actors

| Actor | Mục tiêu | Quyền chính |
| --- | --- | --- |
| Guest | Khám phá dịch vụ | Xem catalogue, portfolio, review |
| Customer | Đặt và hoàn tất buổi chụp | Gửi yêu cầu, chat, đồng ý giờ, thanh toán, chọn ảnh, nhận file |
| Admin | Điều phối studio | Tư vấn, kiểm tra lịch, tạo và đổi booking, phân công, theo dõi thanh toán |
| Staff | Hoàn thành phần việc | Xem assignment, cập nhật tiến độ, tải preview, hoàn thiện ảnh |
| Superadmin | Quản trị hệ thống | Quản lý Admin, cấu hình hệ thống, audit |
| Payment gateway | Xử lý giao dịch | Trả kết quả thanh toán và webhook |
| Notification service | Gửi nhắc hẹn | Email và thông báo trong tài khoản |
| Object storage | Lưu file ảnh | Lưu preview và file hoàn thiện theo object key |

## 3. Use-case map

### 3.1 Customer-facing

| ID | Use case | Actor chính | Kết quả |
| --- | --- | --- | --- |
| UC-C01 | Xem catalogue | Guest/Customer | Biết gói, giá tham khảo, extras, portfolio, review |
| UC-C02 | Tạo yêu cầu tư vấn/đặt chụp | Customer | Có request với loại buổi chụp, thời gian mong muốn, extras |
| UC-C03 | Trao đổi và đồng ý khung giờ | Customer, Admin | Conversation chuyển `Đã chốt lịch` |
| UC-C04 | Xem booking và timeline | Customer | Biết trạng thái, mốc cần đến, số tiền phải trả |
| UC-C05 | Thanh toán cọc 30% | Customer, Payment gateway | Booking thành `Đã đặt lịch` nếu kiểm tra resource thành công |
| UC-C06 | Chọn ảnh cần chỉnh | Customer | Gallery lưu danh sách ảnh được chọn trong giới hạn gói |
| UC-C07 | Thanh toán 70% còn lại | Customer, Payment gateway | Booking đủ điều kiện giao file |
| UC-C08 | Nhận file hoàn thiện | Customer | Customer xác nhận nhận ảnh, booking thành `Hoàn thành` |

### 3.2 Studio operations

| ID | Use case | Actor chính | Kết quả |
| --- | --- | --- | --- |
| UC-S01 | Tiếp nhận và phản hồi conversation | Admin | Tin nhắn và trạng thái tư vấn được cập nhật |
| UC-S02 | Kiểm tra xung đột tài nguyên | Admin, System | Có danh sách xung đột và slot thay thế |
| UC-S03 | Tạo booking chờ cọc | Admin | Booking gắn với conversation, chưa giữ lịch chính thức |
| UC-S04 | Xác nhận lịch sau cọc | System | Tạo resource assignment và task trong transaction |
| UC-S05 | Đổi hoặc hủy booking | Admin | Re-check resource và cập nhật assignment liên quan |
| UC-S06 | Phân công và theo dõi task | Admin, Staff | Task có người nhận, deadline, trạng thái |
| UC-S07 | Đăng preview và cập nhật chỉnh sửa | Staff | Gallery và progress được cập nhật |
| UC-S08 | Giao file hoàn thiện | Admin/Staff | Delivery link được thêm vào booking |
| UC-S09 | Quản lý catalogue và resource | Admin | Dữ liệu dịch vụ, nhân sự, phòng, trang phục được duy trì |
| UC-S10 | Quản lý Admin và system settings | Superadmin | Tài khoản Admin và cấu hình chung được cập nhật |

## 4. Detailed use cases

### UC-C03/UC-S02 - Thống nhất lịch không trùng tài nguyên

**Precondition:** Customer đã đăng nhập và có request; Admin đang mở conversation.

**Main flow:**

1. Admin chọn gói và nhập ngày, giờ mong muốn, duration, extras.
2. System tìm resource phù hợp theo skill/type và kiểm tra tất cả khoảng thời gian cần dùng.
3. Nếu slot bị trùng, System trả về resource gây xung đột và các slot gần nhất còn đủ người.
4. Admin gửi đề xuất mới trong conversation.
5. Customer đồng ý hoặc từ chối đề xuất.
6. Nếu đồng ý, conversation thành `Đã chốt lịch`; request lưu agreed schedule.

**Alternative flows:**

- A1: Customer từ chối: conversation vẫn `Đang tư vấn`, Admin đề xuất slot khác.
- A2: Không có slot phù hợp trong ngày: đề xuất ngày khác hoặc ghi nhận waitlist.
- A3: Gói/extras đổi duration: System kiểm tra lại từ đầu, không giữ kết quả cũ.

**Business rules:**

- Không được tạo booking nếu chưa có customer agreement.
- Một đề xuất phải lưu snapshot của start/end, gói, extras và resource dự kiến.
- Slot chờ cọc không chiếm lịch chính thức.

### UC-S03 - Tạo booking chờ cọc

**Precondition:** Conversation đã `Đã chốt lịch`.

**Main flow:**

1. Admin xác nhận customer, package, extras, agreed schedule và giá.
2. System tạo booking ở `AGREED_WAITING_DEPOSIT`.
3. System tạo payment intent cho 30% nhưng chưa đánh dấu thành công.
4. Customer thấy booking trong portal với next action là thanh toán cọc.

**Postcondition:** Booking tồn tại nhưng chưa có assignment trạng thái `CONFIRMED` và chưa chiếm slot.

### UC-C05/UC-S04 - Cọc và giữ lịch chính thức

**Precondition:** Booking ở `AGREED_WAITING_DEPOSIT`.

**Main flow:**

1. Customer mở booking và chọn thanh toán cọc.
2. System tạo payment intent 30% và chuyển Customer sang gateway.
3. Gateway trả success qua redirect/webhook.
4. Backend xác minh chữ ký và số tiền.
5. Backend mở transaction, lock các resource liên quan, kiểm tra overlap lần cuối.
6. Nếu còn trống, payment thành `SUCCEEDED`, booking thành `CONFIRMED`, tạo assignment và task.
7. System tạo reminder và gửi thông báo xác nhận.

**Alternative flows:**

- A1: Gateway fail/cancel: payment thành `FAILED` hoặc `CANCELLED`, booking vẫn chờ cọc.
- A2: Resource vừa bị chiếm: payment được đánh dấu cần xử lý/refund theo policy; booking không thành confirmed.
- A3: Webhook đến trễ: trang customer đọc lại trạng thái từ backend, không tin client redirect.

### UC-C06 - Chọn ảnh cần chỉnh

**Precondition:** Staff đã upload preview; booking ở `AWAITING_SELECTION`.

**Main flow:**

1. Customer mở gallery của booking.
2. System hiển thị số ảnh đã chọn và giới hạn theo package.
3. Customer chọn/bỏ chọn ảnh.
4. Customer bấm lưu lựa chọn.
5. System validate giới hạn và snapshot danh sách selection.
6. Booking thành `EDITING` khi lựa chọn hợp lệ được chốt.

**Alternative flows:**

- A1: Chọn vượt giới hạn: không cho lưu, hiển thị số còn được chọn.
- A2: Gallery chưa sẵn sàng: hiển thị trạng thái chờ, không cho chốt.

### UC-C08 - Nhận ảnh và hoàn tất

**Precondition:** Balance payment success, final delivery link available.

**Main flow:**

1. Customer mở delivery card và xem thông tin file.
2. Customer bấm xác nhận nhận ảnh.
3. System ghi nhận received_at và chuyển booking thành `COMPLETED`.
4. System gửi email cảm ơn và mời review.

## 5. State machine

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

AGREED_WAITING_DEPOSIT -> CANCELLED
CONFIRMED              -> RESCHEDULE_REQUESTED -> CONFIRMED
CONFIRMED              -> CANCELLED
```

### Conversation

```text
CHUA_TRA_LOI -> DANG_TU_VAN -> DA_CHOT_LICH -> HOAN_THANH
```

## 6. Acceptance checklist trước khi code

- [ ] Mỗi use case có actor, precondition, main flow, alternative flow.
- [ ] Có rule rõ về thời điểm chiếm lịch.
- [ ] Có state machine cho conversation và booking.
- [ ] Có kế hoạch xử lý payment webhook, không chỉ redirect.
- [ ] Có giới hạn ảnh theo package.
- [ ] Có audit log cho thao tác quan trọng.
- [ ] Có thể chạy prototype bằng file tĩnh, không cần build tool.

# 03. UI direction và prototype specification

## 1. UI concept: Editorial Flow

Đây là một hướng giao diện riêng của nhóm, thiên về “production desk”, tập trung vào hồ sơ booking, timeline và trạng thái xử lý.

| Thành phần | Quyết định |
| --- | --- |
| Tone | Ấm, editorial, chuyên nghiệp nhưng không sang trọng quá mức |
| Màu nền | Charcoal `#171715` và paper `#F7F3EA` |
| Accent | Amber `#E7A83B`, teal `#5E948D`, coral `#D56D55` |
| Typography | `Inter` cho UI, Georgia fallback cho headline |
| Hình ảnh | Dùng abstract gradient, silhouette, initials; không dùng ảnh người thật chưa kiểm quyền |
| Layout | Card nhỏ, bảng timeline, section có nhãn trạng thái; tránh overlay chat che nội dung |
| Responsive | Desktop 3 cột; tablet 2 cột; mobile chuyển thành stack theo thứ tự ưu tiên |

## 2. Information architecture

```text
Public
├── Trang chủ / Catalogue
├── Gói dịch vụ
├── Portfolio
└── Đăng nhập

Customer portal
├── Tổng quan
├── Lịch chụp của tôi
│   └── Booking detail
│       ├── Timeline
│       ├── Payment
│       ├── Gallery / Selection
│       └── Delivery
└── Hồ sơ

Studio console
├── Inbox / Conversation
├── Booking board
├── Calendar / Resources
├── Tasks
├── Gallery queue
└── Catalogue / Resources

System admin
├── Admin accounts
└── System settings / Audit
```

## 3. Prototype screens

### Screen A - Catalogue + conversation của khách

**Mục tiêu:** giúp khách hiểu gói trước khi hỏi, và nhìn thấy câu hỏi của Linh trong context rõ ràng.

**Bố cục:**

- header: wordmark, Catalogue, Quy trình, Đăng nhập;
- hero: tiêu đề “Một buổi chụp, một hồ sơ rõ ràng”, CTA “Xem các gói”;
- package rail: ba gói với giá từ brief;
- process strip: Khám phá -> Chốt giờ -> Cọc để giữ lịch -> Nhận ảnh;
- conversation panel ở cuối flow, không floating trên nội dung;
- CTA chuyển vai trò: “Studio staff: mở cuộc hội thoại này” trỏ sang `admin.html`.

**Required state:** câu hỏi của Linh và phản hồi studio đã hiển thị.

### Screen B - Studio console sau khi khách đồng ý

**Mục tiêu:** admin thấy lý do xung đột, đề xuất đã được chấp nhận, và booking form đầy đủ.

**Bố cục:**

- sidebar: Inbox, Booking board, Resource map, Tasks;
- main: conversation + booking summary;
- side panel: Resource check, có text đầy đủ “Mai - Makeup”, “Tuấn - Photographer”, “Phòng B”;
- alert: “09:00 unavailable - Mai is busy 08:00-12:00”;
- form: package, shoot type, date, milestones, price, deposit, assignment;
- primary link: `Tạo booking` trỏ sang `booking.html`.

**Required state:** 14:00 được chọn, conversation `Đã chốt lịch`, nút tạo booking enabled.

### Screen C - Customer booking detail

**Mục tiêu:** customer biết mình cần đến lúc nào và bước tiếp theo là gì.

**Bố cục:**

- breadcrumb và booking code `GS-1024`;
- status banner `Đã thống nhất lịch · Chờ cọc 30%`;
- horizontal timeline: 13:00 makeup -> 14:00 shoot -> gallery -> delivery;
- appointment facts: ngày, phòng, assigned staff, package;
- payment card: total, deposit, balance;
- button `Thanh toán cọc 30%` disabled trong prototype, kèm ghi chú rõ “Tích hợp gateway ở bước backend”;
- lower section: “Điều gì xảy ra tiếp theo?”

## 4. Interaction rules

| UI action | Prototype behavior | Product behavior later |
| --- | --- | --- |
| Xem các gói | Anchor tới package rail | Client-side scroll |
| Studio staff: mở conversation | Link sang `admin.html` | Route bảo vệ role Admin/Staff |
| Tạo booking | Link sang `booking.html` | POST tạo booking waiting deposit |
| Thanh toán cọc | Disabled + note | Tạo checkout session |
| Gửi tin nhắn | Disabled + note | POST message, update conversation |
| Filter trạng thái | Static selected state | Query/filter server data |

## 5. Accessibility checklist

- contrast tối thiểu WCAG AA cho text và status;
- không dùng màu đơn độc để biểu diễn clash, luôn có icon và text;
- button/link có focus ring nhìn thấy;
- form labels nằm ngoài placeholder;
- mobile không dùng horizontal scroll cho main content;
- status có text đầy đủ, không chỉ badge màu;
- các preview illustration có `aria-hidden=true` hoặc alt mô tả đúng.

## 6. Prototype acceptance checklist

- [ ] Mỗi trang mở trực tiếp được và không phụ thuộc thao tác trước đó.
- [ ] Có một câu chuyện nhất quán về Linh, Thảo, Mai, Tuấn, Phòng B, GS-1024.
- [ ] Không dùng ảnh người thật chưa kiểm quyền.
- [ ] Không có nút demo như “Màn 1 / Màn 2 / Màn 3” hoặc “Đặt lại demo”.
- [ ] Các action chưa có trang đích là disabled và có ghi chú.
- [ ] Không có text bị cắt ở resource calendar hoặc booking form.
- [ ] Mobile 360 px không bị chat/panel che nội dung.

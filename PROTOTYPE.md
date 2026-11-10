# GradStudio · PA#2 Responsive Prototype

## Nhóm

| MSSV | Họ và tên |
|---|---|
| 24120218 | Nguyễn Đức Quân |
| 24120245 | Trần Lê Đức Việt |
| 24120486 | Trần Nhật Trường |

## Cách mở

Từ thư mục gốc, dùng Node.js 22.12+ và chạy:

```sh
npm ci
npx vite preview
```

Mở `http://localhost:4173/#/` với JavaScript bật. Thư mục `dist/` đã chứa bản build cuối. Nếu chỉ xem bản này, có thể phục vụ thư mục `dist/` bằng một máy chủ tệp tĩnh. Ví dụ:

```sh
python3 -m http.server 4173 --directory dist
```

Chỉ bước cài phụ thuộc cần registry hoặc cache npm tương ứng. Bản build chạy từ máy chủ cục bộ khi chặn mạng ngoài. Sau khi sửa mã nguồn, chạy `npm run build` trước khi preview, chụp ảnh và kiểm định lại.

## Ba màn hình

| Route | Màn trong đề | Công việc | Liên kết trong trang |
|---|---|---|---|
| `/#/` | Services & Chat · Customer | Linh xem ba dịch vụ và trao đổi về lịch 09:00. | Logo → `/#/`. “Admin studio · Mở hội thoại của Linh” → `/#/advice`. |
| `/#/advice` | Advice & Clash Handling · Admin | Thảo xem trùng lịch 09:00, lời đồng ý của Linh, đề xuất 14:00 đã chọn và thông tin Booking mới. | Logo → `/#/`. “Tạo booking” → `/#/review`, nơi Linh tiếp tục xem lịch. |
| `/#/review` | Appointment Review & Deposit · Customer | Linh xem ngày 24/10, hai mốc đã chốt và số tiền chờ cọc của GS-1024. | Logo → `/#/`. |

## Lựa chọn thiết kế

- Hero dùng SVG tự vẽ. Dịch vụ và hội thoại dùng chữ, không cần ảnh người thật hay tài nguyên bên ngoài.
- Đặt chat vào luồng trang để tránh che nội dung. Màn Admin dùng hàng lịch có chữ đầy đủ, lý do trùng rõ ràng và nhãn “14:00 đã chọn”. Booking mới trình bày các giá trị điền sẵn dưới chat để đọc được trên điện thoại.
- Lịch tuần và timeline thể hiện riêng giờ yêu cầu cũ và hai mốc đã thống nhất. Booking chờ cọc chỉ giữ lịch sau cọc thành công và kiểm tra lại tài nguyên.
- Hai liên kết chính ghi rõ bước chuyển vai. Mỗi màn lấy dữ liệu từ cùng một mô-đun, nên truy cập trực tiếp vẫn thấy trạng thái đầy đủ.

## Thao tác để lại cho mốc sau

“Gửi tin nhắn” trên hai màn đầu và “Thanh toán cọc 30%” trên màn cuối là nút bị vô hiệu hóa có ghi chú hiển thị. Lựa chọn đề xuất và mục hội thoại khác chỉ là thông tin của ảnh chụp trạng thái. “Tạo booking” mở bản xem trước của khách qua liên kết HTML.

## CSS

CSS thuần, mobile-first, font hệ thống. Token khoảng cách là 4, 8, 12, 16, 24, 32, 48 và 64px. Hai breakpoint là `48rem` và `64rem`. Các cột dùng kích thước co giãn và nội dung dài được xuống dòng. CSS dùng màu trạng thái kèm chữ, focus rõ và vùng bấm độc lập tối thiểu 44px.

## Kiểm chứng

- [Kết quả Chromium](checks/production-qa.txt) từ `npx vite preview`, JavaScript bật, chặn request ngoài loopback. Mỗi route được mở trực tiếp ở 360, 768 và 1280 px. Đã kiểm tra kích thước viewport, tràn/cắt, vùng bấm, nội dung, cây accessibility, bàn phím, tương phản và điều hướng.
- [Ảnh chụp toàn trang](screenshots/) lấy từ bản build cuối. Tên ảnh theo route `index`, `advice` hoặc `review` và chiều rộng.
- [Nu · index](checks/validator-index.txt), [Nu · advice](checks/validator-advice.txt), [Nu · review](checks/validator-review.txt). Đầu vào cho từng kiểm định là `<!DOCTYPE html>` và `document.documentElement.outerHTML` sau khi React render route. Kết quả được tạo bằng Nu HTML Checker 26.11.9 chạy cục bộ. Endpoint W3C trực tuyến trả HTTP 403 cho lần đối chiếu.

# Quy tắc phát triển PA#2

## Công nghệ và phạm vi

- React + Vite, JavaScript (JSX), CSS thuần. Dùng liên kết `<a href>` và các hash route `/#/`, `/#/advice`, `/#/review`.
- Ba màn hình sử dụng dữ liệu mẫu chung từ mục 3 và 5 của đề GradStudio. Mỗi route phải mở trực tiếp ở đúng trạng thái.
- Giao diện mobile-first. Breakpoint `48rem` và `64rem`. Dùng token khoảng cách 4, 8, 12, 16, 24, 32, 48, 64px. Kích thước nội dung co giãn.
- Dùng landmark, một `h1` mỗi route, cấp tiêu đề liên tục, label hiển thị gắn với input, alt cho ảnh, focus rõ và chữ tối thiểu 16px. Chữ và nút đạt 4,5:1. Nút và liên kết độc lập cao ít nhất 44px trên điện thoại.

## Những điều phải tránh

- Không thêm framework CSS, router dependency, backend, database, cổng thanh toán, font hoặc tài nguyên CDN.
- Không dùng cột nội dung rộng cố định, `!important`, `overflow-x: hidden` để che lỗi, chat nổi đè nội dung, hoặc màu làm tín hiệu duy nhất.
- Không dùng ảnh nhận diện được người thật chưa có quyền, liên kết rỗng, điều khiển demo hay nút điều hướng bằng JavaScript. Thao tác chưa hỗ trợ phải dùng nút bị vô hiệu hóa kèm ghi chú.
- Không đổi dữ kiện nghiệp vụ, gộp cả ba màn vào một commit, viết lại lịch sử hoặc push remote. Không lưu thông tin đăng nhập và không ghi kết quả kiểm thử chưa chạy.

## Xác minh

Build bằng `npm run build` và chạy `npx vite preview`. Mở trực tiếp ba route tại 360, 768 và 1280px khi JavaScript bật và mạng ngoài bị chặn. Kiểm tra luồng, overflow, khả năng tiếp cận trong DevTools, vùng bấm và tương phản. Kiểm tra từng HTML đã render bằng Nu HTML Checker. Lưu ảnh toàn trang trong `screenshots/`, kết quả validator trong `checks/` và nộp kèm `dist/`.

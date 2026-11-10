# AI log — PA#2

## 2026-11-11 — Phân tích yêu cầu
Công cụ: Codex.
Yêu cầu: Đọc brief và rubric, xác định repository nhóm, lập ma trận truy vết và phương án triển khai.
Giữ: Repository nhóm, bộ dữ kiện Linh và danh sách Fix these.
Thay đổi: Kiến trúc đề xuất ban đầu là HTML tĩnh. Nhóm chốt React + Vite trong yêu cầu triển khai.
Loại: Dùng repository tham khảo làm nơi nộp. Git remote và README cho thấy đó là checkout riêng.

## 2026-11-11 — Nền tảng
Công cụ: Codex.
Yêu cầu: Tạo Vite/JSX, hash routing, design tokens và mock data dùng chung.
Giữ: CSS thuần, hash route dùng liên kết HTML và dữ liệu mẫu từ đề bài.
Thay đổi: Lần cài thử với `npm install --offline` báo ENOTCACHED dù cache có tarball. Cài các phiên bản đã ghim từ registry trong checkout tạm rồi chạy `npm run build` thành công. Build chạy độc lập sau khi có dependency.
Loại: Phụ thuộc router riêng vì ba route chỉ cần liên kết hash và sự kiện hashchange.

## 2026-11-11 — Màn 1, dịch vụ và chat
Công cụ: Codex.
Yêu cầu: Hiển thị ba dịch vụ, câu hỏi 09:00 và phản hồi studio, rồi chuyển vai Admin qua liên kết thật.
Giữ: Ba mức giá từ đề bài, minh họa SVG tự vẽ và chat trong luồng trang.
Thay đổi: Tách giá tham khảo của dịch vụ Tốt nghiệp khỏi giá gói Premium. Đổi copy giữ lịch để có bước kiểm tra lại tài nguyên.
Loại: Chat nổi và shortcut dạng hash rỗng. Chromium qua bản Vite Preview ở 360, 768, 1280px kiểm tra nội dung, link, label, focus và kích thước vùng bấm. Tương phản chữ thấp nhất đo được là 6,25:1.

## 2026-11-11 — Màn 2, tư vấn và xử lý trùng lịch
Công cụ: Codex.
Yêu cầu: Hiển thị cảnh Linh đã đồng ý, lịch tài nguyên và Booking mới với liên kết Tạo booking.
Giữ: Nội dung hỏi, đề xuất và đồng ý từ dữ liệu chung. Hiển thị rõ 09:00 trùng lịch và 14:00 đã chọn.
Thay đổi: Thay các label không gắn với input trong bản HTML cũ bằng danh sách mô tả cho phần đặt lịch điền sẵn. Dùng cuộn trang cho cả chat và Booking mới.
Loại: Các tab điều phối chưa có đích và khung cuộn riêng của chat. Chromium qua bản production đạt các kiểm tra ở 360, 768, 1280px. Nu HTML Checker kiểm tra HTML đã render của Màn 1 và Màn 2 với 0 lỗi.

## 2026-11-11 — Màn 3, xem lịch hẹn và đặt cọc
Công cụ: Codex.
Yêu cầu: Đánh dấu 24/10 trong lịch tuần, gạch giờ cũ và cho Linh xem lịch mới cùng số tiền cọc.
Giữ: Mã GS-1024, giờ make-up/chụp và số tiền tính từ cùng dữ liệu với hai màn trước.
Thay đổi: Đánh dấu ngày bằng cả chữ và trạng thái aria-current. Hiển thị 09:00 bằng thẻ del và giải thích đó là giờ yêu cầu ban đầu.
Loại: Nút xác nhận giờ lần hai và thanh toán giả lập. Chromium qua bản production đạt các kiểm tra ở 360, 768, 1280px. Nu HTML Checker kiểm tra HTML đã render với 0 lỗi.

## 2026-11-11 — QA responsive và accessibility
Công cụ: Codex và Chromium qua Playwright.
Yêu cầu: Rà lại ảnh và cây accessibility trên bản production rồi sửa vấn đề phát hiện được.
Giữ: Cả ba route đều mở độc lập. Hai liên kết chính và nút Back hoạt động trong kiểm thử.
Thay đổi: CSS ban đầu làm ba nhãn trạng thái một dòng cao 49, 33, 49px ở 768px. Phép đo trên ảnh/tablet xác nhận lỗi căn hàng. Đặt align-content ở đầu cho các thẻ và đo lại 33, 33, 33px. Cây accessibility trước đó chỉ có T7 và 24. Thêm tên ngày đầy đủ, kiểm tra lại cây đọc được “Thứ Bảy, 24 tháng 10, 2026”.
Loại: Dùng HTML rỗng của Vite làm đầu vào kiểm định. Cả ba kết quả Nu lấy từ outerHTML sau khi React render từng route, thêm doctype. 9 lượt Chromium cuối không gửi request ngoài loopback. Xem checks/production-qa.txt.

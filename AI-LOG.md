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

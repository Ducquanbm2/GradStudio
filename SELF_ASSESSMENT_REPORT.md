# Tự đánh giá — PA#2

- 24120218 — Nguyễn Đức Quân
- 24120245 — Trần Lê Đức Việt
- 24120486 — Trần Nhật Trường

**Tổng tự đánh giá 98 / 100**

| Tiêu chí | Tối đa | Tự chấm | Bằng chứng |
|---|---:|---:|---|
| Ba màn liên kết theo brief | 20 | 20 | Bảng route trong [PROTOTYPE.md](PROTOTYPE.md), dữ liệu chung trong [src/data.js](src/data.js) và lượt chạy xuyên luồng trong [production-qa.txt](checks/production-qa.txt). |
| Responsive ở 360, 768 và 1280 px | 25 | 25 | Chín [ảnh toàn trang](screenshots/) và kiểm tra chiều rộng, tràn, cắt, vùng bấm trong [production-qa.txt](checks/production-qa.txt). |
| HTML ngữ nghĩa và hợp lệ | 20 | 19 | Ba kết quả Nu HTML Checker chạy cục bộ có 0 lỗi ([index](checks/validator-index.txt), [advice](checks/validator-advice.txt), [review](checks/validator-review.txt)). Kiểm tra nhãn, heading, landmark, focus và tên ngày trong [production-qa.txt](checks/production-qa.txt). |
| Hệ thống thiết kế | 10 | 9 | Token và breakpoint trong [styles.css](src/styles.css), kết quả đo chữ tối thiểu 16px và tỷ lệ tương phản thấp nhất 6,25:1 trong [production-qa.txt](checks/production-qa.txt). |
| Brief và tệp quy tắc | 10 | 10 | [brief.md](brief.md) ghi prompt thật và [AGENTS.md](AGENTS.md) ghi quy tắc, ràng buộc và kiểm chứng. |
| AI log | 10 | 10 | [AI-LOG.md](AI-LOG.md) có mục riêng cho phân tích, nền tảng, ba màn, QA và tài liệu. Mục QA ghi lỗi nhãn trạng thái ở 768px, tên ngày trong cây accessibility và bản sửa `5885bab`. |
| Lịch sử commit | 5 | 5 | `2d26c17` thêm quy tắc và nền tảng. `861c2c4`, `0a703b2` và `65cf185` triển khai ba màn riêng. `5885bab` sửa responsive và accessibility. |

## Phần chưa làm được

Kiểm thử khả năng tiếp cận đã dùng cây accessibility và bàn phím Chromium. Chưa chạy trình đọc màn hình riêng. Trên điện thoại, màn Admin ưu tiên đọc đầy đủ danh sách, chat và Booking mới, nên cần cuộn nhiều hơn để đến lịch tài nguyên.

## Lần sau

Kiểm tra độ cao nhãn trên tablet và cách lịch tuần được công bố trong cây accessibility ngay khi phát triển từng màn.

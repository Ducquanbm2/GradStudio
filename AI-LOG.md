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

## 2026-11-11 — Hồ sơ nộp
Công cụ: Codex.
Yêu cầu: Lưu prompt thật, hồ sơ nhóm, ảnh, kiểm định, bản build và tự đánh giá.
Giữ: Ba kết quả Nu cục bộ, chín ảnh từ Chromium và phần chưa kiểm thử trong báo cáo tự đánh giá.
Thay đổi: Ghi rõ nguồn kết quả kiểm định vì endpoint trực tuyến trả 403. Chạy lại npm ci --offline và npm run build ở thư mục sạch, so sánh dist trùng từng byte.
Loại: Dùng ảnh hoặc kết quả từ build trước khi sửa QA.

## 2026-11-11 — Redesign trắng và xanh dương
Công cụ: Codex, ImageGen tích hợp, Chromium qua Playwright và Nu HTML Checker.
Yêu cầu: Tạo nhận diện riêng cho ba màn PA#2 theo hướng studio hiện đại, tối giản với nền trắng và xanh dương.
Giữ: Ba hash route và luồng chuyển vai bằng liên kết HTML. Đối chiếu dữ liệu, tên trạng thái và số tiền với fixture GS-1024. Mở trực tiếp từng màn để kiểm tra lại.
Thay đổi: Lượt đo đầu ở 360px phát hiện các hộp chữ của tiêu đề hero chồng theo chiều dọc. Tăng line-height và điều chỉnh cỡ chữ rồi đo lại. Ảnh chụp tiếp theo cho thấy nhãn khách hàng ở trang lịch hẹn xuống hàng tại 360px. Thu khoảng cách header và bổ sung phép đo kiểm tra hai mục cùng hàng.
Loại: Hero minh họa cũ, các hàng thẻ quy trình nằm riêng và bố cục Admin ba cột. Thay bằng ảnh WebP cục bộ, hướng dẫn cạnh chat, vùng tài nguyên cạnh khu xử lý booking và dải lịch tuần riêng. Ảnh và log trong thư mục kiểm thử lấy từ bản build sau khi sửa.

### Prompt ảnh hero

> Use case: photorealistic-natural. Asset type: editorial hero photograph for a premium Vietnamese graduation photography studio website with a white and fresh blue visual identity. Create a landscape 3:2 photograph of a minimalist daylight photography set. A rich cobalt-blue graduation cap with a fine blue tassel rests on a clean ivory plinth next to a simple tied white diploma, set against a pale powder-blue cyclorama. A sliver of a silver light stand at the edge quietly suggests the studio. Bright white side light with one softly defined diagonal architectural shadow, real fabric and matte materials, gallery-like art direction and generous breathing room. Place the main objects in the central area so a tighter crop still shows both. No people, faces, logos, lettering, watermarks, UI or frames.

## PA#3

### 2026-11-26 — Update AGENTS.md for PA#3
Tool: Antigravity.
Request: Rewrite `AGENTS.md` for PA#3 adhering to the `BrowserRouter` + Tailwind CSS + `react-hook-form` stack, enforce API contract and mock rules, and incorporate the automated `AI-LOG.md` protocol.
Kept: Responsive requirements (`360px`, `768px`, `1280px`), semantic/accessibility standards, GradStudio business fixtures (`GS-1024`), and Git history preservation principles from PA#2.
Changed: Updated stack to React + Vite inside `client/`, `BrowserRouter`, Tailwind CSS, and `react-hook-form`; added mandatory contract (`docs/api/`) and mock (`mock/server.mjs`, 4 `MOCK_MODE` modes) rules, Auth Context, data state handling (`loading`/`error`/`empty`), and automated logging requirement under `## PA#3`. Cross-checked against `docs/PA#3/PA3-rubric-react-front-end.pdf` (criteria 5, 6, 7, 8, 9).
Rejected: Obsolete PA#2 constraints (prohibiting router libraries and CSS frameworks, restricting to 3 static hash routes, and hard-coding fixture data into components).

### 2026-11-26 — Translate AGENTS.md and PA#3 logs to English
Tool: Antigravity.
Request: Translate `AGENTS.md` and the PA#3 logging entries in `AI-LOG.md` into English.
Kept: All technical specifications, stack definitions, rubric criteria references, and existing PA#2 log entries above.
Changed: Translated all sections of `AGENTS.md` into English (technology stack, contract/mock compliance, UI/accessibility rules, never list, logging protocol, and verification workflow); updated the template labels in `AI-LOG.md` under `## PA#3` to standard English fields (`Tool`, `Request`, `Kept`, `Changed`, `Rejected`).
Rejected: None. Verified via `git status` that only `AGENTS.md` and `AI-LOG.md` were modified.

### 2026-11-27 — Task T02: Install react-router-dom and configure Vite proxy
Tool: Antigravity.
Request: Execute task T02: install `react-router-dom` in `client/package.json` and configure `client/vite.config.js` to forward relative `/api` calls to `http://localhost:3001` in both `server.proxy` and `preview.proxy`.
Kept: Existing JSX configuration (`esbuild: { jsx: 'automatic' }`), React 19 dependencies, build scripts, and production build compatibility in `client/`.
Changed: Added `react-router-dom` (^7.18.7) to `client/package.json` via `npm install`; updated `client/vite.config.js` to configure `server.proxy` and `preview.proxy` mapping `/api` to `http://localhost:3001` with `changeOrigin: true`; removed legacy `base: './'` for full `BrowserRouter` root-path compatibility. Rebuilt production bundle via `npm run build` in `client/dist/`. Verified proxy functionality on both dev (`npm run dev`) and preview (`npx vite preview`) servers with an active mock endpoint on port 3001 returning HTTP 200; checked `git diff -- docs/api mock` (clean, 0 changes).
Rejected: Hardcoding backend URLs inside frontend code or relying solely on dev proxy without preview proxy.

# Prompt 1

You are a senior frontend engineer and software quality engineer working on a university Web Application Development assignment.

## Context

I am implementing **PA#2 — Responsive Prototype** for the GradStudio project.

The VS Code workspace contains existing project directories and a `PA#2` directory containing assignment materials, including:

- `GradStudio-final-project-brief.pdf`
- `PA2-rubric-responsive-prototype.pdf` (or the equivalent rubric file)
- `AI-LOG-template.md`
- `SELF_ASSESSMENT_REPORT` template

Your first task is **requirements analysis and repository inspection only**. Do not implement anything yet.

## Step 1 — Inspect the repository

1. Inspect the current directory structure.
2. Identify the actual team Git repository and its root.
3. Inspect existing source files, frameworks, dependencies, Git history, and project documentation.
4. Locate and read the GradStudio project brief and PA#2 rubric in full.
5. If necessary, extract PDF text using locally available tools.
6. Preserve all existing project files and Git history.

Do not assume that the VS Code workspace root is the submission repository root.

## Step 2 — Extract requirements

Identify the exact requirements for the three GradStudio screens:

1. Services and chat
2. Advice and clash handling
3. Appointment review and deposit

For each screen, produce a requirements table containing:

- Required feature
- User interaction
- Expected visual component
- Related navigation
- Relevant section of the original brief
- Acceptance criteria

Extract the complete **"Fix these"** list from the original GradStudio brief and explain how the prototype must avoid each issue.

Do not invent requirements or silently omit unclear requirements.

## Step 3 — Analyze the rubric

Explain how we can meet the highest scoring band for all seven criteria:

- Three linked screens: 20 points
- Responsive: 25 points
- Semantic HTML: 20 points
- Design system: 10 points
- Brief and rules: 10 points
- AI log: 10 points
- Commit history: 5 points

Identify critical failure conditions.

## Step 4 — Propose implementation

Recommend the lowest-risk implementation approach, prioritizing the rubric.

Prefer static HTML and plain CSS if the repository has no established frontend implementation. Preserve an existing React implementation if it is already appropriate.

Propose:

- File structure
- Screen-to-file mapping
- Navigation flow
- Component and section structure
- Responsive layout strategy
- Design tokens and spacing scale
- Accessibility requirements
- Verification strategy
- Git commit plan

## Output

Provide:

1. Repository assessment
2. Requirements traceability matrix
3. Complete "Fix these" checklist
4. Proposed architecture
5. Implementation plan
6. Rubric acceptance checklist
7. Ambiguities and missing information

**Important:** Do not modify files, install dependencies, or commit changes in this phase. Do not begin coding until the analysis is complete.

# Yêu cầu ngôn ngữ

Nói tiếng Việt

# Prompt 2

Hãy bắt đầu triển khai PA#2 — GradStudio Responsive Prototype dựa trên kết quả phân tích ở Prompt trước và hai tài liệu PDF gốc.

### 1. Công nghệ bắt buộc

- React + Vite + JavaScript (JSX).
- CSS thuần, mobile-first, sử dụng design tokens.
- Hash routing: `/#/`, `/#/advice`, `/#/review`.
- Mock data dùng chung cho ba màn hình.
- Không backend, database, payment gateway thật hoặc dependency không cần thiết.
- Build phải chạy offline và nộp kèm `dist/`.

### 2. Phạm vi

Triển khai đúng ba màn hình:

1. Services & Chat — Customer.
2. Advice & Clash Handling — Admin.
3. Appointment Review & Deposit — Customer.

Sử dụng đầy đủ yêu cầu và dữ liệu mẫu trong `GradStudio-final-project-brief.pdf`.

Tuân thủ toàn bộ danh sách "Fix these" và rubric PA#2. Không tự ý bỏ qua tính năng hoặc mở rộng scope.

### 3. Quy trình thực hiện

Thực hiện tuần tự theo từng milestone:

1. **Foundation:** Thiết lập React/Vite, routing, design system, mock data và `AGENTS.md`.
2. **Screen 1:** Implement → Test → Fix → Commit.
3. **Screen 2:** Implement → Test → Fix → Commit.
4. **Screen 3:** Implement → Test → Fix → Commit.
5. **QA:** Responsive, accessibility, W3C validation, production build và offline testing.
6. **Documentation:** Hoàn thiện tài liệu, screenshots, evidence và self-assessment.

Không gộp cả ba màn hình vào một commit.

### 4. Git History

Repository hiện đã có hai commit setup project, không thuộc PA#2.

- Giữ nguyên hai commit cũ.
- Không reset, rebase hoặc rewrite history.
- Commit đầu tiên của PA#2 phải chứa `AGENTS.md` và các quy tắc phát triển.
- Mỗi màn hình có commit riêng.
- Có commit riêng cho responsive/accessibility khi có thay đổi thực tế.
- Commit message rõ ràng và đúng nội dung.
- Không tự push remote.
- Không tạo commit giả.

### 5. Quality Gates

Mỗi màn hình phải đáp ứng:

- Đúng requirements và không vi phạm "Fix these".
- Navigation bằng thẻ `<a href>` thực sự.
- Từng route mở trực tiếp được, không phụ thuộc state trang trước.
- Responsive tại 360px, 768px, 1280px.
- Không overflow, clipping hoặc overlapping.
- Tap targets tối thiểu 44px trên mobile.
- Semantic HTML, một `h1` mỗi trang, input có label.
- Body text tối thiểu 16px, contrast ít nhất 4.5:1.
- W3C Validator: 0 errors.

Với React, phải kiểm thử production build bằng `npm run build` và `npx vite preview`, JavaScript bật, mạng ngoài bị chặn.

Không validate mỗi `dist/index.html`; phải validate HTML đã render của từng route.

Chỉ báo PASS khi đã thực sự kiểm thử.

### 6. Documentation & Evidence

Trong repository root phải có:

- `AGENTS.md`
- `brief.md`
- `PROTOTYPE.md`
- `AI-LOG.md`
- `SELF_ASSESSMENT_REPORT.md`

Lưu prompt thực tế vào `brief.md`, không tự dựng lại prompt thiếu.

Ghi nhận quá trình sử dụng AI và lỗi sửa thực tế vào `AI-LOG.md`, đối chiếu được với Git history.

Tạo 9 full-page screenshots (3 trang × 3 viewport) trong `screenshots/` và 3 kết quả W3C trong `checks/`.

Không tạo evidence giả.

### 7. Quy tắc thực thi

- Sử dụng kết quả Prompt 1, không phân tích lại từ đầu nếu không cần.
- Làm việc theo vòng lặp Implement → Test → Review → Fix → Verify → Commit.
- Bảo toàn code và Git history hiện có.
- Không tự thay đổi những file ngoài phạm vi PA#2.
- Sau mỗi milestone, báo cáo ngắn gọn các thay đổi, test result và commit hash.
- Nếu không có công cụ browser testing, báo cáo rõ phần chưa kiểm thử được.
- Ưu tiên hoàn thành sản phẩm theo rubric hơn giao diện cầu kỳ.

**Hãy bắt đầu triển khai ngay, không cần hỏi lại các quyết định đã được xác định.**

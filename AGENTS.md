# PA#3 Development Guidelines — GradStudio

## 1. Technology Stack and Project Structure

- **Frontend (`client/`):** React + Vite (JavaScript/JSX).
- **Routing:** `react-router-dom` using `BrowserRouter`. Every route specified in `FRONTEND.md` must open directly and survive browser reloads without breaking; unknown paths render a Not Found screen.
- **Styling:** Tailwind CSS (bundled locally into the build, no external CDN).
- **Forms:** `react-hook-form` for all main-flow forms (sign-in, chat messaging & booking requests, clash checks & booking creation, preview upload, photo selection, booking modifications / cancellations & photo delivery links, Admin accounts & system settings).
- **API Mock (`mock/`):** `mock/server.mjs` with seed data in `mock/data/`. Uses Node.js built-in modules only (`node:http`, `node:fs`...), running directly via `node mock/server.mjs` on port `PORT` (default `3001`), requiring no `npm install`. Fully supports all 4 `MOCK_MODE` modes: `normal`, `slow`, `error`, `empty`.
- **Proxy:** `client/vite.config.js` forwards `/api` to `http://localhost:3001` in both `server.proxy` and `preview.proxy`.
- **Contract (`docs/api/`):** `docs/api/README.md` and individual resource specification files (`docs/api/*.md`) serve as the single source of truth for all API requests and responses.

## 2. Rules for Contract, API, and State Management

- **Contract before code:** Every endpoint must be documented and committed in `docs/api/` (and implemented in `mock/`) before any front-end commit that calls it.
- **Strict contract compliance:** Call only endpoints declared in `docs/api/` using relative paths `/api/...` (never `http://localhost:3001/...`). If an endpoint or schema is missing or inconsistent, **stop immediately and notify the user** rather than guessing or modifying the contract/mock.
- **No hard-coded business data:** Packages, conversations, booking schedules, staff assignments, and preview/final delivery photos must all come from the API. Do not hard-code mock business data into components.
- **Three mandatory data states:** Every screen fetching API data must explicitly handle `loading`, `error` (with a **Retry** button that reloads data without reloading the page), and `empty` (a clear empty-state message, never a blank area). Do not issue duplicate requests while waiting.
- **Authentication and Authorization:** Store the signed-in user and token in a single Auth Context, accessed via a custom hook. Every request after sign-in must attach `Authorization: Bearer <token>`. Signing out completely clears all authentication state. Protected routes redirect unauthenticated users to the sign-in screen and return to the intended route upon sign-in; unauthorized roles are turned away.
- **In-place updates:** After completing actions (sending messages, creating bookings, processing payments, updating statuses), update the UI directly from the API response without reloading the page.
- **Standardized forms:** Every input must have an associated visible `<label>`. Validate fields client-side according to contract limits before submission; display inline error messages adjacent to each field (accessible via keyboard/Tab navigation); map API `400` field-level errors to the corresponding inputs; retain entered input values upon error; disable the submit button during in-flight requests to prevent duplicate submissions; validate preview file types and size limits prior to upload.

## 3. Interface, Accessibility, and Business Consistency

- **Mobile-first & Responsive:** Fully functional at `360px`, `768px`, and `1280px` without horizontal scroll, truncated content, or clipped form/calendar labels.
- **Semantics and Accessibility:** Use proper landmark elements (`header`, `nav`, `main`, `footer`), exactly one `<h1>` per screen, continuous heading hierarchy, descriptive `alt` text for images, clear focus indicators, minimum font size of `16px`, and at least 4.5:1 text/button contrast. Standalone buttons and links must have a minimum tap target height of `44px` at `360px`. Use `<Link>`/`<a href>` for navigation and `<button>` for actions.
- **Consistent Business Fixtures:** Strictly adhere to GradStudio fixtures (Linh, Admin Thảo, make-up artist Mai, photographer Tuấn, Studio Room B, booking `GS-1024`, `Gói Tốt nghiệp Premium`, `1.800.000đ`, 30% deposit `540.000đ`, remainder `1.260.000đ`) and exact status names from the brief's Fix these list.
- **Explanations in words, not color alone:** Clash checks must state in words whether a clash exists, why (e.g., Mai is busy 08:00–12:00, so 09:00 clashes), and suggest alternative available time slots. Never promise to hold a slot before the 30% deposit is successfully paid.
- **Disabled buttons:** Disable buttons only when required by the business flow itself (e.g., `Tạo booking` before customer agreement), and always display the reason on screen.

## 4. Strict Prohibitions (Never List)

- **Do NOT** edit `docs/api/` or `mock/` to accommodate front-end code. Any modification to `docs/api/` or `mock/` after front-end integration requires user approval and a documented entry in `## Changes` (date, change description, reason).
- **Do NOT** add other JavaScript frameworks (Next.js, Remix, etc.), **do NOT** install new dependencies without prior approval and documentation in `FRONTEND.md`, and **do NOT** load fonts or assets from external CDNs.
- **Do NOT** create demo links or buttons to quickly switch roles (switching roles requires signing out and signing in with the respective demo account).
- **Do NOT** use identifiable photos of real people without permission, **do NOT** use floating chat widgets that obscure content at `360px`, **do NOT** use `!important` or `overflow-x: hidden` to mask layout overflow, and **do NOT** create dead links or non-functional controls.
- **Do NOT** alter business test facts, **do NOT** squash multiple major milestones into a single commit, **do NOT** rewrite Git history, **do NOT** push to remote repositories unless explicitly instructed, **do NOT** commit real credentials or personal information, and **do NOT** report unverified test results.

## 5. Protocol for Automatic Updates to `AI-LOG.md`

After completing every code or documentation task, the AI assistant **must automatically update `AI-LOG.md`**:

- Retain all existing **PA#2** log entries above untouched.
- Append new entries under the `## PA#3` heading.
- Record entries using the standard template:

```markdown
### YYYY-MM-DD — <Short Task Name>
Tool: <AI Tool Name>
Request: <Summary of prompt/instruction>
Kept: <Items satisfying requirements that were retained>
Changed: <Modifications made; if an error occurred, describe the fault, which verification step caught it (e.g., MOCK_MODE, mock log, direct route access, git diff -- docs/api mock, viewport widths 360/768/1280px) and how it was fixed; if no error, state the verification checks executed>
Rejected: <Approaches, code, or ideas discarded and reasons, or explicit statement of none discarded with checks performed>
```

- Avoid vague descriptions (e.g., "fixed API calls"); entries must be sufficiently specific to correspond with Git commits.

## 6. Commit and Verification Workflow

- Commit prior to issuing major assistant tasks so each AI modification yields a clean, isolated diff. Always review `git diff -- docs/api mock` after every assistant code modification.
- Run contract validation tests against a freshly started mock:
  - Terminal 1: `node mock/server.mjs`
  - Terminal 2: `node docs/PA#3/contract-check.mjs --base http://localhost:3001` (or `tools/contract-check.mjs`).
- In `client/`, run `npm run build` and `npx vite preview`. Open all routes declared in `FRONTEND.md` directly at `360px`, `768px`, and `1280px` with JavaScript enabled and external network blocked.
- Verify complete flows G1–G11 across all 4 roles and all 4 `MOCK_MODE` modes (`normal`, `slow`, `error`, `empty`).
- Verify rendered HTML (captured from DevTools post React mount) using W3C / Nu HTML Checker with 0 errors.
- Ensure `client/dist/` is rebuilt following the final change and all `node_modules/` directories are excluded when packaging the final submission.

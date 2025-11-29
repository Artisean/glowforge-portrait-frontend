# AGENTS – Frontend Wizard (`glowforge-portrait-frontend`)

This file defines how AI assistants (ChatGPT, Codex, etc.) must behave when working in this frontend repo.

- Project-level rules live in the main `AGENTS.md` file and ADRs.
- This repo-level file **extends** those rules for the Vite React/TypeScript wizard.
- If there is a conflict, the project-level docs win and this file should be updated.

---

## 1. Repo scope & responsibilities

This repo implements the **desktop-first Vite React/TS wizard** for preparing portrait photos for laser engraving on wood.

Responsibilities:

- Implement the multi-step pipeline UI (current implementation uses seven technical steps):

  - Upload & Prep
  - Crop
  - Black & White
  - Dodge & Burn
  - Levels & Curves
  - Halftone
  - Export

- Manage client-side state:

  - Wizard navigation and current step.
  - Image state (original and working versions).
  - AI analysis state (shared `AiAnalysisResult` from the backend).

- Render AI hints and engraving summaries as **advisory guidance**, not promises.

Non-responsibilities:

- No direct AI provider calls from the browser.
- No changes to backend contracts or HTTP endpoints.
- No long-term storage of user images beyond normal browser behavior.

---

## 2. AI interaction & env invariants

### 2.1 Single backend client

All calls to the AI gateway must go through the **single client abstraction**:

- `src/lib/api.ts`:

  - Reads `import.meta.env.VITE_API_BASE_URL`.
  - Calls `POST {VITE_API_BASE_URL}/api/ai-analyze-photo`.
  - Returns the `{ success, analysis?, error? }` envelope.

- `src/hooks/useAiAnalysis.ts`:

  - Wraps `aiAnalyzePhoto`.
  - Manages loading, result, and error state for UI components.

Rules:

- Components and hooks must **not** call `fetch` or `axios` directly to `/api/ai-analyze-photo`.
- Do not hard-code backend URLs in components; always go through `api.ts`.

### 2.2 Environment variables

- `VITE_API_BASE_URL` is the only env var this repo should need for the AI gateway.

Examples:

- Local backend via `vercel dev`:

  - `VITE_API_BASE_URL=http://localhost:3000`

- Deployed backend:

  - `VITE_API_BASE_URL=https://<backend-app>.vercel.app`

Rules:

- Do not rename `VITE_API_BASE_URL` without a Strategy-level decision and repo-wide update.
- Keep `.env`, `.env.local`, and other env files out of version control; use `.env.example` for documentation.

### 2.3 `AiAnalysisResult` usage

The frontend consumes `AiAnalysisResult` as **read-only hints**:

- Required/core fields:

  - `faces`, `backgroundMask`, `globalAdjustments`, `notes[]`.

- Optional engraving-aware fields:

  - `halftone`
  - `highlightWarning`
  - `shadowWarning`
  - `dotGainRisk`
  - `recommendedEngraveSettings`

Rules:

- Always check for field existence before use.
- Render sensible “not available yet” states when optional fields are missing.
- Never assume the backend has filled every engraving-aware field.

---

## 3. Logging and privacy (frontend)

- Do not log full `imageDataUrl` values to the browser console in normal operation.
- When debugging:

  - Prefer logging small, non-sensitive metadata (dimensions, mime type).
  - Remove or guard any logs that show raw base64 data before committing.

- Do not send more data to the backend than necessary:

  - Only include `imageDataUrl` and `options` in the AI request payload.
  - Do not inadvertently bundle other application state into the request.

---

## 4. Codex bootstrap ritual (frontend)

For any new Codex session attached to this repo, the **first message** must:

1. Paste or reference `CODEX-BOOTSTRAP.md` from this repo, which encodes the concrete bootstrap text.
2. Instruct Codex to:

   - Read project-level `AGENTS.md`.
   - Read this repo `AGENTS.md`.
   - Read this repo’s `CODEX-BOOTSTRAP.md`.
   - Skim key Strategy docs and ADRs referenced in `CODEX-BOOTSTRAP.md`.

3. Ask Codex to summarize:

   - What this repo is for.
   - How it talks to the backend (via `api.ts` and `useAiAnalysis`).
   - Which contracts and env vars must not be broken.
   - What counts as green, amber, and red work here.

4. Explicitly confirm that in the **bootstrap response** Codex will:

   - Make no edits.
   - Not add or remove dependencies.
   - Not reformat unrelated files.

Only after that bootstrap step may Codex propose or apply code changes.

---

## 5. Codex green / amber / red zones (frontend)

These examples specialize the project-level zones for the wizard UI.

### 5.1 Green zone – safe frontend work

Codex may operate in the green zone without extra Strategy involvement, as long as diffs are small and well-explained.

Green examples:

- Step-level UI and behavior:

  - Adding or tweaking controls within a single step (e.g., Black & White sliders).
  - Wiring `useAiAnalysis` into an individual step that already expects AI hints.
  - Improving loading/error states around AI calls.

- Layout and components:

  - Refining `StepShell`, `StepHeader`, or other presentational components without changing step responsibilities.
  - Extracting small reusable components (buttons, panels) from existing JSX.

- Helpers and types:

  - Adding pure formatting helpers that interpret `AiAnalysisResult` fields for display.
  - Tightening TypeScript types in `src/lib/api.ts` or UI components without changing runtime behavior.

Green-zone constraints:

- Do not bypass `api.ts` or `useAiAnalysis`.
- Do not change env var names or backend URLs.
- Do not change the HTTP envelope or `AiAnalysisResult` field names.

### 5.2 Amber zone – allowed with Strategy visibility

Amber work is allowed but must be treated as higher risk; Codex should clearly label it as amber and trigger a QC2 handoff.

Amber examples:

- Structural refactors:

  - Reorganizing step components (e.g., merging/splitting steps).
  - Introducing new shared layout structures that affect multiple steps.

- Expanding AI usage:

  - Surfacing new `AiAnalysisResult` fields across multiple steps (e.g., adding new hint panels or badges).
  - Changing how warnings and recommendations are visually presented.

- Theming and styling sweeps:

  - Large layout or design changes that touch many files but keep behavior logically the same.

Amber-zone requirements:

- Clearly state that the work is amber in the Codex session.
- Keep changes reviewable in a single PR.
- Produce a QC2-style summary describing:

  - What changed.
  - Which parts of `AiAnalysisResult` or env usage are affected.
  - Any suggested Strategy/ADR updates.

If in doubt between green and amber, default to **amber** and summarize back to Strategy.

### 5.3 Red zone – forbidden for Codex

Red-zone changes are off-limits for Codex unless Strategy/ADRs explicitly say otherwise and a human is supervising.

Frontend red examples:

- HTTP and env contracts:

  - Hard-coding backend URLs instead of using `VITE_API_BASE_URL`.
  - Renaming `VITE_API_BASE_URL`.
  - Adding new AI endpoints or calling providers directly from the browser.

- Domain contract:

  - Renaming or removing `AiAnalysisResult` fields.
  - Changing the semantics of engraving-aware fields.

- Architecture & guardrails:

  - Introducing new global state management frameworks without Strategy approval.
  - Editing project-level markdown files (`01–07`, project-level `AGENTS.md`) from this repo.
  - Editing backend code from this repo.

- Privacy:

  - Adding persistent client-side storage (e.g., IndexedDB) for images or analysis without Strategy approval.
  - Logging raw `imageDataUrl` or large base64 payloads in production paths.

When Codex encounters a red-zone request, it should:

- Explain why it is red.
- Suggest a Strategy-lane discussion and, if needed, a formal ADR.
- Outline a human-driven implementation path instead of making the change itself.

---

## 6. Git and workflow expectations (frontend)

- Use small, focused commits with clear messages (e.g., `feat: wire AI hints into Black & White step`).
- Avoid force pushes to `main`.
- Stage only the files related to the current task.
- Follow the dev loop documented in project and repo docs:

  - Edit locally.
  - Run `npm run dev` and smoke-test changes.
  - Commit and push.
  - For production behavior, rely on Vercel deploys and verify the deployed URL.

---

## 7. Precedence and conflicts

If anything in this file conflicts with:

- Project-level `AGENTS.md`
- Architecture decisions (`03-architecture-decisions.md`)
- The AI gateway contract and `AiAnalysisResult` definition

then:

1. Assume the project-level docs are correct.
2. Do not change code to match this file.
3. Update this file instead, as a small documentation-alignment change.

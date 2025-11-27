# AGENTS – Frontend Wizard (`glowforge-portrait-frontend`)

This file defines how AI assistants (ChatGPT, Codex, etc.) are expected to behave when working in this frontend repo.

This repo implements the Vite React/TypeScript wizard for the Glowforge Portrait Engraver. Project-level architecture, contracts, and workflows are defined in the main project docs (`01`–`07` markdown files and ADRs) and the project-level `AGENTS.md`. If there is ever a conflict, the project-level docs and `AGENTS.md` win; update this file to match them.

---

## 1. Purpose of this repo

- Implement the multi-step wizard:
  - Upload & prep → Crop → Black & White → Dodge & Burn → Levels/Curves → Halftone → Export.
- Manage client-side state:
  - Current step.
  - Image state (original and edited).
  - AI analysis results consumed from the backend.
- Display AI hints and engraving summaries in a way that:
  - Feels helpful and understandable.
  - Is clearly “advice and starting points,” not guaranteed-perfect settings.

This repo must not contain provider-specific AI logic. All AI calls go through the backend.

---

## 2. AI gateway client and contracts

### 2.1 `src/lib/api.ts`

This file is the single HTTP client for `POST /api/ai-analyze-photo`:

- Responsibilities:
  - Read `import.meta.env.VITE_API_BASE_URL`.
  - Normalize the base URL (strip trailing slash) and call `/api/ai-analyze-photo`.
  - Send `{ imageDataUrl, options }` as JSON.
  - Parse the response into the shared envelope:
    - `success: true` with `analysis: AiAnalysisResult`.
    - `success: false` with `error: { code, message }`.
- Rules:
  - Components and hooks must not call `fetch` directly to the backend for AI analysis.
  - Do **not** hard-code backend `.vercel.app` URLs anywhere in the UI; always go through `VITE_API_BASE_URL` and this client.
  - Any changes to the request/response shape must be driven by Strategy and ADR updates.

### 2.2 `src/hooks/useAiAnalysis.ts`

This hook wraps `aiAnalyzePhoto` and centralizes frontend analysis state:

- Manages:
  - `loading: boolean`
  - `result: AiAnalyzePhotoResponse | null`
  - `error: string | null`
- Exposes:
  - `runAnalysis(imageDataUrl: string, options?) => Promise<void>`

UI-level components should use this hook for AI calls instead of reimplementing envelope handling or error mapping.

### 2.3 `AiAnalysisResult` types

Frontend types (either in `src/lib/api.ts` or a dedicated `src/types/ai.ts`) must mirror the contract defined in docs:

- Core fields:
  - `faces`, `backgroundMask`, `globalAdjustments`, `notes: string[]`, etc.
- Engraving-aware optional fields:
  - `halftone`
  - `highlightWarning`
  - `shadowWarning`
  - `dotGainRisk`
  - `recommendedEngraveSettings`

Rules:

- Treat all engraving-aware fields as optional:
  - Always check for existence before use.
  - Render “not available” states gracefully when fields are missing.
- Do not rename or remove these fields without a project-level contract change.
- When new fields are added at the contract level:
  - Update the frontend types to include them as optional.
  - Only use them after docs and backend have been updated.

---

## 3. What AI agents may do in this repo

Allowed changes include:

- Layout and wizard components:
  - `App.tsx` and step components (`UploadStep`, `CropStep`, `BlackAndWhiteStep`, `DodgeBurnStep`, `LevelsCurvesStep`, `HalftoneStep`, `ExportStep`).
  - Implementation of shared layout primitives (e.g., `StepHeader`, `StepShell`) consistent with ADRs.
- AI integration in the UI:
  - Wiring `useAiAnalysis` into the appropriate steps.
  - Rendering AI `notes`, `halftone` suggestions, warnings, `dotGainRisk`, and `recommendedEngraveSettings`.
  - Differentiating between:
    - Transport errors (hook `error`).
    - Backend-declared errors (`success: false` with `error.code` and `error.message`).
- Small helper hooks and utilities:
  - Wizard navigation helpers.
  - Responsive layout helpers.
  - Pure formatting utilities for presenting AI hints.
- Non-breaking refactors:
  - Improving readability.
  - Extracting presentational components.
  - Cleaning up styles, as long as behavior is preserved.

All of these changes must respect the backend contract and avoid introducing new dependencies or frameworks without discussion.

---

## 4. What AI agents must NOT do in this repo

Prohibited changes:

- Call OpenAI or other AI providers directly from the frontend.
- Bypass `src/lib/api.ts` or `useAiAnalysis` to talk to the backend for AI analysis (except in clearly justified, explicitly requested edge cases).
- Change the `{ success, analysis?, error? }` envelope shape or the `AiAnalysisResult` fields.
- Introduce:
  - New API endpoints.
  - Client-side secret storage for image data beyond normal browser behavior.
  - Hidden network calls that the user would not reasonably expect.
- Copy provider-specific or secret-bearing code into the frontend.
- Log or persist full `imageDataUrl` values anywhere other than transient in-memory state needed for the current session (no dumping huge data URLs to logs or analytics).

If a UX or contract change is needed:

- Agents must point back to:
  - `03-architecture-decisions.md`
  - Project-level `AGENTS.md`
- And recommend updating the docs (and running the QC-AGENTS ritual) before changing code.

---

## 5. UX expectations for AI hints

When rendering AI output:

- Treat all AI outputs as “starting points,” not guaranteed recipes.
- Encourage:
  - Test engravings on scrap wood.
  - Adjustments based on material and personal taste.
- Avoid:
  - Overly authoritative language (“always,” “perfect,” “guaranteed”).
  - Hiding uncertainty when fields are missing or low-confidence.

The frontend should aim for clarity and trustworthiness: clear descriptions of what the AI suggests and why it might be helpful.

---

## 6. Git and Codex usage in this repo

### 6.1 Git rules

- Prefer:
  - Small, focused commits (for example, “Wire Analysis summary into UploadStep”).
  - Clear messages that describe user-facing changes or architectural steps.
- Avoid:
  - Force pushes to `main`.
  - Sweeping refactors without explicit user approval and clear scope.
  - Unnecessary churn on unrelated files (large formatting-only diffs).

### 6.2 Codex session pattern (frontend)

For any Codex session in this repo:

1. **Bootstrap (no edits in first response)**  
   The very first Codex response **must not edit any files**.  
   The bootstrap message should instruct Codex to:
   - Read this `AGENTS.md` and the project-level `AGENTS.md`.
   - Skim relevant sections of:
     - `01-project-brief.md`
     - `03-architecture-decisions.md`
     - `04-backlog-and-roadmap.md` (especially Phase 5 and AI UX phases)
   - Summarize, in its own words:
     - What this repo is for.
     - What changes it is allowed and not allowed to make.
     - How it will keep diffs small and reviewable.
   - Ask any clarifying questions about the task.
   - Explicitly confirm that it will not touch contracts or backend envelopes unless Strategy/ADRs say so.

2. **Scope a single small task**  
   - You (the human) then reply with **one** small, concrete task and a list of files it may edit.  
     - Examples:
       - “Wire `useAiAnalysis` into Step 1 and show an Analysis summary.”
       - “Create `StepHeader` and `StepShell` components and migrate Step 1 to use them.”
     - Explicitly list which files Codex may edit and which it must not touch.
   - Codex should keep the diff small and focused, avoiding widescale refactors or formatting changes.

3. **Review diffs before commit**  
   - Check that:
     - Contract-related types and envelope handling are unchanged, unless you explicitly asked for those changes **and** updated docs.
     - No unexpected dependencies or big refactors appeared.
   - If Codex suggests anything that conflicts with this AGENTS file or the project-level docs, it should call that out and propose syncing code to the docs or escalating to Strategy (QC-AGENTS) instead of silently changing the contract.

4. **Commit discipline**  
   - Only commit what you understand.
   - Keep commits tightly scoped to the task you gave Codex.
   - Use descriptive commit messages so future you can see what each Codex-assisted change did.

If any suggestion from Codex or ChatGPT conflicts with this file or the project-level `AGENTS.md`, the contracts and docs win. The assistant should point out the conflict and propose aligning the code, or explicitly escalate to Strategy for a contract change.

# AGENTS – glowforge-portrait-frontend

This file defines how AI agents (ChatGPT, Codex, and similar tools) must work with **this frontend repo**. It is subordinate to the project-level AGENTS.md and Strategy docs, but it adds frontend-specific guardrails.

## 1. Scope and purpose

- This repo is the **Vite React/TypeScript frontend** for the Glowforge Portrait Engraver app.
- It implements the **multi-step wizard UI**:
  - Upload → Crop → B/W → Dodge & Burn → Levels/Curves → Halftone → Export.
- It must **not** contain provider-specific AI logic (no direct OpenAI calls).
- All AI-related behavior flows through a single abstraction in `src/lib/api.ts`, which calls the backend’s `POST /api/ai-analyze-photo` endpoint.

## 2. Contracts and backend interactions

- The backend exposes `POST /api/ai-analyze-photo` and returns a JSON envelope:

  - Success:
    ```json
    { "success": true, "analysis": { ...AiAnalysisResult } }
    ```
  - Error:
    ```json
    { "success": false, "error": { "code": "...", "message": "..." } }
    ```

- `AiAnalysisResult` includes:
  - Core image-prep fields (faces, backgroundMask, globalAdjustments, notes).
  - Engraving-aware fields (halftone, highlight/shadow warnings, dotGainRisk, recommendedEngraveSettings), as defined in the Strategy docs.

**Rules for agents:**

- Do **not** call the backend directly from components or hooks.
- All backend calls must go through `src/lib/api.ts` (or a small wrapper that imports it).
- Do **not** change the HTTP envelope or AiAnalysisResult shape. You may only **extend** the types in a backward-compatible way if Strategy explicitly allows it.

## 3. Allowed changes vs. forbidden changes

### Allowed (with review)

- Implementing or refactoring React components in `src/components` and `src/steps`.
- Adding or adjusting TypeScript types under `src/lib` or `src/types` that mirror the backend contracts.
- Wiring `aiAnalyzePhoto` calls in `src/lib/api.ts` and consuming them via hooks or components.
- Improving UI/UX of the wizard without changing the underlying contract.
- Small, focused refactors that keep behavior the same but improve clarity.

### Forbidden (unless explicitly requested)

- Calling OpenAI or any external AI provider directly from this repo.
- Bypassing `src/lib/api.ts` when talking to the backend.
- Changing the HTTP envelope `{ success, analysis?, error? }` or removing AiAnalysisResult fields.
- Introducing complex state management frameworks or routing without approval.
- Making large, sweeping changes in a single commit (e.g., rewriting multiple steps at once) without an explicit task.

## 4. Git and workflow rules

- Default branch is `main`.
- Preferred workflow:
  - Make **small, focused changes**.
  - Run `npm run dev` (and any relevant tests) before committing.
  - Use clear commit messages describing the change (e.g., `Add api.ts with aiAnalyzePhoto`, `Create basic wizard step shell`).
- Feature branches may be used for larger changes, but only when explicitly requested.

Agents must:
- Keep diffs small and reviewable.
- Avoid reformatting unrelated files or making cosmetic changes across the entire repo.
- Respect existing naming conventions and file layout unless the task explicitly says otherwise.

## 5. Codex-specific notes

For Codex and similar “hands on the repo” agents:

- On session start:
  - **First read this AGENTS.md**.
  - Summarize what this repo is for, what constraints apply, and how you plan to keep diffs small.
- Never modify files in the first response of a new session; wait for a concrete task.
- Do not add new dependencies or tools without an explicit instruction.
- Do not bypass `src/lib/api.ts` when talking to the backend.
- If a task conflicts with this file or the project-level AGENTS docs, ask for clarification instead of guessing.

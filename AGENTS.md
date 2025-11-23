# AGENTS – glowforge-portrait-frontend

This file defines how AI agents (ChatGPT, Codex, and similar tools) must work with this frontend repo. It builds on the project-level Strategy docs and AGENTS.md, but adds frontend-specific guardrails.

## 1. Scope and purpose

- This repo is the Vite React/TypeScript frontend for the Glowforge Portrait Engraver app.
- It implements the multi-step wizard UI:
  - Upload → Crop → Black & White → Dodge & Burn → Levels/Curves → Halftone → Export.
- It must not contain provider-specific AI logic (no direct OpenAI or other AI provider calls).
- All AI-related behavior flows through a single abstraction in `src/lib/api.ts`, which calls the backend’s `POST /api/ai-analyze-photo` endpoint.

## 2. Backend contract and interactions

- The backend exposes `POST /api/ai-analyze-photo` and returns a JSON envelope:

  - Success:
    `{ "success": true, "analysis": { ...AiAnalysisResult } }`
  - Error:
    `{ "success": false, "error": { "code": "...", "message": "..." } }`

- `AiAnalysisResult` includes:
  - Core image-prep fields (faces, backgroundMask, globalAdjustments, notes).
  - Engraving-aware fields (halftone, highlight/shadow warnings, dotGainRisk, recommendedEngraveSettings), as defined in the Strategy docs.

Rules for agents:

- Do not call the backend directly from components or hooks.
- All backend calls must go through `src/lib/api.ts` (or a tiny wrapper that imports it).
- Do not change the HTTP envelope shape or remove fields from AiAnalysisResult. Type changes must remain backward compatible with the backend and Strategy docs.

## 3. Allowed vs forbidden changes

Allowed (with review):

- Implementing or refactoring React components in `src/components` and `src/steps`.
- Adding or adjusting TypeScript types under `src/lib` or `src/types` that mirror backend contracts.
- Wiring `aiAnalyzePhoto` calls in `src/lib/api.ts` and consuming them via hooks or components.
- Improving UI/UX of the wizard in small, focused steps.
- Small refactors that improve clarity without changing behavior.

Forbidden (unless explicitly requested):

- Calling OpenAI or any external AI provider directly from this repo.
- Bypassing `src/lib/api.ts` when talking to the backend.
- Changing the `{ success, analysis?, error? }` envelope or removing AiAnalysisResult fields.
- Introducing complex new frameworks (state management, routing) without explicit approval.
- Large, sweeping, multi-file rewrites in a single commit.

## 4. Git and workflow expectations

- Default branch is `main`.
- Preferred workflow:
  - Make small, focused changes.
  - Run `npm run dev` (and any tests) before committing.
  - Use clear commit messages, e.g.:
    - `Add api.ts with aiAnalyzePhoto client`
    - `Create basic wizard step shell`
- Feature branches are optional; use them only for larger, clearly scoped changes.

Agents must:

- Keep diffs small and reviewable.
- Avoid reformatting unrelated files or applying broad stylistic changes.
- Respect existing naming conventions and file layout unless the task explicitly says otherwise.

## 5. Codex-specific notes

For Codex and similar “hands on the repo” agents:

- On session start:
  - First read this `AGENTS.md`.
  - Summarize what this repo is for, what constraints apply, and how you will keep diffs small.
- Do not modify files in the first response of a new session; wait for a specific task.
- Do not add or remove dependencies without an explicit instruction.
- Do not bypass `src/lib/api.ts` when talking to the backend.
- If a requested change appears to conflict with this file or the project-level Strategy docs, ask for clarification instead of guessing.

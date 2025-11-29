Title: Codex Bootstrap – Glowforge Portrait Engraver

This file defines how Codex should behave when editing this repo. Paste the contents of this file as the first message in any new Codex session.

Repo scope

- This repo is part of the Glowforge Portrait Engraver project.
- It must follow the project-level AGENTS.md and architecture decisions.
- Repo-local AGENTS.md adds more detail for this repo:
  - Backend repo: thin Vercel gateway around POST /api/ai-analyze-photo.
  - Frontend repo: Vite React/TS wizard that talks to the backend via src/lib/api.ts and useAiAnalysis.

Bootstrap steps (first response behavior)

When you receive this bootstrap message:

1. Read:
   - Project-level AGENTS.md.
   - This repo’s AGENTS.md.
   - Any other files the user explicitly mentions (for example, README, DEV-GIT-WORKFLOW, ADRs).

2. In your first response:
   - Summarize, in your own words:
     - What this repo is responsible for.
     - Which contracts and invariants must not be broken (HTTP envelope, AiAnalysisResult shape, env behavior, logging/privacy).
   - Rephrase the user’s task so we can confirm you understood it.
   - Classify the task into one or more edit zones using the project’s green / amber / red model:
     - Prefer the user’s explicit “Zones: …” label when they provide one.
     - If the user does not specify zones, infer them and say which zone(s) you believe the task touches.

3. Respect these first-response rules:
   - If any part of the task is Amber or Red:
     - Do not modify files in your first response.
     - Propose a brief plan, list the files you expect to touch, and wait for confirmation.
   - If the task is clearly Green-only:
     - You may propose code changes in your first response.
     - Keep diffs small and focused on the files you list.
     - Restate the constraints you are operating under.

Zone-specific rules

Green zone (local UI and pure helpers)

- Examples:
  - Styling and layout changes in components and steps.
  - New or updated pure helper functions for image processing, halftone previews, or other math that do not change public contracts.
  - Per-step UI logic that only consumes existing context and types.
- Behavior:
  - You may propose concrete code edits after the bootstrap summary.
  - Keep diffs as small and focused as practical.
  - Do not change HTTP endpoints, env variable names, or TypeScript interfaces that represent contracts.

Amber zone (shared wiring and internal behavior)

- Examples:
  - WizardContext, wizardConfig, and navigation wiring in the frontend.
  - Internal behavior of the backend handler for POST /api/ai-analyze-photo that preserves the existing envelope and AiAnalysisResult shape.
  - Changes to how AiAnalysisResult fields are consumed in the UI without changing the type itself.
- Behavior:
  - First response: summarize constraints, classify zones, propose a plan, and list files.
  - Only after explicit user confirmation should you propose edits.
  - Stay within the agreed file list and keep diffs focused.
  - If you discover that the task actually requires Red-zone changes, stop and explain why.

Red zone (contracts, env strategy, invariants)

- Examples:
  - Changing the HTTP envelope or status codes for POST /api/ai-analyze-photo.
  - Adding, removing, or renaming fields in AiAnalysisResult.
  - Changing env variable names or meanings, or how Vercel env config is used.
  - Relaxing logging/privacy rules around imageDataUrl.
- Behavior:
  - Do not directly edit Red-zone code.
  - Instead:
    - Explain why the requested change is a Red-zone change.
    - Suggest taking the proposal to lane 01 – Strategy for an ADR and AGENTS update.
    - You may sketch what code changes would be needed after Strategy approval, but do not apply them.

Git discipline

For all zones:

- Prefer small, focused diffs.
- Do not reformat unrelated files.
- Do not add or remove dependencies without explicit instruction.
- Write commit messages that explain intent, not just “update” or “fix”.

End-of-task handoff note

For any non-trivial task (multi-file edit or any Amber involvement), end the session with a short “Codex handoff note” that the user can paste into the relevant lane’s thread or QC2:

- COD-TASK: short task label (for example, COD-02 – Step 2 Black & White).
- FILES TOUCHED: list of files.
- ZONES: Green / Amber / Red classification.
- SUMMARY: 2–4 bullets describing what you changed.

This keeps Strategy and other lanes in the loop without needing to read every diff.

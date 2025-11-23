# Glowforge Portrait Engraver – Frontend

This repo contains the Vite React/TypeScript frontend for the Glowforge Portrait Engraver wizard. It implements the multi-step UI that prepares photos for laser engraving on wood.

The backend lives in [Artisean/glowforge-ai-backend](https://github.com/Artisean/glowforge-ai-backend) and exposes `POST /api/ai-analyze-photo` with a stable `AiAnalysisResult` contract wrapped in an HTTP envelope:

- Success: `{ "success": true, "analysis": { ...AiAnalysisResult } }`
- Error: `{ "success": false, "error": { "code": string, "message": string } }`

The frontend must treat this contract as stable and call it only through `src/lib/api.ts`.

---

## Getting Started

Prerequisites:

- Node.js and npm installed.
- Git configured and this repo cloned locally.

From the repo root:

    npm install
    npm run dev

Then open the printed URL in your browser (usually `http://localhost:5173`).

To create a production build:

    npm run build

To preview the production build locally:

    npm run preview

---

## Environment configuration

The frontend talks to the backend using an environment-based base URL. Create a `.env` file in the project root with:

    VITE_API_BASE_URL=<your-backend-base-url>

Examples:

- Local backend:  
  `VITE_API_BASE_URL=http://localhost:3000`
- Deployed backend (Vercel):  
  `VITE_API_BASE_URL=https://your-backend-app.vercel.app`

`src/lib/api.ts` will construct the full endpoint:

- `POST {VITE_API_BASE_URL}/api/ai-analyze-photo`

Do not hard-code backend URLs in components or hooks; always go through `src/lib/api.ts`.

---

## Backend contract and AiAnalysisResult (summary)

The backend endpoint `POST /api/ai-analyze-photo` expects a JSON body like:

- `imageDataUrl`: a data URL string such as `"data:image/png;base64,..."`.
- `options` (optional): an object that may include a `"profile"` or other hints about the subject.

On success, the response is:

- `success: true`
- `analysis: AiAnalysisResult`

On error, the response is:

- `success: false`
- `error: { code: string, message: string }`

`AiAnalysisResult` includes:

- Core image-prep fields (examples):
  - `faces`: normalized face regions for the main subject.
  - `backgroundMask`: optional segmentation of subject vs background.
  - `globalAdjustments`: suggested exposure/contrast/midtone tweaks.
  - `notes`: human-readable suggestions for engraving prep.

- Engraving-aware fields (examples):
  - `halftone`: suggested output DPI, LPI, angle, and shape.
  - `highlightWarning` / `shadowWarning`: flags + messages about tonal safety.
  - `dotGainRisk`: qualitative risk level and guidance.
  - `recommendedEngraveSettings`: suggested speed, power, LPI, passes, and focus for common woods.

The frontend is responsible for:

- Calling this endpoint via `src/lib/api.ts`.
- Displaying and using these fields in the wizard UI.
- Never changing the HTTP envelope shape; any type changes must remain backward compatible with the backend and Strategy docs.

---

## Project structure (initial)

Key files and folders (this will evolve as the wizard is implemented):

- `index.html` – Vite entry HTML file.
- `vite.config.ts` – Vite configuration.
- `tsconfig*.json` – TypeScript configuration.
- `src/main.tsx` – Application entry; mounts the React app.
- `src/App.tsx` – Top-level React component (wizard shell lives here or in a dedicated wrapper).
- `src/index.css`, `src/App.css` – Styles.
- `src/lib/` – Frontend library code:
  - `src/lib/api.ts` (to be implemented) – single abstraction for calling the backend.
  - Optional `src/lib/types.ts` – shared frontend types mirroring `AiAnalysisResult`.
- `src/steps/` – Step-specific screens (Upload, Crop, Black & White, Dodge & Burn, Levels/Curves, Halftone, Export).
- `src/components/` – Reusable UI components.
- `AGENTS.md` – Frontend-specific rules for AI agents (ChatGPT, Codex, etc.).

Keep new files aligned with this structure when expanding the app.

---

## Development workflow

Recommended Git workflow:

1. Pull latest changes:

       git pull origin main

2. Make a small, focused change.
3. Run the dev server and verify the app:

       npm run dev

4. Check what changed:

       git status

5. Stage and commit:

       git add <files>
       git commit -m "Describe the change"

6. Push to GitHub:

       git push origin main

Guidelines:

- Prefer small, reviewable commits.
- Avoid large cross-cutting refactors in a single commit.
- Use feature branches only when explicitly needed; otherwise keep work on `main` with tight commits.

---

## Using AI agents and Codex

This repo is intended to be edited with help from AI agents under explicit guardrails.

Basic rules:

- Always read `AGENTS.md` before using an agent on this repo.
- Agents must:
  - Treat Strategy docs and AGENTS files as the source of truth.
  - Keep diffs small and focused on the requested change.
  - Avoid reformatting unrelated files or applying sweeping style changes.
  - Respect separation of concerns:
    - Backend: provider logic and `AiAnalysisResult` computation.
    - Frontend: wizard UI and consumption of `AiAnalysisResult`.

Backend access rules:

- All calls to `POST /api/ai-analyze-photo` must go through `src/lib/api.ts`.
- Components and hooks must not call the backend directly.
- Agents must preserve the `{ success, analysis?, error? }` envelope shape.

---

## Codex bootstrap prompt (frontend)

When starting a new Codex session attached to this repo, use a bootstrap message like:

    You are GPT-5.1-Codex-Max attached to the `glowforge-portrait-frontend` repo.

    Context:
    - This repo is the Vite React/TypeScript frontend for the Glowforge Portrait Engraver app.
    - The project-level Strategy docs and AGENTS.md define a two-repo architecture:
      - Backend (`glowforge-ai-backend`): thin Vercel AI gateway, owns OpenAI and AiAnalysisResult computation.
      - Frontend (this repo): multi-step wizard UI that calls the backend via `src/lib/api.ts`.
    - The backend exposes POST /api/ai-analyze-photo and returns a JSON envelope:
      - Success:  { "success": true, "analysis": { ...AiAnalysisResult } }
      - Error:    { "success": false, "error": { "code": string, "message": string } }
    - AiAnalysisResult includes both core image-prep fields and engraving-aware fields (halftone, highlight/shadow warnings, dotGainRisk, recommendedEngraveSettings). The frontend must treat this contract as stable.

    Your task for this bootstrap step (READ-ONLY, NO EDITS):

    1) Open and carefully read the repo-local `AGENTS.md` file.
    2) Based on that file and any comments in the code it references, write a concise summary (5–10 bullet points) that describes:
       - What this repo is for (scope and responsibilities).
       - How it is expected to talk to the backend (use of `src/lib/api.ts` and the AiAnalysisResult/HTTP envelope).
       - What types of changes you are allowed to make, and what types of changes are forbidden.
       - Git and workflow expectations (branch usage, commit style, diff size).
    3) Explicitly confirm that you will NOT:
       - Modify any files in this bootstrap response.
       - Add or remove dependencies.
       - Reformat unrelated files.
    4) Explicitly confirm that in future tasks you will:
       - Never bypass `src/lib/api.ts` when talking to the backend.
       - Keep diffs small and focused on the requested change.
       - Preserve the `{ success, analysis?, error? }` envelope and AiAnalysisResult shape, only extending it in ways that remain backward compatible with the Strategy docs.

    Do not propose code changes yet. This step is only for reading, summarizing, and confirming your constraints for future work.

Keep this README in sync with the Strategy docs and `AGENTS.md` as the architecture and workflow evolve.

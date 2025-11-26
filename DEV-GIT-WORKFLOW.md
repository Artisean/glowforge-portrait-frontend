# Personal Git Workflow – Glowforge Portrait Engraver

Goal: A boring, predictable loop:
**edit locally → commit → push → Vercel deploy → smoke test**  
for BOTH:
- `Artisean/glowforge-ai-backend`
- `Artisean/glowforge-portrait-frontend`

---

## 0. Ground Rules

- Work from **local clones only**. Avoid editing in the GitHub or Vercel web UI for now.
- Keep changes **small** and focused: one idea per commit.
- Prefer a **clean working tree** when you stop for the day (`git status` shows nothing to commit).

---

## 1. Before Coding (per repo)

1. Open a terminal and go to the repo:

   - Backend:
     - `cd path/to/glowforge-ai-backend`
   - Frontend:
     - `cd path/to/glowforge-portrait-frontend`

2. Check status:

   - `git status`
   - If there are half-done changes you don’t want anymore:
     - Option A (safe): manually revert in your editor.
     - Option B (all-or-nothing): `git restore .` (only if you’re sure).

3. Sync with GitHub:

   - Ensure you’re on main:
     - `git branch` → should show `* main`
   - Pull latest:
     - `git pull origin main`

4. (Optional, later) Create a feature branch for bigger or risky work:

   - `git checkout -b feat-short-name`
   - For now, it’s fine to stay on `main` while you build muscle memory.

---

## 2. While Coding

1. Make a **small, coherent change**:
   - Example: “Wire `aiAnalyzePhoto` to new backend URL” or “Add AnalysisSummary component.”

2. Run the app locally (if relevant):
   - Backend: `npm run dev` or Vercel dev equivalent.
   - Frontend: `npm run dev`.
   - Fix obvious errors before committing.

3. Check what changed as you go:

   - `git status`
   - `git diff` (to quickly scan your edits).

If the diff looks huge or messy, consider splitting into smaller edits before committing.

---

## 3. Before Each Commit

1. Confirm only the files you expect are modified:

   - `git status`

2. Review the changes:

   - `git diff` (unstaged changes)
   - `git diff --cached` (staged changes, if you’re re-checking before commit)

3. Stage only what is logical together:

   - `git add path/to/file1.tsx path/to/file2.ts`
   - Or if it’s all one small coherent change:
     - `git add .` (but only after verifying `git status` carefully)

4. Commit with a clear, short message:

   Suggested pattern:

   - `feat: short description`
   - `fix: short description`
   - `chore: short description`
   - `docs: short description`

   Example:

   - `feat: add aiAnalyzePhoto helper to api lib`
   - `fix: point frontend API base URL to vercel backend`
   - `chore: sync AGENTS rules with project-level doc`

   Command:

   - `git commit -m "feat: short description"`

---

## 4. Push & Verify (per repo)

1. Push your commit:

   - `git push origin main`
   - (Or `git push -u origin feat-short-name` if/when you use branches.)

2. Confirm on GitHub:
   - Open the repo page.
   - Check that:
     - The new commit is visible on `main`.
     - No unexpected files snuck in (node_modules, build artifacts, etc.).

3. Confirm Vercel deployment:
   - Go to the correct Vercel project.
   - Verify a new deployment was triggered for `main`.
   - Wait until it shows “Ready” / “Succeeded.”

4. Smoke test the deployed app:

   - **Backend**:
     - Hit the live `/api/ai-analyze-photo` endpoint with a test request (e.g., from a REST client).
     - Confirm it returns the expected JSON envelope (`success`, `analysis` or `error`).

   - **Frontend**:
     - Open the deployed URL.
     - Run whatever UI path calls the backend (even a dev-only “Test analysis” button).
     - Confirm:
       - No obvious errors in the browser console.
       - The UI shows some analysis output / error handling instead of crashing.

If deploy or smoke test fails:
- Don’t keep coding.
- Write down what happened and fix that **as its own small change**.

---

## 5. If Using Codex on This Repo

Before letting Codex touch the code:

1. Open the repo’s `AGENTS.md` and skim:
   - Contracts
   - Privacy rules
   - Codex behavior expectations

2. Start your Codex session with a bootstrap message like:

   - “Read AGENTS.md, summarize the constraints in your own words, ask any clarifying questions, and make **no edits** in your first response.”

3. Limit scope:
   - Name the exact files you’re okay with it editing.
   - Set a rough size limit (e.g., “no more than ~50 lines changed”).

4. After Codex produces a diff:
   - Review with `git diff`.
   - Only commit if it passes your own sanity check.

---

## 6. Before You Stop for the Day (per repo)

1. Ensure a clean working tree:

   - `git status` → should say “working tree clean”.

2. If you must leave partially done work uncommitted:
   - Add a clear `TODO` comment in the code or a short note in your own planner.
   - Run `git status` so you know exactly what’s in progress when you come back.

3. Close dev servers and terminal windows cleanly.

---

## 7. Daily Quick-Scan (Optional)

Once per day (or per work session):

- Backend:
  - [ ] `git pull origin main`
  - [ ] Vercel backend deployment healthy
  - [ ] `/api/ai-analyze-photo` smoke-tested (when changed)

- Frontend:
  - [ ] `git pull origin main`
  - [ ] Vercel frontend deployment healthy
  - [ ] Basic UI path smoke-tested (when changed)

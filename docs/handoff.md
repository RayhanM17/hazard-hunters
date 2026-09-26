# Handoff

## Rules for Adding to Handoff

1. **Be Concise** - One line per item, max 2 lines if absolutely necessary
2. **Be Straightforward** - State facts, not opinions or explanations
3. **Use Action Format** - Start with verb when describing tasks (e.g., "Add", "Fix", "Configure")
4. **Link to Context** - Reference file paths, line numbers, or commit hashes when relevant
5. **No Redundancy** - Don't repeat information already in git history or code
6. **Priority Order** - List blocked items first, then high-priority next
7. **Update Regularly** - Refresh when status changes or new items emerge

---

## Current Progress

### Completed
- ✅ Next.js 14 + TypeScript scaffold (replaced Vite/vanilla)
- ✅ Tailwind CSS v3 via PostCSS (`tailwindcss@^3.4.17` + `autoprefixer`) — v4 dropped; oxide engine requires Node 20+, project is on Node 18
- ✅ `tailwind.config.js`, `postcss.config.mjs`, `tsconfig.json`, `next.config.mjs` configured
- ✅ `types/index.ts` — shared types: `MedalTier`, `HazardType` (4 types), `User`, `Submission`, `UploadResult`, `LeaderboardEntry`
- ✅ `lib/snowflake.ts` — singleton connection + `query()` + `putFile()` helpers
- ✅ `lib/medals.ts` — tier metadata (color, icon, order)
- ✅ `lib/auth.ts` — `getUserId()` + `attachUserId()` cookie helpers
- ✅ `middleware.ts` — redirects unauthenticated requests to `/login`; cookie name inlined (no `next/headers` import — Edge-incompatible)
- ✅ `app/layout.tsx` — root layout with nav bar
- ✅ `app/page.tsx` — dashboard (server component, queries LEADERBOARD_VIEW)
- ✅ `app/login/page.tsx` — login form (client component)
- ✅ `app/leaderboard/page.tsx` — leaderboard with top-3 podium + tier grouping
- ✅ `app/api/login/route.ts` — POST: MERGE user, set cookie
- ✅ `app/api/me/route.ts` — GET: current user from LEADERBOARD_VIEW
- ✅ `app/api/upload/route.ts` — POST: PUT → INSERT → CALL PROCESS_PENDING_SUBMISSIONS → return result
- ✅ `app/api/leaderboard/route.ts` — GET: top 100 from LEADERBOARD_VIEW
- ✅ `components/MedalBadge.tsx`, `ProgressBar.tsx`, `UploadDropzone.tsx`, `ResultCard.tsx`, `LeaderboardRow.tsx`
- ✅ `snowflake/` SQL files match actual DB (`DASHROUTE_DB.MVP_SCHEMA`, `AI_COMPLETE`, `DASHROUTE_WH`)
- ✅ `.env.local` filled with real Snowflake credentials
- ✅ `npm run dev` confirmed working — `/login` returns 200
- ✅ GitHub repository created

### Completed (this session)
- ✅ Verified live Snowflake connectivity — added `app/api/health/route.ts` (`SELECT CURRENT_VERSION()`), added to `middleware.ts` public paths
- ✅ Tested full flow end-to-end against real `DASHROUTE_DB.MVP_SCHEMA`: login (MERGE) → me → upload (PUT stage → INSERT → CALL → Cortex `AI_COMPLETE` classify) → leaderboard
- ✅ Fixed critical bug in `snowflake/06_procedures.sql` — `PROCESS_PENDING_SUBMISSIONS` was recalculating points from *every* historical `PROCESSED` submission on every call and re-adding the total, inflating every user's `POINTS` on every unrelated upload. Now snapshots only the batch of rows that were `PENDING` at call-start (`_PENDING_BATCH` temp table) and scores just that batch. Redeployed to Snowflake and confirmed via live test — a new user's upload no longer changes other users' points.
- ✅ Manually corrected `HackathonHero_01`'s points (was inflated to 550 by the bug; reset to 150 = 50 seed + 100 for their 1 real submission) — run by the user directly in Snowsight
- ✅ Wired up tier-change detection in `app/api/upload/route.ts` — fetches `MEDAL_TIER` from `LEADERBOARD_VIEW` before processing, compares to the post-processing tier, sets `tierChanged` accordingly (previously hardcoded `false`)
- ✅ Fixed a pre-existing TS type error in `lib/snowflake.ts` — `query()`'s `binds` param was typed `unknown[]`, didn't satisfy `snowflake-sdk`'s `Binds` type; now typed `snowflake.Bind[]`. `npx tsc --noEmit` is clean.

### Completed (UI design-system session)
- ✅ Applied the "Gamified Utility" design spec (`uiplan.md`) to every page and component — dark `slate-950` asphalt theme, Inter/Poppins fonts, Lucide icons throughout (all emoji removed), indigo/amber/emerald accents, `shadcn/ui`-style primitives hand-written in `components/ui/` (button, card, progress, dialog, sonner toaster)
- ✅ `lib/medals.ts` is now the single source of truth for tier icon + gradient + text-contrast (`textOn: 'dark' | 'light'`), consumed by `MedalBadge`, `ProgressBar`, `LeaderboardRow` group headers, and `TierUpCelebration`
- ✅ Added `PointCounter` (Framer Motion count-up), `TierUpCelebration` (full-screen confetti overlay via `canvas-confetti`, triggered on `tierChanged`), `DashboardClient` (client wrapper holding header/progress/dropzone state so an upload updates the header live), `NavLinks` (active-route pill nav)
- ✅ Errors in `UploadDropzone` now surface via `sonner` toasts mapped per API status code (400/401/409/413/502/500) instead of inline red text
- ✅ Added `components/AmbientBackground.tsx` — fixed decorative layer behind all pages: three blurred brand-color blobs drifting via CSS `transform` keyframes, a faint scrolling diagonal "lane line" texture, and a radial vignette; respects `prefers-reduced-motion`. Wired into `app/layout.tsx`; nav bar got `backdrop-blur` so it reads over it.
- ✅ Fixed contrast, round 1: `MedalBadge`/`TierUpCelebration` used near-black (`text-slate-950`) text on every tier's gradient, unreadable on Road Warrior/Apex Driver. Added `textOn` per tier in `lib/medals.ts`.
- ✅ Fixed contrast, round 2 (user-reported — Pathfinder badge on the leaderboard was still unreadable, "grayish blue with black text"): the real problem was *any* small text sitting directly on a two-stop gradient loses contrast wherever the gradient dips dark (Pathfinder's `cyan-600` stop, the bronze podium's old `amber-700` stop). `MedalBadge` is now a **tonal badge** — solid `bg-slate-800` chip, tier's solid accent color (`lib/medals.ts` `color` field, re-tuned per tier) for border/icon/text — instead of text-on-gradient. `LeaderboardRow`'s bronze podium gradient stop swapped `amber-700` → `amber-600` for the same reason. `TierUpCelebration`'s full-screen gradient + `textOn` light/dark toggle is unchanged (large celebratory text, lower AA bar, not what was reported).
- ✅ `npx tsc --noEmit` and `npm run build` both clean after every change above

### Completed (backend AI upgrade v2 + frontend modernization)
- ✅ Backend upgraded independently (Snowflake side): `SUBMISSIONS` gained `CONFIDENCE`, `SEVERITY`, `ROAD_TYPE`, `WEATHER`, `TIME_OF_DAY`, `DESCRIPTION`, `POINTS_AWARDED`; `HAZARD_TYPE` expanded 4 → 14 categories; `PROCESS_PENDING_SUBMISSIONS()` now scores by severity band × confidence multiplier instead of a flat 100 pts. Full spec: `docs/FRONTEND_MODERNIZATION_V2.md`.
- ✅ `types/index.ts` — `HazardType` expanded to all 14 categories; added `Confidence`, `Severity`, `RoadType`, `Weather`, `TimeOfDay`, `SubmissionRecord`, `SubmissionRow`; `Submission`/`UploadResult` carry the full AI payload
- ✅ `lib/hazards.ts` (new) — icon/color per hazard type, severity color scale, confidence badge variants (single source of truth, same pattern as `lib/medals.ts`)
- ✅ `lib/scoring.ts` (new) — client-side mirror of the backend scoring formula, used only for the points-breakdown tooltip (server's `POINTS_AWARDED` stays authoritative)
- ✅ `app/api/upload/route.ts` — now selects and returns all 7 new `SUBMISSIONS` columns instead of just `hazardType`
- ✅ `app/api/submissions/route.ts` (new) — auth-gated GET, powers the history feed
- ✅ New components: `HazardBadge`, `ConfidenceBadge`, `SeverityBar`, `RoadContextRow`, `PointsBreakdown`
- ✅ `ResultCard.tsx` — rewritten to show hazard badge, severity bar, confidence badge, AI description, road/weather/time chips, and the real `pointsAwarded` (was a hardcoded 4-type map + flat "+100")
- ✅ `app/history/page.tsx` + `components/SubmissionHistoryClient.tsx` (new) — submission history list with filters by hazard type, severity, confidence, road type, weather; `NavLinks.tsx` got a "History" entry
- ✅ Fixed a layout crowding issue in `ResultCard`'s points column (user-reported) — the "how?" breakdown tooltip and `MedalBadge` were stacked with only `mt-1` between three lines; the tooltip trigger is now a small `Info` icon inline next to the points total, medal badge below with normal `gap-2` spacing
- ✅ `npx tsc --noEmit` clean after every change above

### Pending
- ⏳ Live-verify `tierChanged: true` actually fires on a real tier crossing, **and** watch the new `TierUpCelebration` overlay/confetti play for real — not yet exercised in a browser against a live tier boundary (`claude_test_user` 300 pts, `RayhanTester` 200 pts, both still Scout, need 500)
- ⏳ Mobile layout (~375px width) not visually checked in a real browser, including the new `/history` page
- ⏳ Duplicate upload prevention (`FILE_HASH` dedupe, `409` response) from `PLAN.md` §6 — still not implemented; current `SUBMISSIONS` table has no `FILE_HASH` column
- ⏳ `snowflake/02_tables.sql` and `snowflake/06_procedures.sql` are still the pre-v2 versions (4-type hazard, flat 100 pts) — stale versus the live DB and versus `docs/FRONTEND_MODERNIZATION_V2.md` §5; need to be synced so the repo doesn't lie about what's deployed
- ⏳ Leaderboard doesn't show per-user submission count / avg severity — deliberately deferred (see `docs/FRONTEND_MODERNIZATION_V2.md` scope decisions)
- ⏳ `npm run build` not re-run since the v2 changes (only `tsc --noEmit`) — user is testing the dev server directly instead

### Known, accepted (not bugs)
- Each Next.js route/page opens its own Snowflake connection (module-level singleton only dedupes repeat calls within the same route, not across routes — Next.js bundles each route separately). Already called out in `PLAN.md` §14 as an accepted risk for the MVP.

### Blockers
- None

### Next Steps
1. Sync `snowflake/02_tables.sql` / `06_procedures.sql` (and this handoff's stale bullets) to match the live v2 schema
2. Live-verify tier-up detection and the `TierUpCelebration` overlay (see Pending above)
3. Spot-check the redesigned UI (including `/history`) at mobile width (~375px) in a real browser

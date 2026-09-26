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

### Pending
- ⏳ Live-verify `tierChanged: true` actually fires on a real tier crossing — re-tested after the bug fix, points are clean (`POINTS = PROCESSED_COUNT × 100` for every user) but no user has crossed a tier boundary yet (`claude_test_user` 300 pts, `RayhanTester` 200 pts, both still Scout, need 500). Push either past 500 and check the upload response body (Network tab — no UI surfaces it yet) to confirm `tierChanged: true` fires.
- ⏳ Duplicate upload prevention (`FILE_HASH` dedupe, `409` response) from `PLAN.md` §6 — not implemented; current `SUBMISSIONS` table (`snowflake/02_tables.sql`) has no `FILE_HASH` column
- ⏳ No confidence threshold or per-hazard-type point values — current procedure awards a flat 100 pts for any processed submission, including `NONE` (no hazard). `PLAN.md`'s `HAZARD_POINTS` table / confidence gating was never implemented; current schema (`HazardType = 'POTHOLE'|'FADED_LINE'|'CONSTRUCTION'|'NONE'`) is simpler than the original 8-type/confidence spec in `PLAN.md` §6–8. Flag to the team before the demo: uploading anything (even a non-road photo) currently earns points.

### Known, accepted (not bugs)
- Each Next.js route/page opens its own Snowflake connection (module-level singleton only dedupes repeat calls within the same route, not across routes — Next.js bundles each route separately). Already called out in `PLAN.md` §14 as an accepted risk for the MVP.

### Blockers
- None

### Next Steps
1. Live-verify tier-up detection (see Pending above)
2. Implement page/component UI (skeletons are in place — fill in real layouts and styles)
3. Decide: keep flat 100-pt scoring or implement `PLAN.md`'s confidence-gated `HAZARD_POINTS` table before the demo
4. Polish: loading states, error toasts, mobile layout

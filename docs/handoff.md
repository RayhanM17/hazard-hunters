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
- ✅ Next.js 14 + TypeScript scaffold created (replaced Vite/vanilla)
- ✅ Tailwind CSS v4 wired via `@tailwindcss/postcss` (`postcss.config.mjs`)
- ✅ `tsconfig.json` and `next.config.ts` configured
- ✅ `types/index.ts` — shared types: `MedalTier`, `HazardType`, `User`, `Submission`, `UploadResult`, `LeaderboardEntry`
- ✅ `lib/snowflake.ts` — singleton connection + `query()` + `putFile()` helpers
- ✅ `lib/medals.ts` — tier metadata (color, icon, order) matching plan
- ✅ `lib/auth.ts` — `getUserId()` + `attachUserId()` cookie helpers
- ✅ `middleware.ts` — redirects unauthenticated requests to `/login`
- ✅ `app/layout.tsx` — root layout with nav bar
- ✅ `app/page.tsx` — dashboard page (server component, queries LEADERBOARD_VIEW)
- ✅ `app/login/page.tsx` — login form (client component)
- ✅ `app/leaderboard/page.tsx` — leaderboard with top-3 podium + tier grouping
- ✅ `app/api/login/route.ts` — POST: MERGE user, set cookie
- ✅ `app/api/me/route.ts` — GET: current user from LEADERBOARD_VIEW
- ✅ `app/api/upload/route.ts` — POST: PUT → INSERT → CALL PROCESS_PENDING_SUBMISSIONS → return result
- ✅ `app/api/leaderboard/route.ts` — GET: top 100 from LEADERBOARD_VIEW
- ✅ `components/MedalBadge.tsx` — tier badge with icon and tier color
- ✅ `components/ProgressBar.tsx` — animated progress bar toward next tier
- ✅ `components/UploadDropzone.tsx` — drag-and-drop + browse, calls `/api/upload`
- ✅ `components/ResultCard.tsx` — shows hazard type, +100 pts, updated tier
- ✅ `components/LeaderboardRow.tsx` — podium (top 3) + regular rows with current-user highlight
- ✅ `snowflake/` SQL files updated to match actual DB (`DASHROUTE_DB.MVP_SCHEMA`, `AI_COMPLETE`)
- ✅ `.env.local.example` with correct var names
- ✅ `.env.local` filled with real Snowflake credentials

### Pending
- ⏳ Run `npm install` to install Next.js deps (node_modules has old Vite packages)
- ⏳ Test `npm run dev` and verify Tailwind renders
- ⏳ Tier-up animation — `tierChanged` flag in upload route is always `false` (TODO in `upload/route.ts`)

### Blockers
- None

### Next Steps
1. `npm install` → `npm run dev`
2. Implement each page/component UI (skeletons are in place)
3. Wire up tier-change detection in `app/api/upload/route.ts` (compare points before/after CALL)
4. Polish: loading states, error toasts, mobile layout

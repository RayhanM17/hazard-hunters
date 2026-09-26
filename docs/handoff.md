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

### Pending
- ⏳ Tier-up animation — `tierChanged` is hardcoded `false` in `app/api/upload/route.ts` (compare points before/after CALL to detect)

### Blockers
- None

### Next Steps
1. Implement page/component UI (skeletons are in place — fill in real layouts and styles)
2. Wire up tier-change detection in `app/api/upload/route.ts`
3. Polish: loading states, error toasts, mobile layout

# Frontend Modernization — AI Upgrade v2

**Status:** Approved · **Date:** 2026-09-26

## Context

The Snowflake backend (`DASHROUTE_DB.MVP_SCHEMA`) was upgraded: `SUBMISSIONS` gained 7 columns (`CONFIDENCE`, `SEVERITY`, `ROAD_TYPE`, `WEATHER`, `TIME_OF_DAY`, `DESCRIPTION`, `POINTS_AWARDED`), `HAZARD_TYPE` expanded from 4 values to 14, and `PROCESS_PENDING_SUBMISSIONS()` now scores each submission with a severity/confidence formula instead of a flat 100 pts. The Next.js app only knew about the old 4-hazard/flat-100 world — it still ran, but threw away all the new AI data (severity, confidence, description, road context) and showed a hardcoded "+100 pts" on every submission. This plan brings the frontend (and the API routes that feed it) up to date with the live schema, and adds a history view so the new columns are actually visible somewhere.

Local `snowflake/*.sql` files were also stale versus the live DB (still showed the old 4-type schema/procedure) — synced so the repo doesn't lie about what's actually deployed.

Scope decisions confirmed with the user:
- **Include** a new Submission History page with filters (hazard type, severity, confidence, road type, weather).
- **Skip** adding submission-count/avg-severity stats to the leaderboard for this round (leaderboard stays as-is).

---

## 1. Shared types & metadata

**`types/index.ts`**
- Expand `HazardType` to the 14-value union (`POTHOLE`, `CRACK`, `FADED_LINE`, `CONSTRUCTION`, `DEBRIS`, `FLOODING`, `DAMAGED_SIGN`, `MISSING_GUARDRAIL`, `ANIMAL`, `UNEVEN_SURFACE`, `SLIPPERY_SURFACE`, `SIGNAL_MALFUNCTION`, `STALLED_VEHICLE`, `NONE`).
- Add `Confidence = 'HIGH' | 'MEDIUM' | 'LOW'`, `RoadType`, `Weather`, `TimeOfDay` unions matching the spec's enumerations.
- Extend `Submission` with `confidence`, `severity` (1-5), `roadType`, `weather`, `timeOfDay`, `description`, `pointsAwarded`, `fileName`, `uploadedAt` — this becomes the shape returned by both the upload route and the new submissions route.
- Add `SubmissionRecord extends Submission { username: string }` mirroring the sample join query in the spec (§7), used by the history page.
- `UploadResult.submission` becomes `Submission` (now includes all the new fields, not just `id/status/hazardType`).

**`lib/hazards.ts` (new)** — same pattern as existing `lib/medals.ts` (single source of truth consumed everywhere):
- `HAZARDS: Record<HazardType, { label, icon, color }>` for all 14 types + `NONE`, using `lucide-react` icons already in the dependency list.
- `SEVERITY_COLORS: Record<1|2|3|4|5, string>` — green/yellow/orange/red/dark-red per spec §6.
- `CONFIDENCE_META` — style info for the badge variants (solid/outlined/dashed) per spec.

**`lib/scoring.ts` (new)** — pure functions mirroring the backend formula (spec §3), used only to render the "breakdown" tooltip client-side (the server's `POINTS_AWARDED` stays authoritative for the actual number shown):
```ts
export function baseForSeverity(s: number): number // 1-2→50, 3→100, 4-5→200
export function multiplierForConfidence(c: Confidence): number // HIGH→1.5, else 1
export function scoringBreakdown(severity, confidence): { base, multiplier, total }
```

## 2. API routes

**`app/api/upload/route.ts`** — after `CALL PROCESS_PENDING_SUBMISSIONS()`, the `SELECT ... FROM SUBMISSIONS` previously only pulled `SUBMISSION_ID, STATUS, HAZARD_TYPE`. Extended to select all 7 new columns too, and map them onto the new `Submission` shape in the JSON response (camelCase, same mapping style already used for the `LeaderboardRow` → `User` mapping in this same file).

**`app/api/submissions/route.ts` (new, GET)** — powers the history page:
- Auth-gated like `app/api/me/route.ts` (`getUserId()`, 401 if missing).
- Runs the join query from spec §7, filtered `WHERE s.USER_ID = ?`, `ORDER BY s.UPLOADED_AT DESC`, capped (e.g. `LIMIT 200`).
- Returns `SubmissionRecord[]`.
- Filtering (`hazardType`, `severity`, `confidence`, `roadType`, `weather`) is applied **client-side** on the fetched list (dataset is small/per-user, no need for query-param plumbing into SQL for this round).

## 3. Components

**`components/SeverityBar.tsx` (new)** — 5-segment bar, each segment colored via `SEVERITY_COLORS`, filled up to `severity`.

**`components/ConfidenceBadge.tsx` (new)** — small badge, 3 visual variants (solid border / dashed border / dimmed opacity) per `CONFIDENCE_META`, reused in `ResultCard` and the history list.

**`components/HazardBadge.tsx` (new)** — icon + label pill driven by `lib/hazards.ts`, replaces the inline `HAZARD_META` map previously hardcoded in `ResultCard.tsx`.

**`components/PointsBreakdown.tsx` (new)** — small hover/focus tooltip (plain CSS `group-hover`, no new Radix dependency) showing `"200 base (severity 4) × 1.5 (HIGH confidence) = 300 pts"` via `lib/scoring.ts`; renders nothing extra when hazard is `NONE`.

**`components/RoadContextRow.tsx` (new)** — row of 3 small chips (road type / weather / time of day icons + label), used in both `ResultCard` and the history rows.

**`components/ResultCard.tsx` (rewrite)** — replaced the hardcoded `HAZARD_META`/`earnedPts = 100` logic with:
- `HazardBadge` for the hazard type
- `SeverityBar` (hidden for `NONE`)
- `ConfidenceBadge`
- `submission.description` text
- `RoadContextRow`
- Points shown from `submission.pointsAwarded` (server value) with `PointsBreakdown` tooltip

**`components/NavLinks.tsx`** — added a "History" entry alongside Dashboard/Leaderboard.

## 4. Submission History page

**`app/history/page.tsx` (new)** — Server Component, same pattern as `app/leaderboard/page.tsx`: fetches via `query()` directly, passes rows into a client component.

**`components/SubmissionHistoryClient.tsx` (new)** — client component:
- Filter controls (simple `<select>`s, styled consistently with existing `components/ui/*`) for hazard type, severity, confidence, road type, weather — filtering the already-fetched array client-side.
- Renders each row reusing `HazardBadge`, `ConfidenceBadge`, `SeverityBar`, `RoadContextRow`, and points.
- Empty state ("No submissions yet — upload your first dashcam photo").

## 5. Docs / SQL sync (low-risk, no live DB changes)

- Updated `snowflake/02_tables.sql` to show the 7 new `SUBMISSIONS` columns (matches what's already live).
- Updated `snowflake/06_procedures.sql` to reflect the new `AI_COMPLETE` JSON-structured call, 14-category prompt, and severity/confidence scoring — as documentation of the live procedure, not something that gets re-run.
- Updated `docs/handoff.md` to reflect the frontend being brought up to date with the v2 schema.

## Verification

1. `npx tsc --noEmit` — confirms the expanded types compile cleanly through every consumer.
2. `npm run build` — catches any Server/Client Component boundary issues in the new `app/history` route.
3. `npm run dev` and manually:
   - Upload an image → `ResultCard` shows hazard badge, severity bar, confidence badge, description, road context chips, and correct points (not a hardcoded 100).
   - Visit `/history` → see past submissions, exercise each filter dropdown.
   - Confirm `NavLinks` highlights `/history` when active (existing active-route logic).
   - Confirm dashboard and leaderboard pages still render unchanged (regression check).

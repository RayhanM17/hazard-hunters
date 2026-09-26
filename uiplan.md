# Apply DashRoute Design System to Hazard Hunters UI

## Context

The app (Next.js 14 App Router, `DASHROUTE_DB.MVP_SCHEMA` on the backend, branded "Hazard Hunters" in the UI) is functionally complete end-to-end (login → upload → AI classify → points → leaderboard, per `docs/handoff.md`) but visually bare: plain `gray-950`/`sky-*` Tailwind defaults, emoji used for every icon (🚗🕳️🛣️🚧✅🥇🥈🥉👑🎉📷), no shadcn/ui primitives, no Framer Motion, no custom fonts, no medal-tier gradients, no count-up or tier-up celebration animation.

This plan applies the pasted **"Gamified Utility" design system spec** (dark asphalt theme, indigo/amber/emerald accents, Clash Royale–style medal gradients, Inter/Poppins fonts, Framer Motion micro-interactions, zero emoji / Lucide-only icons) to every existing component and page. **Scope is UI/visual only** — no changes to Snowflake, API routes, scoring logic, or the known pending items in `docs/handoff.md` (those are separate, already tracked there). Brand name stays **"Hazard Hunters"** (the spec's "DashRoute" is just the template's placeholder brand — its visual system is what we're adopting, not its name).

## Dependencies to add

Runtime: `framer-motion`, `lucide-react`, `canvas-confetti`, `@radix-ui/react-dialog`, `@radix-ui/react-progress`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner`
Dev: `tailwindcss-animate`, `@types/canvas-confetti`

shadcn/ui primitives will be **hand-written** (not via `npx shadcn init`) to avoid interactive CLI prompts — same output, standard shadcn source patterns, full control over dark-theme defaults.

## Foundation

- **`lib/utils.ts`** (new): `cn()` via `clsx` + `tailwind-merge` — standard shadcn helper, needed by every `ui/*` primitive.
- **`app/layout.tsx`**: load `Inter` (`font-sans`) + `Poppins` (`font-display`) via `next/font/google`, expose as CSS vars.
- **`tailwind.config.js`**: extend `fontFamily.sans`/`fontFamily.display`; add keyframes/animations `pulse-slow` (3s dropzone border pulse) and `gradient-pan` (Apex tier animated gradient); add glow `boxShadow` utilities (amber CTA glow, indigo active glow); add `require('tailwindcss-animate')` plugin.
- **`components/ui/`** (new): `button.tsx` (cva variants, `rounded-full`, `hover:scale-105 active:scale-95 duration-200`), `card.tsx` (`rounded-2xl`/`3xl`, `bg-slate-900 border-slate-800`), `progress.tsx` (Radix root/track only — actual fill animation is custom Framer Motion, not Radix's built-in transform), `dialog.tsx` (Radix, used by the tier-up celebration), `sonner.tsx` (Toaster wrapper — fulfills the spec's "Toast" requirement; `sonner` is shadcn's current recommendation over the deprecated toast primitive).

## Design-system source of truth: `lib/medals.ts`

Rewrite `TIERS` to replace emoji `icon` strings with **Lucide icon components** and add per-tier gradient class strings matching the spec exactly:

| Tier | Icon | Gradient |
|---|---|---|
| Scout | `Search` | `from-slate-500 to-slate-400` |
| Pathfinder | `Compass` | `from-cyan-600 to-cyan-400` |
| Trailblazer | `Flame` | `from-amber-600 to-yellow-400` |
| Road Warrior | `Swords` | `from-fuchsia-600 to-pink-400` |
| Apex Driver | `Crown` | `bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 animate-gradient-pan` + glow |

Keep `TIER_ORDER` and `getTier()` signatures unchanged so callers don't need to change their imports beyond the icon type.

## Component rewrites (visual only, same props/interfaces unless noted)

- **`MedalBadge.tsx`**: pill (`rounded-full`), tier gradient background, Lucide icon, glow on Apex.
- **`ProgressBar.tsx`**: Framer Motion `motion.div` animates fill width from previous → new value over **1.5s** with a custom `easeOut` curve (not Radix's own transition); track gets `shadow-inner` groove; fill uses the tier gradient.
- **`PointCounter.tsx`** (new): reusable count-up number using `useMotionValue`/`animate()`, `tabular-nums font-display`. Used in `ResultCard` (points earned) and the new dashboard header (running total).
- **`UploadDropzone.tsx`**: `border-2 border-dashed` with the slow 3s pulse keyframe; Lucide `UploadCloud`/`ImageIcon` (no 📷); amber CTA (`bg-amber-500 text-slate-950`) with glow; `Loader2` spin for the loading state; errors surface via `sonner` toast, mapped per API status code (400/401/409/413/502/500) instead of inline red text; on a response with `tierChanged: true`, fires `TierUpCelebration`.
- **`ResultCard.tsx`**: `Card` primitive; Lucide icon per `hazardType` (no emoji labels); `PointCounter` for the `+N` tally; emerald success styling per spec.
- **`LeaderboardRow.tsx`**: podium rows keep gold/silver/bronze gradients but swap 🥇🥈🥉 for Lucide `Trophy`/`Medal`/`Award`; current-user highlight becomes `ring-2 ring-indigo-500`; non-podium rows `rounded-xl border border-slate-800`.
- **`TierUpCelebration.tsx`** (new): Radix `Dialog`, full-screen, Framer Motion scale/opacity-in, background flashes the newly-reached tier's gradient, `canvas-confetti` burst in the tier's colors (no emoji shapes), large tier icon + `font-display` "New Tier: {tier}" text, auto-dismiss ~3s or on click.

## Page updates

- **`app/layout.tsx`**: fonts wired in; `bg-slate-950` body; nav restyled (Lucide logo icon + "Hazard Hunters" in `font-display`, pill-style active nav links via a small client `NavLinks` component using `usePathname`); global `<Toaster />` added.
- **`app/page.tsx` (dashboard)**: introduce **`components/DashboardClient.tsx`** (new, client) wrapping the header card + `ProgressBar` + `UploadDropzone`, seeded with the server-fetched `user`. It holds local state so a successful upload updates the header's `PointCounter`/`ProgressBar`/`MedalBadge` in place and triggers `TierUpCelebration` — this is the only structural (non-purely-visual) addition, required because the spec's count-up/tier-up behavior needs shared state between the header and the dropzone that a plain server component can't hold. `app/page.tsx` itself stays a server component that just fetches `user` and renders `DashboardClient`.
- **`app/leaderboard/page.tsx`**: tier-group headers get the tier's icon + gradient/color, `font-display uppercase tracking-wider`.
- **`app/login/page.tsx`**: Lucide logo icon instead of 🚗, `font-display` heading, `rounded-xl`/`rounded-full` inputs and button per spacing rules, `hover:scale-105 active:scale-95` on submit.

## Verification

- `npx tsc --noEmit` and `npm run lint` clean.
- `npm run dev`; walk `/login` → dashboard → upload → `/leaderboard` in a browser at both desktop and ~375px mobile width, confirming: pulse animation on the idle dropzone, hover/active scale on buttons, progress bar animating (not snapping) on load and after upload, point count-up, podium/tier-group icons and gradients, and (if a real upload crosses a tier boundary, using real Snowflake credentials already in `.env.local`) the tier-up overlay + confetti.
- If no live tier-crossing is achievable in this session, verify `TierUpCelebration` visually by temporarily forcing `tierChanged: true` in dev tools / a throwaway test render, and say explicitly in the summary that live tier-crossing wasn't exercised — per the project's own testing-honesty rule, don't claim it works end-to-end without seeing it fire.

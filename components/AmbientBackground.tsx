/**
 * Decorative, fixed backdrop: slow-drifting blurred color blobs (indigo /
 * violet / amber — the brand + medal-tier palette) over a faint diagonal
 * "lane line" texture, with a vignette so foreground cards stay readable.
 * Pure CSS transforms — no canvas/JS — and respects prefers-reduced-motion.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 h-[calc(100%+160px)] w-[calc(100%+160px)] animate-lane-scroll opacity-[0.07] motion-reduce:animate-none motion-reduce:opacity-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 2px, transparent 2px, transparent 80px)',
          backgroundSize: '160px 160px',
        }}
      />

      <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] animate-blob-drift-a rounded-full bg-indigo-600/25 blur-[110px] motion-reduce:animate-none" />
      <div className="absolute -right-32 top-1/3 h-[32rem] w-[32rem] animate-blob-drift-b rounded-full bg-fuchsia-600/20 blur-[110px] motion-reduce:animate-none" />
      <div className="absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] animate-blob-drift-c rounded-full bg-amber-500/15 blur-[110px] motion-reduce:animate-none" />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(2,6,23,0.75) 100%)',
        }}
      />
    </div>
  )
}

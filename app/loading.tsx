export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-[var(--text-secondary)] text-lg sm:text-xl font-medium mb-8 text-center">
        Reading between the headlines...
      </p>
      {/* Animating Moodline - three bars that expand and contract */}
      <div className="w-full max-w-sm space-y-3">
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
            <div
              className="moodline-loading-bar h-full rounded bg-[var(--accent-negative)]"
              style={{ animationDelay: '0s' }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
            <div
              className="moodline-loading-bar h-full rounded bg-[var(--accent-neutral)]"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
            <div
              className="moodline-loading-bar h-full rounded bg-[var(--accent-positive)]"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

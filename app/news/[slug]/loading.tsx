export default function NewsLoading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[50vh] px-4"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-[var(--text-secondary)] text-lg sm:text-xl font-medium mb-8 text-center">
        Reading between the headlines...
      </p>
      <div className="w-full max-w-sm space-y-3">
        <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
          <div
            className="moodline-loading-bar h-full rounded bg-[var(--accent-negative)]"
            style={{ animationDelay: '0s' }}
          />
        </div>
        <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
          <div
            className="moodline-loading-bar h-full rounded bg-[var(--accent-neutral)]"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
        <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
          <div
            className="moodline-loading-bar h-full rounded bg-[var(--accent-positive)]"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-auto">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-[60px] py-4 sm:py-6 min-w-0 overflow-x-hidden">
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* <nav className="flex items-center gap-4" aria-label="Footer">
            <Link
              href="/archive"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors"
            >
              Archive
            </Link>
          </nav> */}
          <div className="text-sm sm:text-base text-[var(--text-primary)] text-center font-medium">
            Real-time analysis of how Pakistan's news is told
          </div>
          <div className="text-xs sm:text-sm text-[var(--text-muted)] text-center">
            ©️ 2026 MosaicBeat. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}


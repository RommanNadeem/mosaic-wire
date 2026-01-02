function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-center sm:justify-between">
          <div className="text-xs sm:text-sm text-[var(--text-muted)] text-center sm:text-left">
            © {new Date().getFullYear()} MosaicBeat. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

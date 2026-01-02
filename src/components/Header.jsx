import { useTheme } from '../contexts/ThemeContext'

function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">MosaicBeat</h1>
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">Pakistan's news, unmasked.</span>
          </div>
          
          {/* Mobile navigation - Live and Theme toggle */}
          <nav className="flex md:hidden items-center space-x-3">
            {/* Live indicator */}
            <div className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 bg-[var(--accent-positive)] rounded-full"></span>
              <span className="text-xs">Live</span>
            </div>
            
            {/* Theme toggle */}
            <button
              onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </nav>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Live indicator - subtle */}
            <div className="flex items-center space-x-2 text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 bg-[var(--accent-positive)] rounded-full"></span>
              <span className="text-sm">Live</span>
            </div>
            
            {/* Today's Top Signals pill */}
            <a 
              href="#" 
              className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-full transition-colors"
            >
              Today's Top Signals
            </a>
            
            {/* Theme toggle */}
            <button
              onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

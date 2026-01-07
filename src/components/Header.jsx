import { useTheme } from "../contexts/ThemeContext";
import { useState, useRef } from "react";

function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileTooltipPosition, setMobileTooltipPosition] = useState("top");
  const [desktopTooltipPosition, setDesktopTooltipPosition] = useState("top");
  const mobileThemeButtonRef = useRef(null);
  const desktopThemeButtonRef = useRef(null);

  // Local date (no time) formatted with ordinal day
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const now = new Date();
  const weekday = now.toLocaleString(undefined, { weekday: "long" });
  const month = now.toLocaleString(undefined, { month: "long" });
  const day = getOrdinal(now.getDate());
  const year = now.getFullYear();
  const formattedDate = `${weekday}, ${day} ${month}, ${year}`;

  return (
    <header className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-[var(--accent-positive)] transition-colors cursor-pointer"
              >
                MosaicBeat
              </a>
            </h1>
            <span className="text-[var(--text-muted)] hidden sm:inline">|</span>
            <span className="text-sm sm:text-base text-[var(--text-secondary)] hidden sm:inline">
              Smarter News, From All Angles
            </span>
          </div>

          {/* Mobile navigation - Today's Front Page, Live and Theme toggle */}
          <nav className="flex md:hidden items-center space-x-3">
            {/* Local Date */}
            <span className="text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
              {formattedDate}
            </span>
            {/* Today's Front Page */}
            <a
              href="#"
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
            >
              Today's Front Page
            </a>
            {/* Live indicator */}
            <div className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 bg-[var(--accent-positive)] rounded-full"></span>
              <span className="text-xs">Live</span>
            </div>

            {/* Theme toggle */}
            <button
              ref={mobileThemeButtonRef}
              onMouseEnter={() => {
                if (mobileThemeButtonRef.current) {
                  const rect = mobileThemeButtonRef.current.getBoundingClientRect();
                  const spaceAbove = rect.top;
                  setMobileTooltipPosition(spaceAbove < 60 ? "bottom" : "top");
                }
              }}
              onClick={() => toggleTheme(theme === "light" ? "dark" : "light")}
              className="p-2 hover:bg-[var(--bg-surface)] transition-colors relative group"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
              {/* Tooltip */}
              <span className={`absolute left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-[var(--bg-card)] bg-[var(--text-primary)] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] ${
                mobileTooltipPosition === "top" 
                  ? "bottom-full mb-2" 
                  : "top-full mt-2"
              }`}>
                {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              </span>
            </button>
          </nav>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Local Date */}
            <span className="text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
              {formattedDate}
            </span>
            {/* Today's Front Page */}
            <a
              href="#"
              className="text-sm lg:text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
            >
              Today's Front Page
            </a>
            {/* Theme toggle */}
            <button
              ref={desktopThemeButtonRef}
              onMouseEnter={() => {
                if (desktopThemeButtonRef.current) {
                  const rect = desktopThemeButtonRef.current.getBoundingClientRect();
                  const spaceAbove = rect.top;
                  setDesktopTooltipPosition(spaceAbove < 60 ? "bottom" : "top");
                }
              }}
              onClick={() => toggleTheme(theme === "light" ? "dark" : "light")}
              className="p-2 hover:bg-[var(--bg-surface)] transition-colors relative group"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
              {/* Tooltip */}
              <span className={`absolute left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-[var(--bg-card)] bg-[var(--text-primary)] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] ${
                desktopTooltipPosition === "top" 
                  ? "bottom-full mb-2" 
                  : "top-full mt-2"
              }`}>
                {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;

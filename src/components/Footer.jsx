import { useTheme } from '../contexts/ThemeContext'

function Footer() {
  const { theme, toggleTheme } = useTheme()

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        footer: 'border-t border-gray-200',
        text: 'text-ground-text-dark-tertiary',
        toggleBg: 'bg-gray-100',
        active: 'bg-white text-ground-text-dark-primary shadow-sm',
        inactive: 'text-ground-text-dark-tertiary hover:text-ground-text-dark-secondary'
      }
    }
    return {
      footer: 'border-t border-ground-dark-tertiary',
      text: 'text-ground-text-tertiary',
      toggleBg: 'bg-ground-dark-tertiary',
      active: 'bg-ground-dark-secondary text-ground-text-primary',
      inactive: 'text-ground-text-tertiary hover:text-ground-text-secondary'
    }
  }

  const classes = getThemeClasses()

  return (
    <footer className={`${classes.footer} mt-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className={`text-sm ${classes.text}`}>
            © {new Date().getFullYear()} MosaicBeat. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${classes.text}`}>Theme:</span>
            <div className={`flex items-center space-x-2 ${classes.toggleBg} rounded-lg p-1`}>
              <button
                onClick={() => toggleTheme('light')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  theme === 'light' ? classes.active : classes.inactive
                }`}
              >
                Light
              </button>
              <button
                onClick={() => toggleTheme('dark')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  theme === 'dark' ? classes.active : classes.inactive
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


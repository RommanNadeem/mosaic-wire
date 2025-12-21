import { useTheme } from '../contexts/ThemeContext'

function Header() {
  const { theme } = useTheme()
  
  const headerBg = theme === 'light' ? 'bg-gray-50' : 'bg-ground-dark-secondary'
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-ground-dark-tertiary'
  const titleColor = theme === 'light' ? 'text-gray-900' : 'text-ground-text-primary'
  const subtitleColor = theme === 'light' ? 'text-gray-600' : 'text-ground-text-tertiary'
  const linkColor = theme === 'light' ? 'text-gray-700 hover:text-gray-900' : 'text-ground-text-secondary hover:text-ground-text-primary'

  return (
    <header className={`${headerBg} border-b ${borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className={`text-2xl font-bold ${titleColor} tracking-tight`}>MosaicWire</h1>
            <span className={`text-sm ${subtitleColor}`}>Pakistan's news, unmasked.</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className={`${linkColor} flex items-center space-x-2 transition-colors`}>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Live</span>
            </a>
            <a href="#" className={`${linkColor} flex items-center space-x-2 transition-colors`}>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Today's Top Signals</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

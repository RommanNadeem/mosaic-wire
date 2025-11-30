function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[36px] font-bold" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: 'rgb(33, 36, 44)' }}>MosaicWire</h1>
            <p className="text-sm mt-0.5" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'rgb(103, 111, 126)' }}>Pakistan's news, unmasked.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Live</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-700" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Today's Top Signals</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


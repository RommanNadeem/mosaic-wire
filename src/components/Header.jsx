function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MosaicWire</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Categories</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

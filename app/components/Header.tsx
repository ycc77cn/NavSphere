export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="hidden md:flex items-center space-x-4">
            <a href="https://github.com/ycc77cn" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-gray-600 hover:text-gray-900">
              <i className="fa-github"></i> GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  )
} 

// src/components/Header.tsx
import { Bars3Icon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <button
          className="lg:hidden text-gray-500 hover:text-gray-700"
          onClick={onMenuClick}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center">
          <div className="text-sm text-gray-500">
            Game Benchmarking Automation Platform
          </div>
        </div>
      </div>
    </header>
  )
}
// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  ServerIcon,
  PuzzlePieceIcon,  
  PlayIcon, 
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'SUTs', href: '/suts', icon: ServerIcon },
  { name: 'Games', href: '/games', icon: PuzzlePieceIcon },
  { name: 'Runs', href: '/runs', icon: PlayIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation()
  
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="flex items-center">
            <PuzzlePieceIcon className="w-8 h-8 text-white" />
            <span className="ml-2 text-lg font-semibold text-white">Game Benchmark</span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <item.icon className="mr-3 w-6 h-6" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
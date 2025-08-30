// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

interface SUTStatus {
  ip: string
  port: number
  status: 'online' | 'offline' | 'busy'
  capabilities: string[]
  last_seen: string | null
  current_task: string | null
}

interface GameConfig {
  name: string
  path: string
  config_type: 'steps' | 'state_machine'
  benchmark_duration: number
  resolution: string
  preset: string
  yaml_path: string
}

interface AutomationRun {
  run_id: string
  game_name: string
  sut_ip: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'stopped'
  progress: {
    current_iteration: number
    total_iterations: number
    current_step: number
  }
  start_time: string | null
  end_time: string | null
  results: any
  error_message: string | null
}

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  suts: Record<string, SUTStatus>
  games: Record<string, GameConfig>
  activeRuns: Record<string, AutomationRun>
  runHistory: AutomationRun[]
}

const SocketContext = createContext<SocketContextType | null>(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [suts, setSuts] = useState<Record<string, SUTStatus>>({})
  const [games, setGames] = useState<Record<string, GameConfig>>({})
  const [activeRuns, setActiveRuns] = useState<Record<string, AutomationRun>>({})
  const [runHistory, setRunHistory] = useState<AutomationRun[]>([])

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to backend server')
      setConnected(true)
      toast.success('Connected to backend server')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from backend server')
      setConnected(false)
      // Only show toast on unexpected disconnection, not on initial load
      if (newSocket.connected === false && newSocket.disconnected === true) {
        toast.error('Disconnected from backend server')
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnected(false)
      // Don't show popup on connection error, just log it
      // The breathing status indicator will show the disconnected state
    })

    // Handle SUT updates
    newSocket.on('suts_update', (data: Record<string, SUTStatus>) => {
      setSuts(data)
    })

    // Handle game configuration updates
    newSocket.on('games_update', (data: Record<string, GameConfig>) => {
      setGames(data)
    })

    // Handle runs updates
    newSocket.on('runs_update', (data: { active: Record<string, AutomationRun>, history: AutomationRun[] }) => {
      setActiveRuns(data.active)
      setRunHistory(data.history)
    })

    // Handle individual run progress updates
    newSocket.on('run_progress', (data: { run_id: string, run: AutomationRun }) => {
      setActiveRuns(prev => ({
        ...prev,
        [data.run_id]: data.run
      }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const value: SocketContextType = {
    socket,
    connected,
    suts,
    games,
    activeRuns,
    runHistory
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
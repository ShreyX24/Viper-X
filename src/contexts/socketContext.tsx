// src/contexts/SocketContext.tsx - Updated for new backend compatibility
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
  hostname?: string
  unique_id?: string
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
  pairedSuts: SUTStatus[]
  errorNotifications: ErrorNotification[]
}

interface ErrorNotification {
  id: string
  type: 'file_not_found' | 'launch_failed' | 'connection_error' | 'automation_error'
  title: string
  message: string
  run_id?: string
  game_name?: string
  sut_ip?: string
  timestamp: string
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
  const [pairedSuts, setPairedSuts] = useState<SUTStatus[]>([])
  const [errorNotifications, setErrorNotifications] = useState<ErrorNotification[]>([])

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
      if (newSocket.connected === false && newSocket.disconnected === true) {
        toast.error('Disconnected from backend server')
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnected(false)
    })

    // ===== NEW BACKEND EVENTS =====
    
    // Handle initial device data (new backend format)
    newSocket.on('initial_devices', (data: { devices: any[], total_count: number, online_count: number }) => {
      console.log('Received initial devices:', data)
      const newSuts: Record<string, SUTStatus> = {}
      
      data.devices.forEach((device: any) => {
        const ip = device.ip
        newSuts[ip] = {
          ip: device.ip,
          port: device.port || 8080,
          status: device.status === 'online' ? 'online' : 'offline',
          capabilities: device.capabilities || [],
          last_seen: device.last_seen,
          current_task: null,
          hostname: device.hostname,
          unique_id: device.device_id || device.unique_id
        }
      })
      
      setSuts(newSuts)
      console.log('Updated SUTs from initial_devices:', newSuts)
    })

    // Handle device events (new backend format)
    newSocket.on('device_event', (data: { event: string, device: any, timestamp: string }) => {
      console.log('Received device event:', data)
      
      if (data.device) {
        const ip = data.device.ip
        const deviceUpdate: SUTStatus = {
          ip: data.device.ip,
          port: data.device.port || 8080,
          status: data.device.status === 'online' ? 'online' : 'offline',
          capabilities: data.device.capabilities || [],
          last_seen: data.device.last_seen,
          current_task: null,
          hostname: data.device.hostname,
          unique_id: data.device.device_id || data.device.unique_id
        }

        setSuts(prev => ({
          ...prev,
          [ip]: deviceUpdate
        }))
        
        console.log(`Device ${data.event}:`, deviceUpdate)
      }
    })

    // ===== LEGACY BACKEND COMPATIBILITY =====
    
    // Handle legacy SUT updates (old backend format)
    newSocket.on('suts_update', (data: Record<string, SUTStatus>) => {
      console.log('Received legacy suts_update:', data)
      setSuts(data)
    })

    // Handle game configuration updates
    newSocket.on('games_update', (data: Record<string, GameConfig>) => {
      console.log('Received games_update:', data)
      setGames(data)
    })

    // Handle runs updates
    newSocket.on('runs_update', (data: { active: Record<string, AutomationRun>, history: AutomationRun[] }) => {
      console.log('Received runs_update:', data)
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

    // Handle error notifications
    newSocket.on('error_notification', (data: ErrorNotification) => {
      console.log('Received error notification:', data)
      const notification = {
        ...data,
        id: Date.now().toString() // Simple ID generation
      }
      
      setErrorNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
      
      // Show toast notification
      const errorTypeLabels = {
        'file_not_found': 'File Not Found',
        'launch_failed': 'Launch Failed', 
        'connection_error': 'Connection Error',
        'automation_error': 'Automation Error'
      }
      
      toast.error(`${errorTypeLabels[data.type] || 'Error'}: ${data.message}`, {
        duration: 6000
      })
    })

    // Handle paired SUTs updates
    newSocket.on('paired_suts_update', (data: SUTStatus[]) => {
      console.log('Received paired SUTs update:', data)
      setPairedSuts(data)
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
    runHistory,
    pairedSuts,
    errorNotifications
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
// src/pages/Dashboard.tsx
import { useState } from 'react'
import { useSocket } from '../contexts/socketContext.tsx'
import { useQuery } from '@tanstack/react-query'
import { 
  Server, 
  Monitor, 
  Gamepad2, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity,
  Zap
} from 'lucide-react'
import { Card } from '../components/cards'
import { Button } from '../components/button'
import { RunStatusChart } from '../components/runStatusChart'
import { api } from '../utils/api.ts'
import toast from 'react-hot-toast'

interface ServerStatus {
  status: string
  version: string
  uptime: number
  active_runs: number
  total_suts: number
  online_suts: number
}

interface OmniparserStatus {
  status: 'online' | 'offline' | 'error'
  url?: string
  error?: string
}

export const Dashboard = () => {
  const { connected, suts, games, activeRuns, runHistory } = useSocket()
  const [selectedSut, setSelectedSut] = useState<string>('')
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [iterations, setIterations] = useState(1)

  // Get server status
  const { data: serverStatus } = useQuery<ServerStatus>({
    queryKey: ['server-status'],
    queryFn: () => api.get('/api/status').then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false, // Don't retry failed requests to avoid popups
    refetchOnWindowFocus: false
  })

  // Get omniparser status
  const { data: omniparserStatus } = useQuery<OmniparserStatus>({
    queryKey: ['omniparser-status'],
    queryFn: () => api.get('/api/omniparser/status').then(res => res.data),
    refetchInterval: 30000,
    retry: false,
    refetchOnWindowFocus: false
  })

  const onlineSuts = Object.values(suts).filter(sut => sut.status === 'online')
  const totalGames = Object.keys(games).length
  const totalActiveRuns = Object.keys(activeRuns).length
  const availableGames = Object.values(games)

  // Handle select all games
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedGames(Object.keys(games))
    } else {
      setSelectedGames([])
    }
  }

  // Handle individual game selection
  const handleGameSelection = (gameName: string, checked: boolean) => {
    if (checked) {
      const newSelection = [...selectedGames, gameName]
      setSelectedGames(newSelection)
      // If all games are now selected, update select all
      if (newSelection.length === totalGames) {
        setSelectAll(true)
      }
    } else {
      const newSelection = selectedGames.filter(name => name !== gameName)
      setSelectedGames(newSelection)
      setSelectAll(false)
    }
  }

  const handleStartRun = async () => {
    if (!selectedSut || selectedGames.length === 0 || iterations < 1) {
      toast.error('Please select a SUT, at least one game, and specify iterations')
      return
    }

    try {
      // Start runs for each selected game
      const runPromises = selectedGames.map(gameName => 
        api.post('/api/runs', {
          sut_ip: selectedSut,
          game_name: gameName,
          iterations: iterations
        })
      )
      
      const responses = await Promise.all(runPromises)
      const successCount = responses.filter(res => res.data.status === 'success').length
      
      if (successCount === selectedGames.length) {
        toast.success(`Started ${successCount} automation run${successCount > 1 ? 's' : ''} successfully`)
        // Reset form
        setSelectedSut('')
        setSelectedGames([])
        setSelectAll(false)
        setIterations(1)
      } else {
        toast.error(`Started ${successCount}/${selectedGames.length} runs. Some failed to start.`)
      }
    } catch (error) {
      console.error('Failed to start runs:', error)
      toast.error('Failed to start automation runs')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600'
      case 'offline': return 'text-red-600'
      case 'busy': return 'text-yellow-600'
      case 'running': return 'text-blue-600'
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'offline': return <XCircle className="w-5 h-5 text-red-600" />
      case 'busy': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'running': return <Play className="w-5 h-5 text-blue-600" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}></div>
          <span className={`text-sm transition-colors ${connected ? 'text-gray-600' : 'text-red-600 font-medium'}`}>
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Server className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Backend Server</p>
              <p className="text-2xl font-semibold text-gray-900">
                {serverStatus?.status === 'running' ? 'Online' : 'Offline'}
              </p>
              {serverStatus && (
                <p className="text-sm text-gray-500">v{serverStatus.version}</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Monitor className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Online SUTs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {onlineSuts.length} / {Object.keys(suts).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gamepad2 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Game Configs</p>
              <p className="text-2xl font-semibold text-gray-900">{totalGames}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Runs</p>
              <p className="text-2xl font-semibold text-gray-900">{totalActiveRuns}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Omniparser Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Omniparser Server</h3>
              <p className="text-sm text-gray-600">Image Processing Service</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(omniparserStatus?.status || 'offline')}
            <span className={`ml-2 font-medium ${getStatusColor(omniparserStatus?.status || 'offline')}`}>
              {omniparserStatus?.status?.toUpperCase() || 'CHECKING...'}
            </span>
          </div>
        </div>
        {omniparserStatus?.url && (
          <p className="text-xs text-gray-500 mt-2">URL: {omniparserStatus.url}</p>
        )}
        {omniparserStatus?.error && (
          <p className="text-xs text-red-500 mt-2">Error: {omniparserStatus.error}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Start */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Quick Start Automation</h3>
          
          <div className="space-y-4">
            {/* SUT Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select SUT
              </label>
              <select
                value={selectedSut}
                onChange={(e) => setSelectedSut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose a SUT...</option>
                {onlineSuts.map((sut) => (
                  <option key={sut.ip} value={sut.ip}>
                    {sut.ip} ({sut.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Game Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Games ({selectedGames.length} selected)
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all-games"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="select-all-games" className="ml-2 text-sm text-gray-600">
                    Select All
                  </label>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                {availableGames.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No games available</p>
                ) : (
                  <div className="space-y-2">
                    {availableGames.map((game) => (
                      <div key={game.name} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`game-${game.name}`}
                          checked={selectedGames.includes(game.name)}
                          onChange={(e) => handleGameSelection(game.name, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`game-${game.name}`} className="ml-2 text-sm flex-1">
                          <span className="font-medium">{game.name}</span>
                          <span className="text-gray-500 ml-2">({game.config_type})</span>
                          <div className="text-xs text-gray-400">
                            {game.resolution} • {game.preset} • ~{game.benchmark_duration}s
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedGames.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    <strong>Selected games:</strong> {selectedGames.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Iterations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Runs (per game)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {selectedGames.length > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  Total runs: {selectedGames.length} × {iterations} = {selectedGames.length * iterations}
                </p>
              )}
            </div>

            <Button
              onClick={handleStartRun}
              disabled={!selectedSut || selectedGames.length === 0 || !connected}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Automation Run{selectedGames.length > 1 ? 's' : ''} 
              {selectedGames.length > 1 && ` (${selectedGames.length} games)`}
            </Button>
            
            {!connected && (
              <p className="text-xs text-red-600 text-center">
                Cannot start automation while disconnected from backend
              </p>
            )}
          </div>
        </Card>

        {/* Run Status Chart */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Run Statistics</h3>
          <RunStatusChart runs={runHistory} />
        </Card>
      </div>

      {/* Active Runs */}
      {totalActiveRuns > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Active Runs</h3>
          <div className="space-y-3">
            {Object.values(activeRuns).map((run) => (
              <div key={run.run_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{run.game_name}</p>
                  <p className="text-sm text-gray-600">SUT: {run.sut_ip}</p>
                  <p className="text-sm text-gray-600">
                    Progress: {run.progress.current_iteration}/{run.progress.total_iterations}
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(run.status)}
                  <span className={`ml-2 font-medium ${getStatusColor(run.status)}`}>
                    {run.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
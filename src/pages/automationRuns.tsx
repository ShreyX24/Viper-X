// src/pages/AutomationRuns.tsx
import { useState } from 'react'
import { useSocket } from '../contexts/socketContext'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/cards'
import { Button } from '../components/button'
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Eye,
  Download 
} from 'lucide-react'
import { api } from '../utils/api'
import { formatDistanceToNow, format } from 'date-fns'

export const AutomationRuns = () => {
  const { activeRuns, runHistory } = useSocket()
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active')

  const { data: runs, refetch } = useQuery({
    queryKey: ['runs'],
    queryFn: () => api.get('/api/runs').then(res => res.data),
    refetchInterval: 5000 // Refresh every 5 seconds
  })

  const handleStopRun = async (runId: string) => {
    try {
      await api.post(`/api/runs/${runId}/stop`)
      refetch()
    } catch (error) {
      console.error('Failed to stop run:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-5 h-5 text-blue-600" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />
      case 'stopped': return <Square className="w-5 h-5 text-yellow-600" />
      case 'queued': return <Clock className="w-5 h-5 text-gray-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'stopped': return 'text-yellow-600 bg-yellow-100'
      case 'queued': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const calculateDuration = (start: string | null, end: string | null) => {
    if (!start) return 'Not started'
    if (!end) return `Running for ${formatDistanceToNow(new Date(start))}`
    
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const activeRunsList = Object.values(activeRuns)
  const historyList = runHistory

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Automation Runs</h1>
        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'active'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Runs ({activeRunsList.length})
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History ({historyList.length})
          </button>
        </nav>
      </div>

      {/* Active Runs */}
      {selectedTab === 'active' && (
        <div className="space-y-4">
          {activeRunsList.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active automation runs</p>
              </div>
            </Card>
          ) : (
            activeRunsList.map((run) => (
              <Card key={run.run_id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(run.status)}
                    <div>
                      <h3 className="text-lg font-semibold">{run.game_name}</h3>
                      <p className="text-sm text-gray-600">SUT: {run.sut_ip}</p>
                      <p className="text-sm text-gray-600">
                        Progress: {run.progress.current_iteration}/{run.progress.total_iterations} runs
                      </p>
                      {run.progress.current_step > 0 && (
                        <p className="text-xs text-gray-500">Step: {run.progress.current_step}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(run.status)}`}>
                      {run.status.toUpperCase()}
                    </span>
                    
                    {run.status === 'running' && (
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleStopRun(run.run_id)}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
                
                {run.status === 'running' && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(run.progress.current_iteration / run.progress.total_iterations) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Run History */}
      {selectedTab === 'history' && (
        <div className="space-y-4">
          {historyList.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No run history available</p>
              </div>
            </Card>
          ) : (
            historyList.slice().reverse().map((run) => (
              <Card key={run.run_id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(run.status)}
                    <div>
                      <h3 className="text-lg font-semibold">{run.game_name}</h3>
                      <p className="text-sm text-gray-600">SUT: {run.sut_ip}</p>
                      <p className="text-sm text-gray-600">
                        Completed: {run.progress.current_iteration}/{run.progress.total_iterations} runs
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {calculateDuration(run.start_time, run.end_time)}
                      </p>
                      {run.start_time && (
                        <p className="text-xs text-gray-500">
                          Started: {format(new Date(run.start_time), 'MMM d, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(run.status)}`}>
                      {run.status.toUpperCase()}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Logs
                      </Button>
                      
                      {run.results && (
                        <Button variant="secondary" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {run.results && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Success Rate</p>
                        <p className="font-semibold">
                          {Math.round((run.results.success_rate || 0) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Successful</p>
                        <p className="font-semibold">{run.results.successful_runs || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-semibold">{run.results.total_iterations || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Run Dir</p>
                        <p className="font-semibold text-xs" title={run.results.run_directory}>
                          {run.results.run_directory?.split('/').pop()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {run.error_message && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">Error: {run.error_message}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
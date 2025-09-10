// Enhanced SUTManagement.tsx with unique IDs and history
import { useState } from 'react'
import { useSocket } from '../contexts/socketContext'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/cards'
import { Button } from '../components/button'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Search,
  History,
  Monitor,
  Cpu,
  HardDrive,
  Eye,
  Trash2
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { api } from '../utils/api'

interface SUTHistory {
  timestamp: string
  status: string
  event_type: string
  details: any
}

export const SUTManagement = () => {
  const { suts } = useSocket()
  const [selectedSUT, setSelectedSUT] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  // Query for SUT history
  const { data: sutHistory, refetch: refetchHistory } = useQuery<{history: SUTHistory[]}>({
    queryKey: ['sut-history', selectedSUT],
    queryFn: () => selectedSUT ? api.get(`/api/suts/history/${selectedSUT}`).then(res => res.data) : Promise.resolve({history: []}),
    enabled: !!selectedSUT && showHistory
  })

  const handleNetworkScan = async () => {
    try {
      await api.post('/api/suts/scan')
      // The scan runs in background, results will come via WebSocket
    } catch (error) {
      console.error('Failed to trigger network scan:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'offline': return <XCircle className="w-5 h-5 text-red-600" />
      case 'busy': return <Clock className="w-5 h-5 text-yellow-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'offline': return 'text-red-600 bg-red-100'
      case 'busy': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const onlineSUTs = Object.values(suts).filter(sut => sut.status === 'online')
  const offlineSUTs = Object.values(suts).filter(sut => sut.status === 'offline')
  const busySUTs = Object.values(suts).filter(sut => sut.status === 'busy')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">SUT Management</h1>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleNetworkScan}>
            <Search className="w-4 h-4 mr-2" />
            Scan Network
          </Button>
          <Button variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Online SUTs</p>
              <p className="text-2xl font-semibold text-green-900">{onlineSUTs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Offline SUTs</p>
              <p className="text-2xl font-semibold text-red-900">{offlineSUTs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Busy SUTs</p>
              <p className="text-2xl font-semibold text-yellow-900">{busySUTs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50">
          <div className="flex items-center">
            <Monitor className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total SUTs</p>
              <p className="text-2xl font-semibold text-blue-900">{Object.keys(suts).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SUT List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(suts).map((sut) => (
          <Card key={sut.sut_id || sut.ip} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {getStatusIcon(sut.status)}
                  <h3 className="ml-2 text-lg font-semibold">{sut.name || `SUT-${sut.sut_id?.slice(0, 8)}`}</h3>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>IP:</strong> {sut.ip}:{sut.port}
                  </p>
                  
                  {sut.sut_id && (
                    <p className="text-xs text-gray-500 font-mono">
                      ID: {sut.sut_id.slice(0, 12)}...
                    </p>
                  )}
                  
                  {sut.version && (
                    <p className="text-xs text-gray-500">
                      Version: {sut.version}
                    </p>
                  )}
                  
                  <div className="mt-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sut.status)}`}>
                      {sut.status.toUpperCase()}
                    </span>
                  </div>

                  {sut.current_task && (
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Current:</strong> {sut.current_task}
                    </p>
                  )}

                  {/* System Information */}
                  {sut.system_info && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {sut.system_info.hostname && (
                          <div className="flex items-center">
                            <Monitor className="w-3 h-3 mr-1" />
                            <span className="truncate">{sut.system_info.hostname}</span>
                          </div>
                        )}
                        {sut.system_info.cpu_count && (
                          <div className="flex items-center">
                            <Cpu className="w-3 h-3 mr-1" />
                            <span>{sut.system_info.cpu_count} cores</span>
                          </div>
                        )}
                        {sut.system_info.total_memory && (
                          <div className="flex items-center">
                            <HardDrive className="w-3 h-3 mr-1" />
                            <span>{formatBytes(sut.system_info.total_memory)}</span>
                          </div>
                        )}
                        {sut.system_info.platform && (
                          <div className="col-span-2 text-gray-600">
                            <span className="truncate">{sut.system_info.platform}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Capabilities */}
                  {sut.capabilities && sut.capabilities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-700 font-medium mb-1">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {sut.capabilities.slice(0, 3).map((cap) => (
                          <span key={cap} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {cap.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {sut.capabilities.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{sut.capabilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p>
                      <strong>Last seen:</strong>{' '}
                      {sut.last_seen 
                        ? formatDistanceToNow(new Date(sut.last_seen), { addSuffix: true })
                        : 'Never'
                      }
                    </p>
                    {sut.first_seen && (
                      <p>
                        <strong>First seen:</strong>{' '}
                        {format(new Date(sut.first_seen), 'MMM d, yyyy HH:mm')}
                      </p>
                    )}
                    {sut.total_connections && (
                      <p>
                        <strong>Connections:</strong> {sut.total_connections}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedSUT(sut.sut_id || sut.ip)
                        setShowHistory(true)
                      }}
                    >
                      <History className="w-4 h-4 mr-1" />
                      History
                    </Button>
                    
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* History Modal */}
      {showHistory && selectedSUT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                SUT History - {suts[selectedSUT]?.name || selectedSUT}
              </h2>
              <button
                onClick={() => {
                  setShowHistory(false)
                  setSelectedSUT(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {sutHistory?.history?.length ? (
                <div className="space-y-3">
                  {sutHistory.history.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {event.event_type === 'registration' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {event.event_type === 'heartbeat' && <Clock className="w-5 h-5 text-blue-600" />}
                        {event.event_type === 'disconnect' && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</p>
                          <span className="text-xs text-gray-500">
                            {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm:ss')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Status: {event.status}</p>
                        {event.details && Object.keys(event.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">View Details</summary>
                            <pre className="text-xs text-gray-500 mt-1 bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No history available for this SUT</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {Object.keys(suts).length === 0 && (
        <Card>
          <div className="text-center py-6">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No SUTs discovered yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Make sure SUT services are running and click "Scan Network" to discover them.
            </p>
            <Button className="mt-4" variant="primary" onClick={handleNetworkScan}>
              <Search className="w-4 h-4 mr-2" />
              Scan Network Now
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
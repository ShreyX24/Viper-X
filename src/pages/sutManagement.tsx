// src/pages/SUTManagement.tsx
import { useSocket } from '../contexts/socketContext'
import { Card } from '../components/cards'
import { Button } from '../components/button'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const SUTManagement = () => {
  const { suts } = useSocket()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">SUT Management</h1>
        <Button variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Discovery
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(suts).map((sut) => (
          <Card key={sut.ip}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  {getStatusIcon(sut.status)}
                  <h3 className="ml-2 text-lg font-semibold">{sut.ip}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Port: {sut.port}</p>
                
                <div className="mt-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sut.status)}`}>
                    {sut.status.toUpperCase()}
                  </span>
                </div>

                {sut.current_task && (
                  <p className="text-sm text-blue-600 mt-2">
                    Current: {sut.current_task}
                  </p>
                )}

                <div className="mt-3">
                  <p className="text-xs text-gray-500">
                    Last seen: {sut.last_seen ? formatDistanceToNow(new Date(sut.last_seen), { addSuffix: true }) : 'Never'}
                  </p>
                </div>

                {sut.capabilities && sut.capabilities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-700 font-medium">Capabilities:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sut.capabilities.map((cap) => (
                        <span key={cap} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {Object.keys(suts).length === 0 && (
        <Card>
          <div className="text-center py-6">
            <p className="text-gray-500">No SUTs discovered yet. Make sure SUT services are running.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
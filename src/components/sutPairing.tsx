// src/components/SutPairing.tsx
import { useState } from 'react'
import { useSocket } from '../contexts/socketContext'
import { api } from '../utils/api'
import { Button } from './button'
import { Card } from './cards'
import { 
  Wifi, 
  WifiOff, 
  Settings,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export const SutPairing = () => {
  const { suts, pairedSuts } = useSocket()
  const [editingNickname, setEditingNickname] = useState<string | null>(null)
  const [newNickname, setNewNickname] = useState('')

  const handlePairSut = async (deviceId: string, nickname?: string) => {
    try {
      await api.post('/api/suts/pair', {
        device_id: deviceId,
        nickname: nickname || ''
      })
      toast.success('SUT paired successfully!')
    } catch (error: any) {
      console.error('Failed to pair SUT:', error)
      toast.error('Failed to pair SUT: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleUnpairSut = async (deviceId: string) => {
    try {
      await api.post(`/api/suts/unpair/${deviceId}`)
      toast.success('SUT unpaired successfully!')
    } catch (error: any) {
      console.error('Failed to unpair SUT:', error)
      toast.error('Failed to unpair SUT: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleUpdateNickname = async (deviceId: string) => {
    try {
      await api.put(`/api/suts/${deviceId}/nickname`, {
        nickname: newNickname
      })
      setEditingNickname(null)
      setNewNickname('')
      toast.success('Nickname updated successfully!')
    } catch (error: any) {
      console.error('Failed to update nickname:', error)
      toast.error('Failed to update nickname: ' + (error.response?.data?.error || error.message))
    }
  }

  const startEditingNickname = (deviceId: string, currentNickname: string) => {
    setEditingNickname(deviceId)
    setNewNickname(currentNickname || '')
  }

  const cancelEditing = () => {
    setEditingNickname(null)
    setNewNickname('')
  }

  const onlineSuts = Object.values(suts).filter(sut => sut.status === 'online')
  const pairedSutIds = new Set(pairedSuts.map(sut => sut.unique_id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">SUT Pairing</h2>
        <div className="text-sm text-gray-500">
          {pairedSuts.length} paired • {onlineSuts.length} online
        </div>
      </div>

      {/* Paired SUTs */}
      {pairedSuts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Paired SUTs</h3>
          <div className="grid gap-4">
            {pairedSuts.map((sut) => (
              <Card key={sut.unique_id || sut.ip}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {sut.status === 'online' ? (
                        <Wifi className="w-6 h-6 text-green-600" />
                      ) : (
                        <WifiOff className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      {editingNickname === sut.unique_id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newNickname}
                            onChange={(e) => setNewNickname(e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter nickname"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateNickname(sut.unique_id!)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-gray-900">
                            {(sut as any).nickname || sut.hostname || sut.ip}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {sut.ip}:{sut.port} • {sut.hostname}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sut.status === 'online' 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-red-700 bg-red-100'
                    }`}>
                      {sut.status.toUpperCase()}
                    </span>
                    
                    <button
                      onClick={() => startEditingNickname(sut.unique_id!, (sut as any).nickname)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Edit nickname"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleUnpairSut(sut.unique_id!)}
                      className="text-red-600 hover:text-red-800"
                      title="Unpair SUT"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available SUTs (not paired) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Available SUTs</h3>
        {onlineSuts.filter(sut => !pairedSutIds.has(sut.unique_id || sut.ip)).length > 0 ? (
          <div className="grid gap-4">
            {onlineSuts
              .filter(sut => !pairedSutIds.has(sut.unique_id || sut.ip))
              .map((sut) => (
                <Card key={sut.unique_id || sut.ip}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {sut.hostname || sut.ip}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {sut.ip}:{sut.port}
                        </p>
                        {sut.capabilities && sut.capabilities.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Capabilities: {sut.capabilities.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        ONLINE
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handlePairSut(sut.unique_id || sut.ip, sut.hostname)}
                      >
                        <Wifi className="w-4 h-4 mr-1" />
                        Pair
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-6">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No available SUTs to pair</p>
              <p className="text-sm text-gray-400 mt-1">
                All online SUTs are already paired, or no SUTs are currently online
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
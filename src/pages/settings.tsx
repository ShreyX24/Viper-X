// src/pages/Settings.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/cards";
import { Button } from "../components/button";
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";
import { api } from "../utils/api";

export const Settings = () => {
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
  const [omniparserUrl, setOmniparserUrl] = useState('http://localhost:8000')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)

  const { data: serverStatus } = useQuery({
    queryKey: ['server-status'],
    queryFn: () => api.get('/api/status').then(res => res.data),
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  })

  const handleSaveSettings = () => {
    // In a real implementation, you might save these to localStorage
    // or send them to the backend
    localStorage.setItem('settings', JSON.stringify({
      backendUrl,
      omniparserUrl,
      autoRefresh,
      refreshInterval
    }))
    
    // Show success message
    alert('Settings saved successfully!')
  }

  const handleResetSettings = () => {
    setBackendUrl('http://localhost:5000')
    setOmniparserUrl('http://localhost:8000')
    setAutoRefresh(true)
    setRefreshInterval(5)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Settings */}
        <Card>
          <div className="flex items-center mb-4">
            <SettingsIcon className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-lg font-semibold">Connection Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backend Server URL
              </label>
              <input
                type="url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="http://localhost:5000"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL of the main backend server
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Omniparser Server URL
              </label>
              <input
                type="url"
                value={omniparserUrl}
                onChange={(e) => setOmniparserUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="http://localhost:8000"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL of the image processing server
              </p>
            </div>
          </div>
        </Card>

        {/* UI Settings */}
        <Card>
          <div className="flex items-center mb-4">
            <RefreshCw className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-lg font-semibold">UI Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Auto-refresh Data
                </label>
                <p className="text-xs text-gray-500">
                  Automatically refresh status information
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 5)}
                disabled={!autoRefresh}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>
        </Card>

        {/* Server Information */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Server Information</h3>
          
          {serverStatus ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium text-green-600">
                  {serverStatus.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version:</span>
                <span className="text-sm font-medium">{serverStatus.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Runs:</span>
                <span className="text-sm font-medium">{serverStatus.active_runs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Online SUTs:</span>
                <span className="text-sm font-medium">
                  {serverStatus.online_suts}/{serverStatus.total_suts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime:</span>
                <span className="text-sm font-medium">
                  {Math.floor(serverStatus.uptime / 3600)}h {Math.floor((serverStatus.uptime % 3600) / 60)}m
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Unable to connect to server</p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          
          <div className="space-y-3">
            <Button onClick={handleSaveSettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            
            <Button variant="secondary" onClick={handleResetSettings} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h4>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Frontend Build: {import.meta.env.MODE}</p>
              <p>API Base URL: {import.meta.env.VITE_BACKEND_URL}</p>
              <p>User Agent: {navigator.userAgent.split(' ').slice(0, 3).join(' ')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

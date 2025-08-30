// src/App.tsx
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './contexts/socketContext.tsx'
import { Sidebar } from './components/sidebar'
import { Header } from './components/header'
import { Dashboard } from './pages/dashboard.tsx'
import { SUTManagement } from './pages/sutManagement'
import { GameConfigurations } from './pages/gameConfigurations'
import { AutomationRuns } from './pages/automationRuns'
import { Settings } from './pages/settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Router>
          <div className="flex h-screen bg-gray-100">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header onMenuClick={() => setSidebarOpen(true)} />
              
              <main className="flex-1 overflow-auto p-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/suts" element={<SUTManagement />} />
                  <Route path="/games" element={<GameConfigurations />} />
                  <Route path="/runs" element={<AutomationRuns />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: '400px',
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </SocketProvider>
    </QueryClientProvider>
  )
}

export default App
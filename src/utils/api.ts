// src/utils/api.ts
import axios from 'axios'
import toast from 'react-hot-toast'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Only show toasts for actual HTTP errors, not connection issues
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error'
      toast.error(`Error: ${message}`)
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout - Backend server may be unavailable')
    }
    // Don't show toast for network connection errors (ECONNREFUSED, etc.)
    // as these will be handled by the breathing status indicator
    
    return Promise.reject(error)
  }
)

export default api
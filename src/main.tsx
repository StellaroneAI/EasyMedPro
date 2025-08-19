import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ABHAProvider } from './contexts/ABHAContext'
import './index.css'
import { liveUpdateService } from './services/liveUpdateService'
import { taskScheduler } from './services/taskScheduler'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> - Temporarily disabled for debugging
    <ABHAProvider>
      <App />
    </ABHAProvider>
  // </React.StrictMode>,
)

// Connect to live update stream (WebSocket)
// liveUpdateService.connect(import.meta.env.VITE_LIVE_UPDATE_URL || 'ws://localhost:8080')

// Example of mapping cron-style tasks to in-app scheduler
// taskScheduler.scheduleInterval('heartbeat', () => {
//   console.log('Heartbeat task executed')
// }, 60000)

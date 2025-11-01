import { useState } from 'react'
import Route from './routes/route'
import useAuthCleanup from './hooks/useAuthCleanup'
import { ToastProvider } from './components/toast/Toast'

import './App.css'

function App() {
  // Initialize auth cleanup hook
  useAuthCleanup();

  return (
    <ToastProvider>
      <div>
        <Route />
      </div>
    </ToastProvider>
  )
}

export default App

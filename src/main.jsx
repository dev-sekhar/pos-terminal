import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { BranchProvider } from './context/BranchContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BranchProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </BranchProvider>
)

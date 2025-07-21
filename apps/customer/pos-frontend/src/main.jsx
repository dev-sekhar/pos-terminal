import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { BranchProvider } from './context/BranchContext'
import { TenantProvider } from './context/TenantContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <TenantProvider>
    <BranchProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BranchProvider>
  </TenantProvider>
)

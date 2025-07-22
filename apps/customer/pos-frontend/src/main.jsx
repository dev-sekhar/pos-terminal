import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { BranchProvider } from './context/BranchContext'
import { TenantProvider } from './context/TenantContext'
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TenantProvider>
      <UserProvider>
        <BranchProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </BranchProvider>
      </UserProvider>
    </TenantProvider>
  </React.StrictMode>
)

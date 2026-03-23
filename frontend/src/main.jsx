import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import AuthContextProvider from '../context'
import { getStoredUser } from '../storage'

const user = getStoredUser()
const role = user?.role ?? ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider
        context={{}}
        user={user}
        role={role}
        me={user}
        loading={false}
      >
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
)

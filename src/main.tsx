import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AdminApp from './AdminApp'
import './styles.css'
import './admin.css'

const Page = window.location.pathname.startsWith('/clubhouse-admin') ? AdminApp : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)

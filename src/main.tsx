import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AdminApp from './AdminApp'
import LegalPage from './LegalPage'
import FavoritesPage from './FavoritesPage'
import ReviewerApp from './ReviewerApp'
import GettingStartedPage from './GettingStartedPage'
import './styles.css'
import './admin.css'
import './reviewer.css'

const primaryHost = 'vibecodekids.com'
const alternateHosts = new Set(['www.vibecodekids.com', 'vibecodeclub.org', 'www.vibecodeclub.org'])

if (alternateHosts.has(window.location.hostname)) {
  const primaryUrl = new URL(window.location.href)
  primaryUrl.protocol = 'https:'
  primaryUrl.hostname = primaryHost
  primaryUrl.port = ''
  window.location.replace(primaryUrl)
} else {
  const Page = window.location.pathname.startsWith('/clubhouse-admin')
    ? AdminApp
      : window.location.pathname.startsWith('/review') ? ReviewerApp
      : window.location.pathname.startsWith('/getting-started') ? GettingStartedPage
      : window.location.pathname.startsWith('/legal') ? LegalPage
      : window.location.pathname.startsWith('/favorites') ? FavoritesPage : App

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Page />
    </StrictMode>,
  )
}

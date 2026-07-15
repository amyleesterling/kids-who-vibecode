import { useEffect } from 'react'

const sessionKey = 'vck_visit_counted'
let recordedThisPage = false

export default function VisitCounter() {
  useEffect(() => {
    if (recordedThisPage) return
    recordedThisPage = true

    try {
      if (window.sessionStorage.getItem(sessionKey)) return
      window.sessionStorage.setItem(sessionKey, '1')
    } catch {
      // Count the page load when session storage is unavailable.
    }

    fetch('/api/visits', { method: 'POST', keepalive: true }).catch(() => undefined)
  }, [])

  return null
}

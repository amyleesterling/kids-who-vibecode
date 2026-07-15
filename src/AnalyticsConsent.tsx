import { useEffect, useState } from 'react'

const measurementId = 'G-CKMNKY2T5N'
const consentKey = 'vck_analytics_consent'
const mobileQuery = '(max-width: 720px), (pointer: coarse)'

type AnalyticsChoice = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

function loadAnalytics() {
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args))
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  })
  window.gtag('consent', 'update', { analytics_storage: 'granted' })

  if (!document.getElementById('google-analytics')) {
    const script = document.createElement('script')
    script.id = 'google-analytics'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })
}

function denyAnalytics() {
  window.gtag?.('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  })
}

export default function AnalyticsConsent() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(mobileQuery).matches)
  const [choice, setChoice] = useState<AnalyticsChoice | null>(() => {
    const saved = window.localStorage.getItem(consentKey)
    return saved === 'granted' || saved === 'denied' ? saved : null
  })

  useEffect(() => {
    const media = window.matchMedia(mobileQuery)
    const update = () => setIsMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (isMobile) {
      denyAnalytics()
      document.getElementById('google-analytics')?.remove()
      return
    }
    if (choice === 'granted') loadAnalytics()
  }, [choice, isMobile])

  function saveChoice(nextChoice: AnalyticsChoice) {
    window.localStorage.setItem(consentKey, nextChoice)
    if (nextChoice === 'denied') denyAnalytics()
    setChoice(nextChoice)
  }

  if (isMobile) return null

  if (choice) {
    return <button className="analytics-settings" type="button" onClick={() => setChoice(null)}>Analytics settings</button>
  }

  return (
    <aside className="analytics-consent" aria-label="Analytics choice">
      <div><b>Optional, privacy-minded analytics</b><span>Help us understand which public pages are useful. Google Analytics starts only if you allow it, and we never send form contents or email addresses.</span></div>
      <div><button className="button button-dark" type="button" onClick={() => saveChoice('granted')}>Allow analytics</button><button className="analytics-decline" type="button" onClick={() => saveChoice('denied')}>No thanks</button><a href="/legal#privacy">Privacy details</a></div>
    </aside>
  )
}

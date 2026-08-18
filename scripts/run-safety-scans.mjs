import OpenAI from 'openai'
import { chromium } from 'playwright'

const siteUrl = (process.env.SAFETY_SITE_URL || 'https://vibecodekids.com').replace(/\/$/, '')
const runnerSecret = process.env.SAFETY_SCAN_SECRET || ''
const apiKey = process.env.OPENAI_API_KEY || ''
const playthroughModel = process.env.OPENAI_PLAYTHROUGH_MODEL || 'gpt-5.6-luna'
const maxSteps = 8
const allowedKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'])
const safetyPromptVersion = 'safety-agent-2027.1'
const playtestPromptVersion = 'technical-playtest-2027.1'

if (!runnerSecret || !apiKey) {
  console.log('AI safety playthroughs are not enabled. Add SAFETY_SCAN_SECRET and OPENAI_API_KEY as repository secrets.')
  process.exit(0)
}

const openai = new OpenAI({ apiKey })

function privateOrLocalHostname(hostname) {
  const value = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (value === 'localhost' || value.endsWith('.localhost') || value.endsWith('.local')) return true
  if (value === '::1' || value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) return true
  const parts = value.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false
  return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
}

function containsPersonalInformation(value) {
  return /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value) || /(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/.test(value)
}

async function siteRequest(path, options = {}) {
  const response = await fetch(`${siteUrl}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${runnerSecret}`,
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Safety API ${response.status}: ${detail.slice(0, 500)}`)
  }
  return response
}

async function claimScans() {
  const response = await siteRequest('/api/safety/queue')
  const result = await response.json()
  return Array.isArray(result.scans) ? result.scans : []
}

async function recordResult(result) {
  await siteRequest('/api/safety/results', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(result),
  })
}

function dataUrl(buffer) {
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

function activeCategories(result) {
  return Object.entries(result.categories || {}).filter(([, active]) => active).map(([category]) => category)
}

async function moderateState(scan, screenshotUrl, visibleText) {
  const result = await openai.moderations.create({
    model: 'omni-moderation-latest',
    input: [
      { type: 'text', text: `Kid-focused coding project: ${scan.projectTitle}\n${scan.description}\nVisible page text:\n${visibleText.slice(0, 12_000)}` },
      { type: 'image_url', image_url: { url: screenshotUrl } },
    ],
  })
  const moderation = result.results[0]
  return { flagged: Boolean(moderation?.flagged), categories: activeCategories(moderation || {}) }
}

async function interactiveElements(page, originalOrigin) {
  return page.evaluate((origin) => {
    document.querySelectorAll('[data-vibe-safety-id]').forEach((element) => element.removeAttribute('data-vibe-safety-id'))
    const candidates = [...document.querySelectorAll('button, a[href], [role="button"], input[type="button"], input[type="submit"], canvas')]
    return candidates.flatMap((element, index) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      if (rect.width < 8 || rect.height < 8 || style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return []
      const href = element instanceof HTMLAnchorElement ? element.href : ''
      const external = href ? new URL(href, location.href).origin !== origin : false
      const id = String(index)
      element.setAttribute('data-vibe-safety-id', id)
      return [{
        id,
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role') || '',
        type: element.getAttribute('type') || '',
        text: (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 160),
        href: href.slice(0, 300),
        external,
        disabled: 'disabled' in element ? Boolean(element.disabled) : false,
      }]
    }).slice(0, 80)
  }, originalOrigin)
}

async function chooseAction(scan, screenshotUrl, elements, history) {
  const response = await openai.responses.create({
    model: playthroughModel,
    store: false,
    reasoning: { effort: 'low' },
    input: [{
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `You are safely playtesting a child-made browser experience for a parent-supervised coding club. Explore the experience broadly enough to reveal hidden states, dialogue, endings, and surprises. Choose exactly one next action. Never follow an external link, submit a form, enter personal information, make a purchase, download anything, grant permissions, or sign in. Prefer untried game buttons and controls. Keyboard actions may use only ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space, or Enter. Finish when the meaningful states appear covered.\n\nProject: ${scan.projectTitle}\nDescription: ${scan.description}\nPrevious actions: ${JSON.stringify(history.slice(-8))}\nVisible interactive elements: ${JSON.stringify(elements)}`,
        },
        { type: 'input_image', image_url: screenshotUrl },
      ],
    }],
    text: {
      format: {
        type: 'json_schema',
        name: 'playthrough_action',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            action: { type: 'string', enum: ['click', 'press_key', 'wait', 'finish'] },
            targetId: { type: ['string', 'null'] },
            key: { type: ['string', 'null'] },
            reason: { type: 'string' },
          },
          required: ['action', 'targetId', 'key', 'reason'],
        },
      },
    },
  })
  return JSON.parse(response.output_text)
}

async function finalAssessment(scan, actions, categories, technicalFlags, textSamples) {
  const response = await openai.responses.create({
    model: playthroughModel,
    store: false,
    reasoning: { effort: 'low' },
    input: `Act as a conservative child-safety reviewer for ages 5–15. Review this automated browser playthrough. Send anything uncertain to a grown-up; never claim complete coverage. Look beyond policy violations for profanity, sexual material, graphic or scary content, self-harm, bullying, hate, dangerous instructions, drugs, gambling, manipulative purchases, ads, contact with strangers, requests for personal data, downloads, off-site navigation, deceptive UI, and age-inappropriate themes.\n\nProject: ${scan.projectTitle}\nDescription: ${scan.description}\nModeration categories: ${JSON.stringify([...categories])}\nCoverage limits: ${JSON.stringify([...technicalFlags])}\nActions: ${JSON.stringify(actions)}\nVisible text samples: ${JSON.stringify(textSamples.map((text) => text.slice(0, 2500)))}`,
    text: {
      format: {
        type: 'json_schema',
        name: 'child_safety_assessment',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            verdict: { type: 'string', enum: ['pass', 'review'] },
            summary: { type: 'string' },
            concerns: { type: 'array', items: { type: 'string' } },
          },
          required: ['verdict', 'summary', 'concerns'],
        },
      },
    },
  })
  return JSON.parse(response.output_text)
}

async function scanExperience(browser, scan) {
  const target = new URL(scan.targetUrl)
  if (target.protocol !== 'https:') throw new Error('Only HTTPS playable links can be scanned.')

  const technicalFlags = new Set()
  const moderationCategories = new Set()
  const redSignals = new Set()
  const actions = []
  const textSamples = []
  const networkFindings = []
  const consoleFindings = []
  const observations = {
    audio: 0, video: 0, iframes: 0, passwordInputs: 0, textInputs: 0, forms: 0,
    fileInputs: 0, externalNavigation: 0, thirdPartyRequests: 0, trackerRequests: 0,
    downloads: 0, popups: 0, permissionLanguage: 0, commerceLanguage: 0,
    loginLanguage: 0, chatLanguage: 0, personalInformation: 0, exposedSecrets: 0,
    maximumInteractiveElements: 0,
  }
  let screenshotsReviewed = 0
  let anyModerationFlag = false
  let finishedNaturally = false
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    acceptDownloads: false,
    serviceWorkers: 'block',
    permissions: [],
  })
  const page = await context.newPage()
  page.setDefaultTimeout(5_000)
  page.on('console', (message) => {
    if (consoleFindings.length < 100) consoleFindings.push({ type: message.type(), text: message.text().slice(0, 500) })
  })
  page.on('requestfailed', (request) => {
    if (networkFindings.length < 200) networkFindings.push({ url: request.url().slice(0, 500), resourceType: request.resourceType(), action: 'failed', reason: request.failure()?.errorText || 'unknown' })
  })
  page.on('dialog', async (dialog) => {
    actions.push({ action: 'dialog', target: dialog.type(), result: dialog.message().slice(0, 300) })
    await dialog.dismiss().catch(() => undefined)
  })
  page.on('download', async (download) => {
    observations.downloads += 1
    redSignals.add('malware_or_deceptive_download')
    technicalFlags.add('The experience attempted a file download; the download was blocked.')
    await download.cancel().catch(() => undefined)
  })
  page.on('popup', async (popup) => {
    observations.popups += 1
    technicalFlags.add('The experience opened a new window; it was closed without exploration.')
    await popup.close().catch(() => undefined)
  })
  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = request.url()
    let parsed
    try { parsed = new URL(url) } catch {
      technicalFlags.add('Blocked a malformed network request.')
      return route.abort()
    }
    if (!['https:', 'http:', 'data:', 'blob:'].includes(parsed.protocol)) {
      technicalFlags.add(`Blocked a ${parsed.protocol.replace(':', '')} request.`)
      if (networkFindings.length < 200) networkFindings.push({ url: url.slice(0, 500), resourceType: request.resourceType(), action: 'blocked_scheme' })
      return route.abort()
    }
    if (['https:', 'http:'].includes(parsed.protocol) && privateOrLocalHostname(parsed.hostname)) {
      redSignals.add('dangerous_external_link')
      technicalFlags.add('Blocked a request to a local or private-address hostname.')
      if (networkFindings.length < 200) networkFindings.push({ url: url.slice(0, 500), resourceType: request.resourceType(), action: 'blocked_private_host' })
      return route.abort()
    }
    if (['https:', 'http:'].includes(parsed.protocol) && parsed.origin !== target.origin) {
      observations.thirdPartyRequests += 1
      if (request.isNavigationRequest()) observations.externalNavigation += 1
      if (/(analytics|doubleclick|googletag|segment|mixpanel|hotjar|facebook|pixel|amplitude)/i.test(parsed.hostname + parsed.pathname)) {
        observations.trackerRequests += 1
        redSignals.add('hidden_tracking')
      }
      technicalFlags.add('A third-party request was blocked and recorded for grown-up review.')
      if (networkFindings.length < 200) networkFindings.push({ origin: parsed.origin, url: url.slice(0, 500), resourceType: request.resourceType(), action: 'blocked_third_party' })
      return route.abort()
    }
    if (networkFindings.length < 200 && ['document', 'fetch', 'xhr', 'websocket', 'eventsource'].includes(request.resourceType())) {
      networkFindings.push({ origin: parsed.origin, url: url.slice(0, 500), method: request.method(), resourceType: request.resourceType(), action: 'allowed_same_origin' })
    }
    return route.continue()
  })

  try {
    await page.goto(target.href, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.waitForTimeout(1_500)
    actions.push({ step: 0, action: 'open', target: target.href, result: 'Loaded the playable experience.' })

    for (let step = 0; step < maxSteps; step += 1) {
      const state = await page.evaluate(() => ({
        text: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 12_000),
        audio: document.querySelectorAll('audio').length,
        video: document.querySelectorAll('video').length,
        iframes: document.querySelectorAll('iframe').length,
        passwordInputs: document.querySelectorAll('input[type="password"]').length,
        textInputs: document.querySelectorAll('input:not([type]), input[type="text"], textarea').length,
        forms: document.querySelectorAll('form').length,
        fileInputs: document.querySelectorAll('input[type="file"]').length,
      }))
      observations.audio = Math.max(observations.audio, state.audio)
      observations.video = Math.max(observations.video, state.video)
      observations.iframes = Math.max(observations.iframes, state.iframes)
      observations.passwordInputs = Math.max(observations.passwordInputs, state.passwordInputs)
      observations.textInputs = Math.max(observations.textInputs, state.textInputs)
      observations.forms = Math.max(observations.forms, state.forms)
      observations.fileInputs = Math.max(observations.fileInputs, state.fileInputs)
      observations.permissionLanguage += /\b(camera|microphone|geolocation|location permission|notifications?)\b/i.test(state.text) ? 1 : 0
      observations.commerceLanguage += /\b(buy|checkout|payment|credit card|subscribe now|affiliate|sponsored|advertisement)\b/i.test(state.text) ? 1 : 0
      observations.loginLanguage += /\b(log[ -]?in|sign[ -]?in|create (?:an )?account|password)\b/i.test(state.text) ? 1 : 0
      observations.chatLanguage += /\b(open chat|direct message|send message|contact me|discord|whatsapp|telegram)\b/i.test(state.text) ? 1 : 0
      observations.personalInformation += containsPersonalInformation(state.text) ? 1 : 0
      observations.exposedSecrets += /\b(?:sk-[a-z0-9_-]{16,}|ghp_[a-z0-9]{20,}|AKIA[A-Z0-9]{16})\b/i.test(state.text) ? 1 : 0
      if (containsPersonalInformation(state.text) || containsPersonalInformation(scan.projectTitle + ' ' + scan.description)) redSignals.add('personal_information')
      if (observations.exposedSecrets) redSignals.add('credential_theft')
      if (observations.commerceLanguage) redSignals.add('payment_solicitation')
      if (state.audio) technicalFlags.add('Audio is present and was not semantically reviewed; a grown-up should listen manually.')
      if (state.video) technicalFlags.add('Video is present and was reviewed only through sampled screens; a grown-up should watch it manually.')
      if (state.iframes) technicalFlags.add('Embedded frames are present and may contain states the runner could not inspect fully.')
      if (state.passwordInputs) technicalFlags.add('A password field is present; the runner did not sign in.')
      if (state.textInputs) technicalFlags.add('Text input is present; the runner did not enter personal or free-form data.')
      if (state.forms) technicalFlags.add('A form is present; the runner did not submit it.')
      if (state.fileInputs) technicalFlags.add('A file input is present; the runner did not upload anything.')
      textSamples.push(state.text)

      const screenshot = await page.screenshot({ type: 'jpeg', quality: 58, fullPage: false })
      const screenshotUrl = dataUrl(screenshot)
      const moderation = await moderateState(scan, screenshotUrl, state.text)
      screenshotsReviewed += 1
      anyModerationFlag ||= moderation.flagged
      moderation.categories.forEach((category) => moderationCategories.add(category))

      const elements = await interactiveElements(page, target.origin)
      observations.maximumInteractiveElements = Math.max(observations.maximumInteractiveElements, elements.length)
      let next
      try {
        next = await chooseAction(scan, screenshotUrl, elements, actions)
      } catch (error) {
        technicalFlags.add('The AI action planner failed once; deterministic exploration was used for that step.')
        const fallback = elements.find((element) => !element.external && !element.disabled && !actions.some((action) => action.target === element.text))
        next = fallback ? { action: 'click', targetId: fallback.id, key: null, reason: 'Fallback exploration' } : { action: 'finish', targetId: null, key: null, reason: 'No safe untried control remained' }
      }

      if (next.action === 'finish') {
        finishedNaturally = true
        actions.push({ step: step + 1, action: 'finish', result: String(next.reason).slice(0, 300) })
        break
      }
      if (next.action === 'wait') {
        await page.waitForTimeout(1_500)
        actions.push({ step: step + 1, action: 'wait', result: String(next.reason).slice(0, 300) })
        continue
      }
      if (next.action === 'press_key') {
        if (!allowedKeys.has(next.key)) {
          technicalFlags.add(`The AI proposed a disallowed key and it was blocked: ${String(next.key).slice(0, 30)}`)
          continue
        }
        await page.keyboard.press(next.key)
        await page.waitForTimeout(900)
        actions.push({ step: step + 1, action: 'press key', target: next.key, result: String(next.reason).slice(0, 300) })
        continue
      }

      const element = elements.find((candidate) => candidate.id === next.targetId)
      if (!element || element.disabled || element.external) {
        technicalFlags.add('The AI proposed an unavailable or external control; the click was blocked.')
        continue
      }
      const beforeUrl = page.url()
      try {
        await page.locator(`[data-vibe-safety-id="${element.id}"]`).click({ timeout: 4_000 })
        await page.waitForTimeout(1_100)
        if (new URL(page.url()).origin !== target.origin) {
          technicalFlags.add('A control navigated off-site; the runner returned without exploring the external page.')
          await page.goto(beforeUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => undefined)
        }
        actions.push({ step: step + 1, action: 'click', target: element.text || element.tag, result: String(next.reason).slice(0, 300) })
      } catch (error) {
        actions.push({ step: step + 1, action: 'click failed', target: element.text || element.tag, result: error instanceof Error ? error.message.slice(0, 300) : 'Unknown click failure' })
      }
    }

    let assessment
    try {
      assessment = await finalAssessment(scan, actions, moderationCategories, technicalFlags, textSamples)
    } catch (error) {
      technicalFlags.add('The final child-safety summary model failed; moderation results still completed.')
      assessment = {
        verdict: 'review',
        summary: 'The screenshot and text moderation pass completed, but the broader child-safety summary needs a grown-up review.',
        concerns: [],
      }
    }
    assessment.concerns.forEach((concern) => moderationCategories.add(concern))
    const interactionsAttempted = actions.filter((action) => ['click', 'press key', 'wait'].includes(action.action)).length
    const minimumCoverageMet = screenshotsReviewed >= 1 && finishedNaturally &&
      (observations.maximumInteractiveElements === 0 || interactionsAttempted >= Math.min(3, observations.maximumInteractiveElements))
    const limitations = [
      `The runner sampled at most ${maxSteps} browser states; unexplored, delayed, random, mobile-only, hover, touch, canvas, audio, and video behavior may remain.`,
      'The GitHub-hosted browser is not a complete network namespace and does not defeat DNS rebinding or headless-detection behavior.',
      'Repository source and deployed-byte matching were not inspected by this playthrough.',
    ]
    const checks = {
      publicFieldsNoPersonalInformation: observations.personalInformation === 0 && !containsPersonalInformation(scan.projectTitle + ' ' + scan.description),
      descriptionModerationPassed: !anyModerationFlag && moderationCategories.size === 0,
      playableUrlHttps: true,
      destinationReachable: screenshotsReviewed > 0,
      noLoginOrAccountCreation: observations.passwordInputs === 0 && observations.loginLanguage === 0,
      noPaymentAdvertisingAffiliateOrCommerce: observations.commerceLanguage === 0,
      noSensitivePermissionRequests: observations.permissionLanguage === 0,
      noFormsChatMessagingOrDataCollection: observations.forms === 0 && observations.textInputs === 0 && observations.fileInputs === 0 && observations.chatLanguage === 0,
      noFileDownload: observations.downloads === 0,
      noUncontrolledExternalNavigation: observations.externalNavigation === 0 && observations.popups === 0,
      noUnreviewedIframeOrThirdPartyEmbed: observations.iframes === 0 && observations.thirdPartyRequests === 0,
      noSuspiciousTrackerOrAnalytics: observations.trackerRequests === 0,
      noExposedSecretOrCredential: observations.exposedSecrets === 0,
      minimumPlaytestCoverageMet,
      visibleTextAndScreensModerationPassed: !anyModerationFlag && moderationCategories.size === 0,
      deterministicSafetyAndPlaytestAgree: !anyModerationFlag && assessment.verdict === 'pass' && technicalFlags.size === 0,
      noCriticalUncertainty: false,
    }
    const safetyClassification = redSignals.size || anyModerationFlag ? 'red' : assessment.verdict === 'pass' ? 'green' : 'yellow'
    const technicalClassification = minimumCoverageMet && technicalFlags.size === 0 ? 'green' : 'yellow'
    const needsReview = anyModerationFlag || technicalFlags.size > 0 || assessment.verdict !== 'pass' || redSignals.size > 0
    return {
      id: scan.id,
      attempt: scan.attempt,
      status: needsReview ? 'review' : 'passed',
      verdict: needsReview ? 'grown-up-review' : 'pass',
      summary: String(assessment.summary).slice(0, 2000),
      categories: [...moderationCategories].slice(0, 40),
      actions: actions.slice(0, 40),
      technicalFlags: [...technicalFlags].slice(0, 40),
      screenshotsReviewed,
      model: `${playthroughModel} + omni-moderation-latest`,
      error: null,
      shadowReview: {
        policyVersion: 'vck-shadow-2027.1',
        checks,
        redSignals: [...redSignals],
        coverage: {
          maximumStates: maxSteps,
          screenshotsReviewed,
          maximumInteractiveElements: observations.maximumInteractiveElements,
          interactionsAttempted,
          finishedNaturally,
          minimumMet: minimumCoverageMet,
          desktopViewport: '1280x800',
          mobileCovered: false,
        },
        networkFindings,
        consoleFindings,
        sourceScan: { status: 'missing', reason: 'The browser playthrough does not inspect repository source or bind it to deployed bytes.' },
        safetyAgent: {
          classification: safetyClassification,
          summary: String(assessment.summary).slice(0, 2000),
          moderationFlagged: anyModerationFlag,
          categories: [...moderationCategories].slice(0, 40),
          limitations,
        },
        technicalPlaytest: {
          classification: technicalClassification,
          observations,
          coverageHonest: true,
          limitations,
        },
        limitations,
        modelVersions: { safety_agent: `omni-moderation-latest + ${playthroughModel}`, technical_playtest: `playwright-1.61.1 + ${playthroughModel}` },
        promptVersions: { safety_agent: safetyPromptVersion, technical_playtest: playtestPromptVersion },
      },
    }
  } finally {
    await context.close()
  }
}

const browser = await chromium.launch({ headless: true })
try {
  const scans = await claimScans()
  if (!scans.length) console.log('No queued playable experiences.')
  for (const scan of scans) {
    console.log(`Running isolated playthrough for scan ${scan.id}`)
    try {
      await recordResult(await scanExperience(browser, scan))
    } catch (error) {
      await recordResult({
        id: scan.id,
        attempt: scan.attempt,
        status: 'failed',
        verdict: 'error',
        summary: 'The automated playthrough could not finish. A grown-up must review the experience manually or run it again.',
        categories: [],
        actions: [],
        technicalFlags: ['Automated coverage was incomplete.'],
        screenshotsReviewed: 0,
        model: `${playthroughModel} + omni-moderation-latest`,
        error: error instanceof Error ? error.message.slice(0, 1000) : 'Unknown playthrough error',
        shadowReview: {
          policyVersion: 'vck-shadow-2027.1',
          checks: { playableUrlHttps: true, destinationReachable: false, minimumPlaytestCoverageMet: false, noCriticalUncertainty: false },
          redSignals: [],
          coverage: { maximumStates: maxSteps, screenshotsReviewed: 0, minimumMet: false, desktopViewport: '1280x800', mobileCovered: false },
          networkFindings: [],
          consoleFindings: [],
          sourceScan: { status: 'missing' },
          safetyAgent: { classification: 'yellow', limitations: ['The safety run failed before a complete report.'] },
          technicalPlaytest: { classification: 'yellow', limitations: ['Automated coverage was incomplete.'] },
          limitations: ['Automated coverage was incomplete.', 'Source, image, network, and mobile evidence are incomplete.'],
          modelVersions: { safety_agent: `omni-moderation-latest + ${playthroughModel}`, technical_playtest: `playwright-1.61.1 + ${playthroughModel}` },
          promptVersions: { safety_agent: safetyPromptVersion, technical_playtest: playtestPromptVersion },
        },
      })
    }
  }
} finally {
  await browser.close()
}

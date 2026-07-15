const siteUrl = 'https://vibecodekids.com'
const socialImage = `${siteUrl}/hero-kids-banner.webp`

type SeoEntry = { title: string; description: string; path: string; noindex?: boolean }

const seoByPath: Record<string, SeoEntry> = {
  '/': {
    title: 'Vibe Code Kids | Weekly Vibe Coding Challenges for Kids',
    description: 'A free, grown-up-guided vibe coding club with weekly AI coding challenges, kid-built projects, and a practical parent guide.',
    path: '/',
  },
  '/getting-started': {
    title: 'Vibe Coding for Kids: A Parent’s Beginner Guide | Vibe Code Kids',
    description: 'Learn how kids and grown-ups can make a first AI-coded game, world, or webpage together—safely, creatively, and without coding experience.',
    path: '/getting-started',
  },
  '/favorites': {
    title: 'Kid-Built Vibe Coding Projects | Clubhouse Favorites',
    description: 'Explore community-favorite games, worlds, and webpages created by kids with AI coding tools and grown-up guidance.',
    path: '/favorites',
  },
  '/legal': {
    title: 'Safety, Terms & Privacy | Vibe Code Kids',
    description: 'Read the safety rules, grown-up responsibilities, privacy notice, and participation terms for Vibe Code Kids.',
    path: '/legal',
  },
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, name)
    document.head.appendChild(tag)
  }
  tag.content = content
}

export function applyPageSeo(pathname: string) {
  const cleanPath = pathname !== '/' ? pathname.replace(/\/$/, '') : '/'
  const isPrivate = cleanPath.startsWith('/clubhouse-admin') || cleanPath.startsWith('/review')
  const seo = isPrivate
    ? { title: 'Private Clubhouse | Vibe Code Kids', description: 'Private Vibe Code Kids workspace.', path: cleanPath, noindex: true }
    : seoByPath[cleanPath] || seoByPath['/']
  const canonicalUrl = `${siteUrl}${seo.path}`

  document.title = seo.title
  setMeta('description', seo.description)
  setMeta('robots', seo.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  setMeta('og:type', 'website', 'property')
  setMeta('og:site_name', 'Vibe Code Kids', 'property')
  setMeta('og:title', seo.title, 'property')
  setMeta('og:description', seo.description, 'property')
  setMeta('og:url', canonicalUrl, 'property')
  setMeta('og:image', socialImage, 'property')
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', seo.title)
  setMeta('twitter:description', seo.description)
  setMeta('twitter:image', socialImage)

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = canonicalUrl
}

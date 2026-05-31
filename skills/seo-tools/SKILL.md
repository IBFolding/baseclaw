# SEO Tools Skill

## Overview
Optimize generated webpages for search engines and social sharing.

## Features
- **Meta Tags** — Title, description, keywords
- **Open Graph** — Facebook/LinkedIn preview
- **Twitter Cards** — Twitter preview cards
- **Sitemap** — Auto-generated XML sitemap
- **Robots.txt** — Search engine instructions
- **Structured Data** — JSON-LD schema markup
- **Canonical URLs** — Prevent duplicate content
- **Alt Text** — Image descriptions for accessibility

## Usage
```javascript
baseclaw.seo.configure({
  title: 'My Token Launch',
  description: 'Deploy and manage tokens on Base chain',
  image: '/og-image.png',
  twitter: '@myhandle'
})
```

## Output
Generates:
- `meta.json` — All meta configuration
- `sitemap.xml` — Page URLs
- `robots.txt` — Crawler instructions

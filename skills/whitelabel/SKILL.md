# Whitelabel Skill

## Overview
Remove BaseClaw branding and add your own. Custom logos, colors, domains, and more.

## Features
- **Custom Logo** — Your brand logo in header and favicon
- **Custom Colors** — Primary, secondary, accent colors
- **Custom Domain** — Your own domain for the dApp
- **Custom Footer** — Your links, copyright, social
- **Custom Meta** — SEO title, description, image
- **Custom CSS** — Override any styles
- **Remove "Powered by"** — Clean, professional look

## Usage
```javascript
baseclaw.whitelabel.configure({
  logo: '/my-logo.png',
  favicon: '/my-favicon.png',
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D'
  },
  domain: 'myproject.com',
  footer: {
    links: [
      { label: 'About', url: '/about' },
      { label: 'Docs', url: '/docs' }
    ],
    copyright: '© 2024 My Project',
    social: {
      twitter: '@myproject',
      discord: 'discord.gg/myproject'
    }
  },
  meta: {
    title: 'My Project — DeFi Platform',
    description: 'The best DeFi platform on Base',
    image: '/og-image.png'
  }
})
```

## Domain Setup
1. Buy domain (or use existing)
2. Add DNS record pointing to Vercel
3. Configure in BaseClaw settings
4. Auto-SSL certificate

## CSS Override
```css
/* Custom styles */
:root {
  --brand-primary: #FF6B6B;
  --brand-secondary: #4ECDC4;
}

.hero {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}
```

## Export
- Generate standalone build
- No BaseClaw references
- Fully self-hosted
- Source code included

## Pricing
- Free: Basic whitelabel (logo + colors)
- Pro: Custom domain + CSS ($10/month)
- Enterprise: Full source + support ($50/month)

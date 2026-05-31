# Performance Metrics Skill

## Overview
Measure and optimize webpage performance with Lighthouse-style metrics.

## Metrics
- **Lighthouse Score** — Overall performance (0-100)
- **First Contentful Paint** — Time to first visible content
- **Largest Contentful Paint** — Time to largest element
- **Time to Interactive** — Time until fully interactive
- **Cumulative Layout Shift** — Visual stability score
- **Total Blocking Time** — Time blocked by JavaScript
- **Bundle Size** — Total JavaScript/CSS size
- **Image Optimization** — WebP/AVIF usage, lazy loading

## Usage
```javascript
baseclaw.performance.test()
// Runs performance audit
```

## Output
```json
{
  "lighthouse": 92,
  "fcp": "1.2s",
  "lcp": "2.1s",
  "tti": "3.5s",
  "cls": 0.05,
  "tbt": "150ms",
  "bundleSize": "245KB",
  "images": "optimized"
}
```

## Optimization Suggestions
- Code splitting
- Image compression
- Font optimization
- Lazy loading
- Caching strategies

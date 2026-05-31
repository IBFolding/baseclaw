# Accessibility Checker Skill

## Overview
Ensure generated webpages meet WCAG 2.1 AA standards and are accessible to all users.

## Checks
- **Color Contrast** — Text meets 4.5:1 ratio
- **Alt Text** — All images have descriptions
- **Keyboard Navigation** — Tab order, focus indicators
- **ARIA Labels** — Screen reader support
- **Font Size** — Minimum 16px for body text
- **Touch Targets** — Minimum 44x44px for buttons
- **Motion** — Respect prefers-reduced-motion
- **Forms** — Labels, error messages, required fields

## Usage
```javascript
baseclaw.accessibility.check()
// Returns report with issues and fixes
```

## Output
```json
{
  "score": 95,
  "issues": [
    { "type": "contrast", "element": "button", "fix": "Use darker background" }
  ],
  "passed": ["alt-text", "keyboard-nav", "aria-labels"]
}
```

## Auto-fixes
- Suggest color alternatives
- Add missing ARIA labels
- Enforce minimum touch sizes

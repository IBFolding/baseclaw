# Theme Editor Skill

## Overview
Live theme customization for generated webpages. Change colors, fonts, and branding in real-time.

## Features
- **Color Picker** — Primary, secondary, background, text colors
- **Font Selector** — Choose from Google Fonts or system fonts
- **Logo Upload** — Replace with custom logo
- **Border Radius** — Adjust corner roundness
- **Shadows** — Toggle shadows, adjust intensity
- **Spacing** — Padding, margin adjustments

## Presets
- **Base Blue** — Default Base chain colors
- **Dark Mode** — Dark theme variant
- **Minimal** — Clean, minimal aesthetic
- **Vibrant** — Bold, colorful design
- **Professional** — Corporate, subdued tones

## Usage
```javascript
baseclaw.theme.open()
// Opens theme editor panel
```

## Output
Generates `theme.json` file:
```json
{
  "colors": {
    "primary": "#0052FF",
    "secondary": "#00D4AA",
    "background": "#F5F0EB",
    "text": "#2D2926"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },
  "radius": "16px",
  "shadows": true
}
```

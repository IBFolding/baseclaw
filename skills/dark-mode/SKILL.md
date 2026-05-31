# Dark Mode Toggle Skill

## Overview
Allow users to toggle between light and dark modes, independent of system preference.

## Features
- **Toggle Button** — Sun/moon icon in header
- **Persist Preference** — Save to localStorage
- **System Default** — Use system preference as default
- **Smooth Transition** — Animated color transitions
- **Custom Themes** — Define custom dark colors

## Usage
```javascript
baseclaw.darkmode.toggle()
baseclaw.darkmode.set(true) // Force dark
baseclaw.darkmode.set(false) // Force light
baseclaw.darkmode.followSystem() // Follow OS preference
```

## CSS Variables
```css
[data-theme="dark"] {
  --bg-primary: #1E1C1A;
  --bg-secondary: #2A2724;
  --text-primary: #E8E4E0;
  --text-secondary: #B0AAA4;
  --accent: #0052FF;
}
```

## Implementation
- Toggle adds/removes `data-theme="dark"` attribute
- CSS variables switch automatically
- localStorage saves user preference

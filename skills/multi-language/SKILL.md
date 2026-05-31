# Multi-language Support Skill

## Overview
Support multiple languages for international users.

## Features
- **Language Selector** — Dropdown or flags
- **Auto-detect** — Detect browser language
- **Translation** — JSON-based translations
- **RTL Support** — Right-to-left languages (Arabic, Hebrew)
- **Currency** — Local currency display
- **Date/Time** — Localized formats

## Supported Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Portuguese (pt)

## Usage
```javascript
baseclaw.i18n.setLanguage('es')
baseclaw.i18n.addTranslations('es', {
  'welcome': 'Bienvenido',
  'connect_wallet': 'Conectar Billetera'
})
```

## File Structure
```
locales/
  en.json
  es.json
  fr.json
  ...
```

# Documentation Generator Skill

## Overview
Auto-generate documentation from contract source code and ABI.

## Features
- **Function Docs** — Extract NatSpec comments
- **Event Docs** — Document events with parameters
- **Error Docs** — List custom errors
- **Architecture** — Contract inheritance diagram
- **Usage Examples** — Code snippets for each function
- **API Reference** — Markdown docs from ABI
- **README** — Auto-generated project README

## Usage
```javascript
baseclaw.docs.generate()
// Generates docs/ folder with:
// - README.md
// - API.md
// - ARCHITECTURE.md
// - EXAMPLES.md
```

## Output
```
docs/
  README.md
  API.md
  ARCHITECTURE.md
  EXAMPLES.md
  CHANGELOG.md
```

## Integration
- GitHub Pages hosting
- MkDocs or Docusaurus
- OpenAPI spec generation

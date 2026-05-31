# Component Library Skill

## Overview
Pre-built sections that can be added to any generated webpage.

## Components

### Hero Sections
- **Simple Hero** — Headline + subtitle + CTA
- **Split Hero** — Text left, image right
- **Gradient Hero** — Full gradient background
- **Video Hero** — Background video

### Feature Sections
- **3-Column Grid** — Icon + title + description
- **Alternating** — Image left, text right (alternating)
- **Cards** — Bordered cards with hover effects
- **Stats** — Big numbers with labels

### Content Sections
- **Text Block** — Rich text content
- **Image Gallery** — Grid of images
- **Video Embed** — YouTube/Vimeo embed
- **Code Block** — Syntax highlighted code

### Interactive Sections
- **FAQ Accordion** — Expandable questions
- **Tabs** — Tabbed content
- **Carousel** — Sliding image carousel
- **Testimonials** — Customer quotes

### CTA Sections
- **Simple CTA** — Headline + button
- **Email Capture** — Headline + email input
- **Countdown** — Limited time offer timer
- **Social Proof** — Logos, stats, testimonials

### Footer Sections
- **Simple Footer** — Links + copyright
- **Newsletter** — Email signup in footer
- **Social Links** — Social media icons
- **Multi-column** — 4-column layout

## Usage
```javascript
baseclaw.components.add('hero-split')
baseclaw.components.remove('features-grid')
baseclaw.components.reorder(['hero', 'features', 'cta', 'footer'])
```

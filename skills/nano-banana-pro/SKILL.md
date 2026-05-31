---
name: nano-banana-pro
description: Generate or edit images via Gemini 3 Pro Image (Nano Banana Pro).
triggers:
  - generate image
  - create image
  - make image
  - image generation
  - nano banana
role: specialist
scope: implementation
output-format: media
---

# Nano Banana Pro

Generate high-quality images using Google's Gemini 3 Pro Image model.

## Usage

When the user wants to generate an image, use this skill to create it.

### Image Generation

```javascript
// The skill generates images based on text prompts
// Returns a MEDIA: path to the generated image
```

### Prompt Tips

- Be specific about style, lighting, composition
- Include color palette preferences
- Specify aspect ratio if needed (default is 1:1)
- For logos: specify "logo design", "vector style", "clean lines"

### Example Prompts

**Logo Design:**
"Modern logo for ClawReserve, a DeFi protocol. Mechanical claw grasping a digital coin. Orange to amber gradient. Tech-forward, futuristic, clean vector style. Dark background."

**Token Icon:**
"Circular cryptocurrency token icon. 'CRD' in center. Orange gradient background #F97316 to #F59E0B. Circuit board patterns. Metallic finish. 3D rendered."

**Dashboard UI:**
"Dark mode DeFi dashboard interface. Glassmorphism cards. Gradient accents in orange and purple. Clean typography. Modern crypto aesthetic."

## Output

Returns: `MEDIA:path/to/generated/image.png`

Always present the MEDIA line exactly as returned. The user can view the image directly.

## Constraints

- Maximum prompt length: 4000 characters
- Supported aspect ratios: 1:1, 16:9, 9:16, 4:3, 3:4
- Generation time: ~10-30 seconds
- Output format: PNG

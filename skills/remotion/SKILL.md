---
name: remotion
description: AI-powered video generation using Remotion.dev. Create programmatic videos with React, render server-side, and build video automation pipelines. Use for marketing videos, social media content, data visualizations, or any automated video creation.
metadata:
  version: "1.0.0"
  emoji: "🎬"
---

# Remotion Video Generator 🎬

Create real MP4 videos programmatically using React and TypeScript.

## What is Remotion?

Remotion is a framework that lets you write videos in React code:
- **Compose with code** - Use React components to create sophisticated videos
- **Parametrize content** - Pass dynamic data to generate personalized videos
- **Render server-side** - Batch generate videos via API or Lambda
- **Real MP4 output** - Not just animations, actual video files

## Quick Start

### 1. Create New Project
```bash
npx create-video@latest my-video
cd my-video
npm install
npm run dev
```

### 2. Basic Video Component
```tsx
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const MyVideo = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  return (
    <div style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: 'black',
      fontSize: 100,
      color: 'white'
    }}>
      Frame {frame} of {durationInFrames}
    </div>
  );
};
```

### 3. Define Composition
```tsx
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

export const Root = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

## AI-Powered Video Creation

### Using Claude Code (Recommended)
```bash
# Install Claude Code first, then:
cd my-video
claude

# Prompt examples:
"Create a 10-second intro with my logo fading in"
"Make a data visualization showing sales growth"
"Generate a social media ad for a product launch"
```

### Dynamic Props
```tsx
// Pass data to personalize videos
export const MyVideo: React.FC<{ productName: string; price: string }> = 
  ({ productName, price }) => {
    return <div>{productName} - ${price}</div>;
  };

// In composition
<Composition
  id="ProductAd"
  component={MyVideo}
  defaultProps={{ productName: 'Widget', price: '29.99' }}
/>
```

## Server-Side Rendering

### Node.js API
```tsx
import { renderMedia, selectComposition } from '@remotion/renderer';

const composition = await selectComposition({
  serveUrl: './build',
  id: 'MyVideo',
  inputProps: { productName: 'New Product' }
});

await renderMedia({
  composition,
  serveUrl: './build',
  codec: 'h264',
  outputLocation: 'output.mp4'
});
```

### AWS Lambda (Scalable)
```bash
# Deploy to Lambda
npx remotion lambda sites create
npx remotion lambda functions deploy

# Render via API
npx remotion lambda render <site-id> MyVideo
```

### Lambda API
```tsx
import { renderMediaOnLambda } from '@remotion/lambda';

const { renderId } = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-fn',
  serveUrl: 'https://your-site.s3.amazonaws.com',
  composition: 'MyVideo',
  inputProps: { data: yourData }
});
```

## Video Templates

### Marketing/Promo
- Product showcase videos
- Feature announcements
- Testimonial compilations
- Countdown timers

### Social Media
- Instagram Reels (9:16)
- TikTok videos
- Twitter/X posts
- LinkedIn content

### Data Visualization
- Charts and graphs animation
- Report summaries
- Metric dashboards
- Trend visualizations

### Personalization
- Personalized outreach videos
- Dynamic product catalogs
- Event invitations
- Certificate generation

## Key Features

### Animation
```tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const scale = spring({
  frame,
  fps,
  from: 0,
  to: 1
});
```

### Audio Support
```tsx
import { Audio } from 'remotion';

export const VideoWithAudio = () => (
  <>
    <Audio src="https://example.com/music.mp3" />
    <div>Video content</div>
  </>
);
```

### Video Embedding
```tsx
import { Video } from 'remotion';

<Video src="https://example.com/video.mp4" />
```

### Images & Assets
```tsx
import { Img, staticFile } from 'remotion';

<Img src={staticFile('logo.png')} />
```

## Rendering Options

### Codecs
- `h264` - Standard MP4 (default)
- `h265` - HEVC, better compression
- `vp8`/`vp9` - WebM formats
- `prores` - Professional editing
- `gif` - Animated GIFs
- `mp3`/`wav` - Audio only

### Quality Settings
```tsx
await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  crf: 18, // Lower = higher quality (0-51)
  videoBitrate: '10M'
});
```

## Pricing

### Development
- **Free** - Individuals and teams up to 3 people
- Commercial use allowed
- Must upgrade when team grows

### Production
- **Remotion for Automators** - $0.01 per render, $100/mo minimum
- **Company License** - Custom pricing for 4+ people
- **Enterprise** - Starting at $500/mo with SLA

### AWS Lambda Costs
- Pay only for render time used
- Typical: cents per minute of video
- Scales to thousands of renders in parallel

## Integration Patterns

### With OpenClaw
```yaml
skills:
  - remotion:
      actions:
        - render_video
        - batch_generate
        - create_template
```

### Webhook Workflow
1. Trigger: New data arrives
2. Generate: Render personalized video
3. Deliver: Upload to CDN/send via email
4. Track: Monitor completion

### Batch Generation
```tsx
// Generate 1000 personalized videos
const users = await getUsers();
const renders = users.map(user => 
  renderMediaOnLambda({
    composition: 'PersonalizedAd',
    inputProps: { name: user.name, offer: user.offer }
  })
);
await Promise.all(renders);
```

## Common Use Cases

### ClawReserve Integration
- Protocol explainer videos
- Animated tokenomics diagrams
- Agent performance showcases
- Governance proposal summaries
- Treasury report visualizations

### Marketing Automation
- Personalized video ads at scale
- A/B test video variations
- Dynamic product videos
- Event highlight reels

### Data Storytelling
- Animated charts and graphs
- Report summaries
- Trend analysis videos
- Real-time metric displays

## Resources

- **Docs**: https://www.remotion.dev/docs
- **Templates**: https://www.remotion.dev/templates
- **Discord**: https://remotion.dev/discord
- **GitHub**: https://github.com/remotion-dev/remotion

---

*"Create videos programmatically. Scale infinitely."*

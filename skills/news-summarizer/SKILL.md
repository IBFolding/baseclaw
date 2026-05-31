---
name: news-summarizer
description: TL;DR of market news. Summarize articles, extract key points, detect bias, and generate audio summaries. Perfect for staying on top of crypto and financial news quickly.
metadata: {"clawdbot":{"emoji":"📰","requires":{"bins":["python3"]}}}
---

# News Summarizer

Get TL;DR summaries of market news, articles, and financial content.

## Features

- **Article Summarization** - Extract key points from long articles
- **Bias Detection** - Identify potential bias in news sources
- **Key Points Extraction** - Bullet-point summaries of main ideas
- **Audio Summary Generation** - Convert summaries to spoken audio

## Usage

### Summarize an Article

```bash
python3 {baseDir}/scripts/summarize.py --url "https://example.com/article"
```

**Summarize from text file:**
```bash
python3 {baseDir}/scripts/summarize.py --file /path/to/article.txt
```

**Custom summary length:**
```bash
python3 {baseDir}/scripts/summarize.py --url "URL" --length short  # short/medium/long
```

### Extract Key Points

```bash
python3 {baseDir}/scripts/extract_keypoints.py --url "https://example.com/article"
```

**Extract with sentiment:**
```bash
python3 {baseDir}/scripts/extract_keypoints.py --url "URL" --sentiment
```

### Detect Bias

```bash
python3 {baseDir}/scripts/detect_bias.py --url "https://example.com/article"
```

**Bias report:**
```bash
python3 {baseDir}/scripts/detect_bias.py --url "URL" --report
```

### Generate Audio Summary

```bash
python3 {baseDir}/scripts/audio_summary.py --url "https://example.com/article"
```

**With custom voice:**
```bash
python3 {baseDir}/scripts/audio_summary.py --url "URL" --voice nova
```

**Read summary from file:**
```bash
python3 {baseDir}/scripts/audio_summary.py --file summary.txt --output podcast.mp3
```

### Batch Process Multiple URLs

```bash
python3 {baseDir}/scripts/batch_summarize.py --urls "url1,url2,url3" --output report.json
```

**From file list:**
```bash
python3 {baseDir}/scripts/batch_summarize.py --list urls.txt --output report.json
```

## Output Format

### Text Summary
```json
{
  "success": true,
  "summary": "Article summary text...",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "word_count": {
    "original": 1200,
    "summary": 150
  },
  "reading_time": {
    "original_minutes": 5,
    "summary_minutes": 0.5
  }
}
```

### Bias Detection
```json
{
  "success": true,
  "bias_score": 0.3,
  "bias_level": "low",
  "flags": [
    {"type": "emotional_language", "severity": "medium", "examples": [...]}
  ],
  "sentiment": "positive",
  "source_reliability": "medium"
}
```

### Audio Summary
```json
{
  "success": true,
  "audio_path": "/tmp/news_summary_12345.mp3",
  "duration_seconds": 45,
  "text": "Spoken summary text..."
}
```

## Configuration

Create `{baseDir}/.env` with API keys:

```bash
# OpenAI (for summarization)
OPENAI_API_KEY=your_key_here

# Optional: Custom TTS settings
TTS_VOICE=nova
TTS_MODEL=tts-1
```

## Data Sources

The summarizer can process:
- **Web articles** - Any public URL
- **RSS feeds** - News feed URLs
- **Text files** - Local .txt files
- **PDF documents** - Financial reports, whitepapers
- **Twitter threads** - Thread URLs (limited support)

## Bias Detection Criteria

- **Emotional language** - Loaded words, sensationalism
- **Source diversity** - Single vs multiple perspectives
- **Fact vs opinion** - Ratio of claims to evidence
- **Political leaning** - Left/center/right indicators
- **Commercial influence** - Sponsored content detection

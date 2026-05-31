#!/usr/bin/env python3
"""
News Summarizer - Audio Summary Generation Script
Convert article summaries to spoken audio using TTS
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

from summarize import fetch_article, summarize_text


def load_env():
    """Load environment variables from .env file"""
    env_file = SKILL_DIR / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ.setdefault(key, value)


def estimate_duration(text: str, wpm: int = 150) -> int:
    """Estimate audio duration in seconds"""
    word_count = len(text.split())
    return int((word_count / wpm) * 60)


def generate_audio_summary(source: str, source_type: str = "url", 
                           voice: str = "nova", output_path: str = None) -> dict:
    """Generate audio summary of article"""
    
    load_env()
    
    # Get article content
    if source_type == "url":
        fetched = fetch_article(source)
        if not fetched["success"]:
            return fetched
        
        title = fetched["title"]
        content = fetched["content"]
    elif source_type == "file":
        try:
            with open(source, "r", encoding="utf-8") as f:
                content = f.read()
            title = Path(source).name
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to read file: {str(e)}",
                "data": None
            }
    elif source_type == "text":
        content = source
        title = "Custom Text"
    else:
        return {
            "success": False,
            "message": f"Unknown source type: {source_type}",
            "data": None
        }
    
    # Generate summary
    summary_data = summarize_text(content, length="medium")
    summary_text = summary_data["summary"]
    
    # Add intro
    intro = f"Here's a summary of {title}. " if title != "Custom Text" else ""
    full_text = intro + summary_text
    
    # Try to use OpenAI TTS if available
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if openai_key:
        try:
            import requests
            
            if not output_path:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = f"/tmp/news_summary_{timestamp}.mp3"
            
            # Call OpenAI TTS API
            url = "https://api.openai.com/v1/audio/speech"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": os.getenv("TTS_MODEL", "tts-1"),
                "voice": voice,
                "input": full_text
            }
            
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            with open(output_path, "wb") as f:
                f.write(response.content)
            
            return {
                "success": True,
                "message": f"Audio summary generated: {output_path}",
                "data": {
                    "audio_path": output_path,
                    "title": title,
                    "text": full_text,
                    "duration_seconds": estimate_duration(full_text),
                    "voice": voice,
                    "generated_at": datetime.now().isoformat()
                }
            }
        
        except Exception as e:
            # Fall back to text output with TTS instruction
            return {
                "success": True,
                "message": "TTS API unavailable - returning text for manual TTS",
                "data": {
                    "title": title,
                    "text": full_text,
                    "note": f"TTS error: {str(e)}",
                    "suggested_voice": voice,
                    "duration_estimate": estimate_duration(full_text)
                }
            }
    else:
        # No API key - return text with speaking instructions
        return {
            "success": True,
            "message": "OpenAI API key not configured - returning text summary for TTS",
            "data": {
                "title": title,
                "text": full_text,
                "duration_estimate": estimate_duration(full_text),
                "suggested_voice": voice,
                "setup_note": "Set OPENAI_API_KEY in .env for automatic TTS generation"
            }
        }


def generate_podcast_script(sources: list, title: str = "Daily News Brief") -> dict:
    """Generate a podcast-style script from multiple sources"""
    
    script_parts = [
        f"Welcome to {title}.",
        "Here are today's top stories:\n"
    ]
    
    for i, source in enumerate(sources, 1):
        fetched = fetch_article(source)
        if fetched["success"]:
            summary_data = summarize_text(fetched["content"], length="short")
            script_parts.append(f"Story {i}: {fetched['title']}")
            script_parts.append(summary_data["summary"])
            script_parts.append("")
    
    script_parts.append("That's all for today. Thanks for listening.")
    
    full_script = "\n".join(script_parts)
    
    return {
        "success": True,
        "message": f"Podcast script generated from {len(sources)} sources",
        "data": {
            "title": title,
            "script": full_script,
            "duration_estimate": estimate_duration(full_script),
            "source_count": len(sources)
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Generate audio summaries")
    parser.add_argument("--url", "-u", help="URL of article")
    parser.add_argument("--file", "-f", help="Path to text file")
    parser.add_argument("--text", "-t", help="Direct text input")
    parser.add_argument("--voice", "-v", default="nova",
                       choices=["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
                       help="TTS voice to use")
    parser.add_argument("--output", "-o", help="Output file path")
    parser.add_argument("--podcast", "-p", help="Generate podcast from URLs (comma-separated)")
    
    args = parser.parse_args()
    
    if args.podcast:
        urls = [u.strip() for u in args.podcast.split(",")]
        result = generate_podcast_script(urls)
    elif args.url:
        result = generate_audio_summary(args.url, "url", args.voice, args.output)
    elif args.file:
        result = generate_audio_summary(args.file, "file", args.voice, args.output)
    elif args.text:
        result = generate_audio_summary(args.text, "text", args.voice, args.output)
    else:
        parser.print_help()
        sys.exit(1)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()

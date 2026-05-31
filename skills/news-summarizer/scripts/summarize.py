#!/usr/bin/env python3
"""
News Summarizer - Article Summarization Script
Summarize articles from URLs or files
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print(json.dumps({
        "success": False,
        "message": "Missing dependencies. Install: pip install requests beautifulsoup4",
        "data": None
    }))
    sys.exit(1)


def load_env():
    """Load environment variables from .env file"""
    env_file = SKILL_DIR / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ.setdefault(key, value)


def fetch_article(url: str) -> dict:
    """Fetch and extract article content from URL"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Extract title
        title = soup.find("title")
        title_text = title.get_text(strip=True) if title else "Untitled"
        
        # Try to find article content
        # Common article container selectors
        article_selectors = [
            "article", "[role='main']", ".article-content", ".post-content",
            ".entry-content", ".content", "main", "#content", ".story-body"
        ]
        
        content = None
        for selector in article_selectors:
            content = soup.select_one(selector)
            if content:
                break
        
        # Fallback to body if no article found
        if not content:
            content = soup.find("body")
        
        # Extract text, removing scripts and styles
        if content:
            for script in content(["script", "style", "nav", "header", "footer"]):
                script.decompose()
            text = content.get_text(separator="\n", strip=True)
            # Clean up whitespace
            text = re.sub(r'\n+', '\n', text)
            text = re.sub(r' +', ' ', text)
        else:
            text = ""
        
        return {
            "success": True,
            "title": title_text,
            "content": text,
            "url": url,
            "word_count": len(text.split())
        }
    
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "message": f"Failed to fetch article: {str(e)}",
            "data": None
        }


def summarize_text(text: str, length: str = "medium") -> dict:
    """Summarize text using simple extraction (can be enhanced with OpenAI)"""
    load_env()
    
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    if not sentences:
        return {
            "summary": "Unable to generate summary from content.",
            "key_points": []
        }
    
    # Simple extractive summarization
    # Score sentences by word frequency
    word_freq = {}
    for sentence in sentences:
        words = re.findall(r'\b[a-zA-Z]{4,}\b', sentence.lower())
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Score sentences
    sentence_scores = []
    for sentence in sentences:
        words = re.findall(r'\b[a-zA-Z]{4,}\b', sentence.lower())
        score = sum(word_freq.get(word, 0) for word in words) / max(len(words), 1)
        sentence_scores.append((sentence, score))
    
    # Sort by score and select top sentences
    sentence_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Determine number of sentences based on length
    length_map = {"short": 2, "medium": 4, "long": 7}
    num_sentences = length_map.get(length, 4)
    
    top_sentences = sentence_scores[:num_sentences]
    # Re-sort by original order
    original_order = {s: i for i, s in enumerate(sentences)}
    top_sentences.sort(key=lambda x: original_order.get(x[0], 999))
    
    summary = " ".join([s[0] for s in top_sentences])
    
    # Extract key points (bullet format)
    key_points = []
    for sent, score in sentence_scores[:5]:
        # Clean up sentence for bullet point
        point = sent.strip()
        if point and len(point) > 30:
            key_points.append(point)
    
    return {
        "summary": summary,
        "key_points": key_points[:5]
    }


def summarize_article(source: str, source_type: str = "url", length: str = "medium") -> dict:
    """Main summarization function"""
    
    if source_type == "url":
        fetched = fetch_article(source)
        if not fetched["success"]:
            return fetched
        
        title = fetched["title"]
        content = fetched["content"]
        word_count_original = fetched["word_count"]
    elif source_type == "file":
        try:
            with open(source, "r", encoding="utf-8") as f:
                content = f.read()
            title = Path(source).name
            word_count_original = len(content.split())
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to read file: {str(e)}",
                "data": None
            }
    else:
        return {
            "success": False,
            "message": f"Unknown source type: {source_type}",
            "data": None
        }
    
    # Generate summary
    summary_data = summarize_text(content, length)
    
    summary_word_count = len(summary_data["summary"].split())
    
    return {
        "success": True,
        "message": f"Summary generated ({word_count_original} → {summary_word_count} words)",
        "data": {
            "title": title if source_type == "url" else None,
            "source": source,
            "summary": summary_data["summary"],
            "key_points": summary_data["key_points"],
            "word_count": {
                "original": word_count_original,
                "summary": summary_word_count,
                "compression_ratio": round(word_count_original / max(summary_word_count, 1), 1)
            },
            "reading_time": {
                "original_minutes": round(word_count_original / 200, 1),
                "summary_minutes": round(summary_word_count / 200, 1)
            }
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Summarize articles")
    parser.add_argument("--url", "-u", help="URL of article to summarize")
    parser.add_argument("--file", "-f", help="Path to text file to summarize")
    parser.add_argument("--length", "-l", choices=["short", "medium", "long"],
                       default="medium", help="Summary length")
    
    args = parser.parse_args()
    
    if args.url:
        result = summarize_article(args.url, "url", args.length)
    elif args.file:
        result = summarize_article(args.file, "file", args.length)
    else:
        parser.print_help()
        sys.exit(1)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()

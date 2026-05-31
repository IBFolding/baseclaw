#!/usr/bin/env python3
"""
News Scraper - Extract articles from news sites.
Usage: python news_scraper.py --url <url> --output <file.json>
"""

import argparse
import json
from datetime import datetime
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup


def fetch_article(url: str) -> dict:
    """Extract article content from URL."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.5",
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract title
        title = soup.find("h1")
        if not title:
            title = soup.find("title")
        title_text = title.get_text(strip=True) if title else "No title"
        
        # Extract article body (common selectors)
        article_selectors = [
            "article",
            ".article-content",
            ".article-body",
            ".story-body",
            ".post-content",
            ".entry-content",
            "[itemprop='articleBody']",
        ]
        
        article_text = ""
        for selector in article_selectors:
            element = soup.select_one(selector)
            if element:
                # Get all paragraphs
                paragraphs = element.find_all("p")
                article_text = "\n\n".join(p.get_text(strip=True) for p in paragraphs)
                break
        
        # Fallback: get all paragraphs if no article found
        if not article_text:
            paragraphs = soup.find_all("p")
            article_text = "\n\n".join(p.get_text(strip=True) for p in paragraphs[:20])
        
        # Extract author
        author = None
        author_selectors = [".author", ".byline", "[rel='author']", ".article-author"]
        for selector in author_selectors:
            element = soup.select_one(selector)
            if element:
                author = element.get_text(strip=True)
                break
        
        # Extract date
        date = None
        date_selectors = ["time", ".date", ".publish-date", "[itemprop='datePublished']"]
        for selector in date_selectors:
            element = soup.select_one(selector)
            if element:
                date = element.get("datetime") or element.get_text(strip=True)
                break
        
        return {
            "url": url,
            "title": title_text,
            "author": author,
            "date": date,
            "content": article_text[:5000],  # Limit content
            "scraped_at": datetime.now().isoformat(),
        }
    
    except requests.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}


def fetch_feed(url: str, article_selector: str, link_selector: str = "a") -> list:
    """Extract article links from a news feed/listing page."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.content, "html.parser")
        
        articles = []
        elements = soup.select(article_selector)
        
        for elem in elements[:10]:  # Limit to first 10
            link = elem.select_one(link_selector)
            if link and link.get("href"):
                article_url = urljoin(url, link.get("href"))
                articles.append(article_url)
        
        return articles
    
    except Exception as e:
        print(f"Error fetching feed: {e}")
        return []


def analyze_sentiment(text: str) -> dict:
    """Simple keyword-based sentiment analysis."""
    positive_words = ["surge", "rally", "gain", "growth", "profit", "bull", "moon", "up", "high"]
    negative_words = ["crash", "drop", "fall", "loss", "bear", "dump", "down", "low", "fear"]
    
    text_lower = text.lower()
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)
    
    total = pos_count + neg_count
    if total == 0:
        return {"sentiment": "neutral", "score": 0.5}
    
    score = pos_count / total
    if score > 0.6:
        sentiment = "positive"
    elif score < 0.4:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {"sentiment": sentiment, "score": score}


def main():
    parser = argparse.ArgumentParser(description="Scrape news articles")
    parser.add_argument("--url", required=True, help="Article URL to scrape")
    parser.add_argument("--output", help="Output JSON file")
    parser.add_argument("--sentiment", action="store_true", help="Analyze sentiment")
    parser.add_argument("--feed", action="store_true", help="URL is a feed, scrape multiple articles")
    parser.add_argument("--article-selector", default="article", help="CSS selector for articles in feed")
    
    args = parser.parse_args()
    
    if args.feed:
        print(f"🔍 Fetching feed: {args.url}")
        article_urls = fetch_feed(args.url, args.article_selector)
        print(f"📰 Found {len(article_urls)} articles")
        
        articles = []
        for url in article_urls:
            print(f"  Scraping: {url}")
            article = fetch_article(url)
            if "error" not in article:
                if args.sentiment:
                    article["sentiment"] = analyze_sentiment(article["content"])
                articles.append(article)
        
        result = {"articles": articles, "count": len(articles)}
    else:
        print(f"🔍 Scraping: {args.url}")
        result = fetch_article(args.url)
        
        if "error" not in result and args.sentiment:
            result["sentiment"] = analyze_sentiment(result["content"])
            print(f"📊 Sentiment: {result['sentiment']['sentiment']} ({result['sentiment']['score']:.2f})")
    
    if args.output:
        with open(args.output, "w") as f:
            json.dump(result, f, indent=2)
        print(f"💾 Saved to: {args.output}")
    else:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()

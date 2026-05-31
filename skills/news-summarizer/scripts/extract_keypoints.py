#!/usr/bin/env python3
"""
News Summarizer - Key Points Extraction Script
Extract bullet-point summaries and sentiment analysis
"""

import argparse
import json
import re
import sys
from pathlib import Path
from collections import Counter

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

# Import from summarize module
from summarize import fetch_article


def extract_key_points(text: str, num_points: int = 5) -> list:
    """Extract key points from text"""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
    
    if not sentences:
        return []
    
    # Score sentences by importance indicators
    scored_sentences = []
    
    for sentence in sentences:
        score = 0
        
        # Length factor (not too short, not too long)
        words = len(sentence.split())
        if 10 <= words <= 40:
            score += 2
        
        # Position factor (first sentences often contain key info)
        idx = sentences.index(sentence)
        if idx < 3:
            score += 3
        elif idx < 5:
            score += 1
        
        # Keyword indicators
        importance_keywords = [
            "announced", "reported", "revealed", "confirmed", "stated",
            "increased", "decreased", "rose", "fell", "dropped", "surged",
            "launch", "partnership", "acquisition", "merger", "funding",
            "market", "price", "trading", "investment", "growth",
            " ceo ", " founder ", " executive ", " company ", " firm ",
            " billion", " million", " percent", "%"
        ]
        
        lower_sent = sentence.lower()
        for keyword in importance_keywords:
            if keyword in lower_sent:
                score += 1
        
        # Numbers and data are often important
        if re.search(r'\d+', sentence):
            score += 1
        
        # Quotes often contain key statements
        if '"' in sentence or '"' in sentence or '"' in sentence:
            score += 2
        
        scored_sentences.append((sentence, score))
    
    # Sort by score and select top points
    scored_sentences.sort(key=lambda x: x[1], reverse=True)
    top_sentences = scored_sentences[:num_points]
    
    # Re-sort by original order for coherence
    original_order = {s: i for i, s in enumerate(sentences)}
    top_sentences.sort(key=lambda x: original_order.get(x[0], 999))
    
    # Clean up and format
    key_points = []
    for sentence, score in top_sentences:
        # Clean up sentence
        point = sentence.strip()
        point = re.sub(r'\s+', ' ', point)
        
        # Capitalize first letter
        if point:
            point = point[0].upper() + point[1:]
        
        key_points.append({
            "point": point,
            "relevance_score": score
        })
    
    return key_points


def analyze_sentiment(text: str) -> dict:
    """Simple sentiment analysis"""
    text_lower = text.lower()
    
    positive_words = [
        "surge", "rise", "gain", "profit", "growth", "bullish", "rally",
        "moon", "pump", "breakthrough", "success", "partnership", "launch",
        "adoption", " ATH ", "all-time high", "record", "exceed", "outperform",
        "strong", "positive", "optimistic", "confident", "boom", "soar"
    ]
    
    negative_words = [
        "crash", "drop", "fall", "loss", "bearish", "dump", "scam",
        "hack", "exploit", "investigation", "SEC", "lawsuit", "ban",
        "decline", "sell-off", "liquidation", "fear", "panic", "weak",
        "negative", "pessimistic", "concern", "risk", "volatile", "crash"
    ]
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    total = positive_count + negative_count
    
    if total == 0:
        sentiment = "neutral"
        score = 0.0
    else:
        score = (positive_count - negative_count) / total
        if score > 0.3:
            sentiment = "positive"
        elif score < -0.3:
            sentiment = "negative"
        else:
            sentiment = "neutral"
    
    return {
        "sentiment": sentiment,
        "score": round(score, 2),
        "positive_indicators": positive_count,
        "negative_indicators": negative_count
    }


def extract_entities(text: str) -> dict:
    """Extract named entities (simple regex-based)"""
    entities = {
        "companies": [],
        "tickers": [],
        "people": [],
        "amounts": []
    }
    
    # Company mentions (common crypto/finance companies)
    company_pattern = r'\b(Bitcoin|Ethereum|Solana|Coinbase|Binance|Kraken|MicroStrategy|Tesla|BlackRock|Fidelity|Grayscale)\b'
    companies = re.findall(company_pattern, text, re.IGNORECASE)
    entities["companies"] = list(set(companies))
    
    # Stock/crypto tickers
    ticker_pattern = r'\$([A-Z]{1,5})\b|\b(BTC|ETH|SOL|XRP|ADA|DOT|LINK|HYPE)\b'
    tickers = re.findall(ticker_pattern, text)
    tickers = [t[0] if isinstance(t, tuple) else t for t in tickers]
    entities["tickers"] = list(set(tickers))
    
    # People (capitalized words that could be names)
    name_pattern = r'\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b'
    potential_names = re.findall(name_pattern, text)
    # Filter out common false positives
    false_positives = ["The", "This", "That", "Read", "More", "Last", "First", "New", "Old"]
    people = [n for n in potential_names if not any(n.startswith(fp) for fp in false_positives)]
    entities["people"] = list(set(people))[:10]  # Limit to 10
    
    # Monetary amounts
    amount_pattern = r'\$[\d,]+(?:\.\d+)?\s*(?:million|billion|B|M)?|\b[\d,]+(?:\.\d+)?\s*(?:million|billion|BTC|ETH)\b'
    amounts = re.findall(amount_pattern, text, re.IGNORECASE)
    entities["amounts"] = list(set(amounts))[:10]
    
    return entities


def process_article(source: str, source_type: str = "url", include_sentiment: bool = False) -> dict:
    """Main processing function"""
    
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
    else:
        return {
            "success": False,
            "message": f"Unknown source type: {source_type}",
            "data": None
        }
    
    # Extract key points
    key_points = extract_key_points(content)
    
    # Extract entities
    entities = extract_entities(content)
    
    result = {
        "success": True,
        "message": f"Extracted {len(key_points)} key points",
        "data": {
            "title": title if source_type == "url" else None,
            "source": source,
            "key_points": key_points,
            "entities": entities
        }
    }
    
    # Add sentiment if requested
    if include_sentiment:
        result["data"]["sentiment"] = analyze_sentiment(content)
    
    return result


def main():
    parser = argparse.ArgumentParser(description="Extract key points from articles")
    parser.add_argument("--url", "-u", help="URL of article")
    parser.add_argument("--file", "-f", help="Path to text file")
    parser.add_argument("--sentiment", "-s", action="store_true", help="Include sentiment analysis")
    parser.add_argument("--points", "-p", type=int, default=5, help="Number of key points")
    
    args = parser.parse_args()
    
    if args.url:
        result = process_article(args.url, "url", args.sentiment)
    elif args.file:
        result = process_article(args.file, "file", args.sentiment)
    else:
        parser.print_help()
        sys.exit(1)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()

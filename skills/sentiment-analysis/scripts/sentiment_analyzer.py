#!/usr/bin/env python3
"""
Sentiment Analysis - Analyze text sentiment for trading signals.
Usage: python sentiment_analyzer.py --text "Bitcoin is going to the moon!"
"""

import argparse
import re
from typing import Dict, List

# Sentiment lexicons
BULLISH_WORDS = [
    "surge", "rally", "moon", "bull", "bullish", "pump", "gain", "growth",
    "profit", "breakout", " ATH", "all time high", "skyrocket", "explode",
    "rocket", "soar", "boom", "massive", "huge", "incredible", "amazing",
    "strong", "powerful", "up", "rising", "climb", "green", "mooning"
]

BEARISH_WORDS = [
    "crash", "dump", "bear", "bearish", "drop", "fall", "decline", "loss",
    "panic", "sell", "selling", "capitulation", "bottom", "ATL", "death",
    "collapse", "plunge", "tank", "crash", "red", "bloodbath", "fear",
    "scared", "worried", "down", "falling", "dropping", "plummet"
]

NEUTRAL_WORDS = [
    "hold", "holding", "stable", "flat", "sideways", "consolidate", "wait",
    "watching", "uncertain", "unclear", "mixed", "neutral", "range"
]


def analyze_sentiment(text: str) -> Dict:
    """Analyze sentiment of text."""
    text_lower = text.lower()
    
    # Count sentiment words
    bullish_count = sum(1 for word in BULLISH_WORDS if word in text_lower)
    bearish_count = sum(1 for word in BEARISH_WORDS if word in text_lower)
    neutral_count = sum(1 for word in NEUTRAL_WORDS if word in text_lower)
    
    total_sentiment_words = bullish_count + bearish_count + neutral_count
    
    if total_sentiment_words == 0:
        return {
            "sentiment": "neutral",
            "score": 0.5,
            "confidence": 0.0,
            "bullish_signals": 0,
            "bearish_signals": 0,
            "neutral_signals": 0
        }
    
    # Calculate score (0 = bearish, 0.5 = neutral, 1 = bullish)
    bullish_score = bullish_count / total_sentiment_words
    bearish_score = bearish_count / total_sentiment_words
    
    score = 0.5 + (bullish_score * 0.5) - (bearish_score * 0.5)
    score = max(0.0, min(1.0, score))  # Clamp between 0 and 1
    
    # Determine sentiment label
    if score > 0.6:
        sentiment = "bullish"
    elif score < 0.4:
        sentiment = "bearish"
    else:
        sentiment = "neutral"
    
    # Calculate confidence based on total sentiment words
    confidence = min(1.0, total_sentiment_words / 5)
    
    return {
        "sentiment": sentiment,
        "score": round(score, 2),
        "confidence": round(confidence, 2),
        "bullish_signals": bullish_count,
        "bearish_signals": bearish_count,
        "neutral_signals": neutral_count
    }


def analyze_social_post(platform: str, text: str, engagement: int = 0) -> Dict:
    """Analyze a social media post with engagement weighting."""
    result = analyze_sentiment(text)
    
    # Weight by engagement (more likes/retweets = more significant)
    engagement_weight = min(1.5, 1 + (engagement / 1000))
    result["weighted_score"] = round(result["score"] * engagement_weight, 2)
    result["platform"] = platform
    result["engagement"] = engagement
    
    return result


def batch_analyze(texts: List[str]) -> Dict:
    """Analyze multiple texts and aggregate sentiment."""
    results = [analyze_sentiment(text) for text in texts]
    
    avg_score = sum(r["score"] for r in results) / len(results)
    avg_confidence = sum(r["confidence"] for r in results) / len(results)
    
    bullish_count = sum(1 for r in results if r["sentiment"] == "bullish")
    bearish_count = sum(1 for r in results if r["sentiment"] == "bearish")
    neutral_count = sum(1 for r in results if r["sentiment"] == "neutral")
    
    if avg_score > 0.6:
        overall = "bullish"
    elif avg_score < 0.4:
        overall = "bearish"
    else:
        overall = "neutral"
    
    return {
        "overall_sentiment": overall,
        "average_score": round(avg_score, 2),
        "average_confidence": round(avg_confidence, 2),
        "total_analyzed": len(results),
        "sentiment_breakdown": {
            "bullish": bullish_count,
            "bearish": bearish_count,
            "neutral": neutral_count
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Analyze sentiment of text")
    parser.add_argument("--text", help="Text to analyze")
    parser.add_argument("--file", help="File containing text to analyze")
    parser.add_argument("--platform", help="Platform (twitter, reddit, etc.)")
    parser.add_argument("--engagement", type=int, default=0, help="Engagement count (likes/retweets)")
    
    args = parser.parse_args()
    
    if args.file:
        with open(args.file) as f:
            text = f.read()
    elif args.text:
        text = args.text
    else:
        print("Please provide --text or --file")
        return
    
    if args.platform:
        result = analyze_social_post(args.platform, text, args.engagement)
    else:
        result = analyze_sentiment(text)
    
    print(f"\n📊 Sentiment Analysis")
    print(f"Sentiment: {result['sentiment'].upper()}")
    print(f"Score: {result['score']}")
    if 'confidence' in result:
        print(f"Confidence: {result['confidence']}")
    if 'bullish_signals' in result:
        print(f"Signals - Bullish: {result['bullish_signals']}, Bearish: {result['bearish_signals']}, Neutral: {result['neutral_signals']}")


if __name__ == "__main__":
    main()

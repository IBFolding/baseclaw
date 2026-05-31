#!/usr/bin/env python3
"""
News Summarizer - Bias Detection Script
Analyze articles for potential bias indicators
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

from summarize import fetch_article


def detect_emotional_language(text: str) -> list:
    """Detect emotionally charged language"""
    
    emotional_words = {
        "high": [
            "disaster", "catastrophe", "crisis", "devastating", "shocking",
            "unbelievable", "outrageous", "scandal", "disgraceful", "terrible",
            "horrific", "massive", "huge", "enormous", "skyrocketing",
            "plummeting", "crashing", "soaring", "exploding", "meltdown"
        ],
        "medium": [
            "surge", "plunge", "tumble", "rally", "crash", "boom", "bust",
            "controversial", "alarming", "concerning", "worrisome", "troubling",
            "optimistic", "pessimistic", "bullish", "bearish", "fear", "greed"
        ]
    }
    
    text_lower = text.lower()
    found = []
    
    for severity, words in emotional_words.items():
        for word in words:
            pattern = r'\b' + re.escape(word) + r'\b'
            matches = re.findall(pattern, text_lower)
            if matches:
                # Find context
                for match in re.finditer(pattern, text_lower):
                    start = max(0, match.start() - 50)
                    end = min(len(text), match.end() + 50)
                    context = text[start:end].strip()
                    found.append({
                        "word": word,
                        "severity": severity,
                        "context": context
                    })
    
    return found


def detect_opinion_statements(text: str) -> list:
    """Detect opinion vs fact statements"""
    
    opinion_indicators = [
        "i think", "i believe", "in my opinion", "it seems", "apparently",
        "undoubtedly", "clearly", "obviously", "certainly", "definitely",
        "should", "must", "need to", "ought to", "would be better",
        "best", "worst", "most important", "crucial", "essential",
        "unfortunately", "luckily", "amazingly", "surprisingly"
    ]
    
    text_lower = text.lower()
    opinions = []
    
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    for sentence in sentences:
        sentence_lower = sentence.lower()
        for indicator in opinion_indicators:
            if indicator in sentence_lower:
                opinions.append({
                    "indicator": indicator,
                    "sentence": sentence.strip()
                })
                break
    
    return opinions


def detect_source_imbalance(text: str) -> dict:
    """Check for lack of source diversity"""
    
    # Look for attribution patterns
    attribution_patterns = [
        r'according to ([^,.]+)',
        r'([^,.]+) (?:said|stated|claimed|argued|suggested)',
        r'(?:said|stated) by ([^,.]+)',
        r'(?:source|sources)[:\s]+([^,.\n]+)'
    ]
    
    sources = []
    for pattern in attribution_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        sources.extend(matches)
    
    # Clean up sources
    sources = [s.strip() for s in sources if len(s.strip()) > 3]
    
    source_count = len(set(sources))
    total_mentions = len(sources)
    
    if source_count == 0:
        return {
            "score": 1.0,
            "level": "high",
            "sources_found": 0,
            "note": "No attributed sources found - potential bias risk"
        }
    elif source_count == 1:
        return {
            "score": 0.7,
            "level": "medium",
            "sources_found": source_count,
            "sources": list(set(sources)),
            "note": "Single source - limited perspective"
        }
    elif source_count <= 2:
        return {
            "score": 0.4,
            "level": "low",
            "sources_found": source_count,
            "sources": list(set(sources))
        }
    else:
        return {
            "score": 0.1,
            "level": "minimal",
            "sources_found": source_count,
            "sources": list(set(sources))[:5]
        }


def detect_political_bias(text: str) -> dict:
    """Simple political leaning detection"""
    
    text_lower = text.lower()
    
    left_indicators = [
        "regulation", "consumer protection", "workers", "inequality",
        "corporate greed", "wealth gap", "social justice", "systemic"
    ]
    
    right_indicators = [
        "free market", "deregulation", "innovation", "competition",
        "individual freedom", "limited government", "fiscal responsibility"
    ]
    
    left_count = sum(1 for w in left_indicators if w in text_lower)
    right_count = sum(1 for w in right_indicators if w in text_lower)
    
    total = left_count + right_count
    
    if total == 0:
        return {"leaning": "neutral", "confidence": 0}
    
    ratio = (left_count - right_count) / total
    
    if ratio > 0.5:
        leaning = "left"
    elif ratio < -0.5:
        leaning = "right"
    else:
        leaning = "center"
    
    return {
        "leaning": leaning,
        "confidence": min(abs(ratio) * 100, 100),
        "left_indicators": left_count,
        "right_indicators": right_count
    }


def detect_sponsored_content(text: str) -> dict:
    """Detect potential sponsored/promotional content"""
    
    promotional_indicators = [
        "sponsored", "paid promotion", "partner", "affiliate",
        "disclaimer", "#ad", "promotional consideration", "courtesy of"
    ]
    
    text_lower = text.lower()
    
    found = []
    for indicator in promotional_indicators:
        if indicator in text_lower:
            found.append(indicator)
    
    # Check for excessive positive language about specific entities
    positive_words = ["amazing", "incredible", "revolutionary", "game-changing", "must-have"]
    positive_count = sum(text_lower.count(w) for w in positive_words)
    
    return {
        "disclosure_found": len(found) > 0,
        "disclosures": found,
        "promotional_language_score": min(positive_count / 5, 1.0),
        "potential_undisclosed": positive_count > 3 and not found
    }


def analyze_bias(source: str, source_type: str = "url", detailed: bool = False) -> dict:
    """Main bias analysis function"""
    
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
    
    # Run all detection methods
    emotional = detect_emotional_language(content)
    opinions = detect_opinion_statements(content)
    source_balance = detect_source_imbalance(content)
    political = detect_political_bias(content)
    sponsored = detect_sponsored_content(content)
    
    # Calculate overall bias score
    scores = [
        min(len(emotional) / 10, 1.0),  # Normalize emotional language
        min(len(opinions) / 10, 1.0),   # Normalize opinion statements
        source_balance["score"],
        sponsored["promotional_language_score"]
    ]
    
    overall_score = sum(scores) / len(scores)
    
    if overall_score > 0.6:
        bias_level = "high"
    elif overall_score > 0.4:
        bias_level = "medium"
    elif overall_score > 0.2:
        bias_level = "low"
    else:
        bias_level = "minimal"
    
    result = {
        "success": True,
        "message": f"Bias analysis complete - {bias_level} bias detected",
        "data": {
            "title": title if source_type == "url" else None,
            "source": source,
            "bias_score": round(overall_score, 2),
            "bias_level": bias_level,
            "summary": {
                "emotional_language_count": len(emotional),
                "opinion_statements_count": len(opinions),
                "source_diversity": source_balance,
                "political_leaning": political,
                "sponsored_content": sponsored
            }
        }
    }
    
    if detailed:
        result["data"]["details"] = {
            "emotional_language": emotional[:10],  # Limit details
            "opinion_statements": opinions[:10]
        }
    
    return result


def main():
    parser = argparse.ArgumentParser(description="Detect bias in articles")
    parser.add_argument("--url", "-u", help="URL of article to analyze")
    parser.add_argument("--file", "-f", help="Path to text file")
    parser.add_argument("--report", "-r", action="store_true", help="Generate detailed report")
    
    args = parser.parse_args()
    
    if args.url:
        result = analyze_bias(args.url, "url", args.report)
    elif args.file:
        result = analyze_bias(args.file, "file", args.report)
    else:
        parser.print_help()
        sys.exit(1)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()

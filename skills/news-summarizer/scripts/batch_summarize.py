#!/usr/bin/env python3
"""
News Summarizer - Batch Processing Script
Process multiple articles at once
"""

import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

from summarize import summarize_article
from extract_keypoints import process_article as extract_points
from detect_bias import analyze_bias


def process_single_url(url: str, include_keypoints: bool = False, 
                       include_bias: bool = False) -> dict:
    """Process a single URL"""
    
    result = {
        "url": url,
        "summary": None,
        "key_points": None,
        "bias": None,
        "error": None
    }
    
    try:
        # Get summary
        summary_result = summarize_article(url, "url", "medium")
        if summary_result["success"]:
            result["summary"] = summary_result["data"]
        else:
            result["error"] = summary_result["message"]
            return result
        
        # Get key points if requested
        if include_keypoints:
            kp_result = extract_points(url, "url")
            if kp_result["success"]:
                result["key_points"] = kp_result["data"]
        
        # Get bias analysis if requested
        if include_bias:
            bias_result = analyze_bias(url, "url")
            if bias_result["success"]:
                result["bias"] = bias_result["data"]
        
        return result
    
    except Exception as e:
        result["error"] = str(e)
        return result


def batch_process(urls: list, include_keypoints: bool = False,
                  include_bias: bool = False, max_workers: int = 3) -> dict:
    """Process multiple URLs in parallel"""
    
    results = []
    successful = 0
    failed = 0
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {
            executor.submit(process_single_url, url, include_keypoints, include_bias): url
            for url in urls
        }
        
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()
                results.append(result)
                if result["error"]:
                    failed += 1
                else:
                    successful += 1
            except Exception as e:
                results.append({
                    "url": url,
                    "error": str(e)
                })
                failed += 1
    
    return {
        "success": True,
        "message": f"Batch processing complete: {successful} succeeded, {failed} failed",
        "data": {
            "total": len(urls),
            "successful": successful,
            "failed": failed,
            "results": results
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Batch process articles")
    parser.add_argument("--urls", "-u", help="Comma-separated list of URLs")
    parser.add_argument("--list", "-l", help="File containing URLs (one per line)")
    parser.add_argument("--output", "-o", help="Output JSON file path")
    parser.add_argument("--keypoints", "-k", action="store_true", 
                       help="Include key points extraction")
    parser.add_argument("--bias", "-b", action="store_true",
                       help="Include bias analysis")
    parser.add_argument("--workers", "-w", type=int, default=3,
                       help="Max parallel workers (default: 3)")
    
    args = parser.parse_args()
    
    # Collect URLs
    urls = []
    if args.urls:
        urls = [u.strip() for u in args.urls.split(",") if u.strip()]
    elif args.list:
        try:
            with open(args.list) as f:
                urls = [line.strip() for line in f if line.strip()]
        except Exception as e:
            print(json.dumps({
                "success": False,
                "message": f"Failed to read URL list: {str(e)}",
                "data": None
            }))
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)
    
    if not urls:
        print(json.dumps({
            "success": False,
            "message": "No URLs provided",
            "data": None
        }))
        sys.exit(1)
    
    # Process URLs
    result = batch_process(urls, args.keypoints, args.bias, args.workers)
    
    # Save to file if requested
    if args.output:
        with open(args.output, "w") as f:
            json.dump(result, f, indent=2)
        result["output_file"] = args.output
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()

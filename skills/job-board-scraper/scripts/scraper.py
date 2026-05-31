#!/usr/bin/env python3
"""
Job Board Scraper - Find freelance opportunities
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urljoin, quote

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: Required packages not installed.")
    print("Run: pip install requests beautifulsoup4")
    sys.exit(1)

# Data directories
DATA_DIR = Path.home() / ".openclaw"
SEARCH_DIR = DATA_DIR / "job-searches"
TEMPLATE_DIR = DATA_DIR / "job-templates"


def ensure_dirs():
    """Create necessary directories"""
    SEARCH_DIR.mkdir(parents=True, exist_ok=True)
    TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)


def load_config() -> Dict:
    """Load configuration"""
    config_path = DATA_DIR / "job-config.json"
    if config_path.exists():
        with open(config_path) as f:
            return json.load(f)
    return {
        "filters": {
            "min_budget": 0,
            "remote_only": True
        },
        "rate_limit_delay": 5
    }


def save_search_results(source: str, jobs: List[Dict]):
    """Save search results"""
    ensure_dirs()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{source}_{timestamp}.json"
    filepath = SEARCH_DIR / filename
    
    with open(filepath, 'w') as f:
        json.dump({
            "source": source,
            "timestamp": datetime.now().isoformat(),
            "jobs": jobs
        }, f, indent=2)
    
    return filepath


def scrape_hn_whoishiring() -> List[Dict]:
    """Scrape Hacker News 'Who is Hiring' thread"""
    jobs = []
    
    try:
        # Get the latest "Who is Hiring" post
        resp = requests.get(
            "https://hn.algolia.com/api/v1/search?query=who+is+hiring&tags=story&hitsPerPage=1",
            timeout=30
        )
        data = resp.json()
        
        if data.get('hits'):
            post_id = data['hits'][0]['objectID']
            
            # Get comments (job postings)
            resp = requests.get(
                f"https://hn.algolia.com/api/v1/search?tags=comment,story_{post_id}&hitsPerPage=100",
                timeout=30
            )
            comments = resp.json()
            
            for hit in comments.get('hits', []):
                text = hit.get('comment_text', '')
                if text:
                    # Extract job details
                    job = {
                        "id": f"hn-{hit['objectID']}",
                        "title": hit.get('story_title', 'Job Posting'),
                        "company": extract_company(text),
                        "description": text[:500] + "..." if len(text) > 500 else text,
                        "location": extract_location(text),
                        "remote": 'remote' in text.lower(),
                        "url": f"https://news.ycombinator.com/item?id={hit['objectID']}",
                        "source": "Hacker News",
                        "posted_at": datetime.fromtimestamp(hit['created_at_i']).isoformat()
                    }
                    jobs.append(job)
        
        time.sleep(1)  # Rate limiting
        
    except Exception as e:
        print(f"Error scraping HN: {e}")
    
    return jobs


def scrape_remoteok(query: str = "") -> List[Dict]:
    """Scrape RemoteOK jobs"""
    jobs = []
    
    try:
        url = "https://remoteok.com/api"
        resp = requests.get(url, timeout=30)
        
        if resp.status_code == 200:
            data = resp.json()
            
            for item in data:
                if isinstance(item, dict) and item.get('position'):
                    job = {
                        "id": f"ro-{item.get('id', '')}",
                        "title": item.get('position', ''),
                        "company": item.get('company', 'Unknown'),
                        "description": item.get('description', '')[:500],
                        "location": item.get('location', 'Remote'),
                        "remote": True,
                        "url": item.get('url', ''),
                        "source": "RemoteOK",
                        "tags": item.get('tags', []),
                        "posted_at": item.get('date', '')
                    }
                    
                    # Filter by query
                    if query:
                        search_text = f"{job['title']} {job['description']} {' '.join(job['tags'])}"
                        if query.lower() not in search_text.lower():
                            continue
                    
                    jobs.append(job)
        
        time.sleep(1)
        
    except Exception as e:
        print(f"Error scraping RemoteOK: {e}")
    
    return jobs


def scrape_weworkremotely(query: str = "") -> List[Dict]:
    """Scrape We Work Remotely jobs via RSS"""
    jobs = []
    
    try:
        import feedparser
        
        feed = feedparser.parse("https://weworkremotely.com/remote-jobs.rss")
        
        for entry in feed.entries:
            job = {
                "id": f"wwr-{hash(entry.link) & 0xFFFFFFFF}",
                "title": entry.title,
                "company": entry.title.split(":" )[0] if ":" in entry.title else "Unknown",
                "description": entry.summary[:500] if entry.summary else "",
                "location": "Remote",
                "remote": True,
                "url": entry.link,
                "source": "We Work Remotely",
                "posted_at": entry.published if hasattr(entry, 'published') else ""
            }
            
            # Filter by query
            if query:
                if query.lower() not in f"{job['title']} {job['description']}".lower():
                    continue
            
            jobs.append(job)
        
        time.sleep(1)
        
    except ImportError:
        print("feedparser not installed. Run: pip install feedparser")
    except Exception as e:
        print(f"Error scraping WWR: {e}")
    
    return jobs


def extract_company(text: str) -> str:
    """Extract company name from job text"""
    patterns = [
        r"([A-Z][A-Za-z0-9\s]+)(?:\s+is\s+hiring|\s+\||\s+-)",
        r"(?:at|@)\s+([A-Z][A-Za-z0-9\s]+)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
    
    return "Unknown"


def extract_location(text: str) -> str:
    """Extract location from job text"""
    if 'remote' in text.lower():
        return "Remote"
    
    patterns = [
        r"(?:in|located\s+in)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2})?)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    
    return "Not specified"


def filter_jobs(jobs: List[Dict], config: Dict) -> List[Dict]:
    """Filter jobs based on configuration"""
    filters = config.get("filters", {})
    min_budget = filters.get("min_budget", 0)
    max_budget = filters.get("max_budget", float('inf'))
    required_skills = filters.get("skills", [])
    exclude_terms = filters.get("exclude", [])
    remote_only = filters.get("remote_only", False)
    
    filtered = []
    
    for job in jobs:
        # Remote filter
        if remote_only and not job.get('remote', False):
            continue
        
        # Budget filter
        budget = job.get('budget', 0)
        if budget and (budget < min_budget or budget > max_budget):
            continue
        
        # Skills filter
        if required_skills:
            job_text = f"{job.get('title', '')} {job.get('description', '')}"
            if not any(skill.lower() in job_text.lower() for skill in required_skills):
                continue
        
        # Exclude filter
        if exclude_terms:
            job_text = f"{job.get('title', '')} {job.get('description', '')}".lower()
            if any(term.lower() in job_text for term in exclude_terms):
                continue
        
        filtered.append(job)
    
    return filtered


def display_jobs(jobs: List[Dict], limit: int = 20):
    """Display jobs in formatted table"""
    if not jobs:
        print("No jobs found matching your criteria.")
        return
    
    print(f"\n{'='*100}")
    print(f"Found {len(jobs)} job(s)")
    print(f"{'='*100}")
    print(f"{'ID':<15} {'Source':<15} {'Company':<20} {'Title':<45}")
    print(f"{'-'*100}")
    
    for job in jobs[:limit]:
        job_id = job.get('id', 'N/A')[:13]
        source = job.get('source', 'Unknown')[:13]
        company = job.get('company', 'Unknown')[:18]
        title = job.get('title', 'No title')[:43]
        
        remote = "🌐" if job.get('remote') else ""
        
        print(f"{job_id:<15} {source:<15} {company:<20} {title:<45} {remote}")
    
    if len(jobs) > limit:
        print(f"\n... and {len(jobs) - limit} more jobs")
    
    print(f"{'='*100}")


def show_job_details(job_id: str, jobs: List[Dict]):
    """Show detailed job information"""
    job = None
    for j in jobs:
        if j.get('id') == job_id:
            job = j
            break
    
    if not job:
        print(f"Job {job_id} not found in current results")
        return
    
    print(f"\n{'='*80}")
    print(f"📋 JOB DETAILS")
    print(f"{'='*80}")
    print(f"ID:       {job.get('id')}")
    print(f"Source:   {job.get('source')}")
    print(f"Title:    {job.get('title')}")
    print(f"Company:  {job.get('company')}")
    print(f"Location: {job.get('location')}")
    print(f"Remote:   {'Yes' if job.get('remote') else 'No'}")
    print(f"URL:      {job.get('url')}")
    if job.get('budget'):
        print(f"Budget:   ${job.get('budget')}")
    print(f"Posted:   {job.get('posted_at')}")
    print(f"{'='*80}")
    print(f"Description:")
    print(f"{job.get('description', 'No description')}")
    print(f"{'='*80}")


def main():
    parser = argparse.ArgumentParser(description='Job Board Scraper')
    parser.add_argument('--source', choices=['hn', 'remoteok', 'weworkremotely', 'all'],
                       default='all', help='Job source')
    parser.add_argument('--query', default='', help='Search query')
    parser.add_argument('--budget-min', type=int, default=0, help='Minimum budget')
    parser.add_argument('--remote-only', action='store_true', help='Remote jobs only')
    parser.add_argument('--skills', help='Required skills (comma-separated)')
    parser.add_argument('--show', help='Show details for specific job ID')
    parser.add_argument('--save', action='store_true', help='Save results to file')
    
    args = parser.parse_args()
    
    config = load_config()
    
    # Override config with command line args
    if args.budget_min > 0:
        config.setdefault("filters", {})["min_budget"] = args.budget_min
    if args.remote_only:
        config.setdefault("filters", {})["remote_only"] = True
    if args.skills:
        config.setdefault("filters", {})["skills"] = args.skills.split(",")
    
    all_jobs = []
    
    sources = ['hn', 'remoteok', 'weworkremotely'] if args.source == 'all' else [args.source]
    
    for source in sources:
        print(f"Scraping {source}...")
        
        if source == 'hn':
            jobs = scrape_hn_whoishiring()
        elif source == 'remoteok':
            jobs = scrape_remoteok(args.query)
        else:
            jobs = scrape_weworkremotely(args.query)
        
        all_jobs.extend(jobs)
        print(f"  Found {len(jobs)} jobs")
    
    # Filter jobs
    filtered_jobs = filter_jobs(all_jobs, config)
    
    # Show details for specific job
    if args.show:
        show_job_details(args.show, filtered_jobs)
    else:
        display_jobs(filtered_jobs)
    
    # Save results
    if args.save and filtered_jobs:
        filepath = save_search_results(args.source, filtered_jobs)
        print(f"\nResults saved to: {filepath}")


if __name__ == '__main__':
    main()

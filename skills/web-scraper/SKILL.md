---
name: web-scraper
description: Web scraping and data extraction for market intelligence, price monitoring, and alpha generation. Use when extracting data from websites, monitoring competitor prices, scraping news sources, tracking product availability, or gathering market intelligence. Triggers on "scrape", "monitor prices", "track", "extract data", "web crawler", or any data gathering from websites.
---

# Web Scraper

Extract data from any website. Build monitors, track prices, gather intelligence.

## Quick Start

### Scrape a single page
```python
import requests
from bs4 import BeautifulSoup

url = "https://example.com"
response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.content, 'html.parser')

# Extract data
prices = soup.find_all('span', class_='price')
for price in prices:
    print(price.text)
```

### Monitor prices continuously
Use `scripts/price_monitor.py` for production price tracking with alerts.

### Scrape news feeds
Use `scripts/news_scraper.py` for article extraction and summarization.

## Core Principles

1. **Respect robots.txt** - Check before scraping
2. **Rate limiting** - Max 1 request/sec to avoid blocks
3. **User-Agent rotation** - Rotate agents to prevent detection
4. **Error handling** - Sites change; handle failures gracefully
5. **Caching** - Don't re-fetch unchanged content

## Common Patterns

See [references/patterns.md](references/patterns.md) for:
- Price extraction patterns
- News/article scraping
- Pagination handling
- Login/authentication
- JavaScript rendering (Selenium)
- Anti-detection techniques

## Anti-Detection

Rotate these User-Agents:
```python
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
]
```

Use proxies for high-volume scraping:
```python
proxies = {
    'http': 'http://proxy:port',
    'https': 'https://proxy:port'
}
requests.get(url, proxies=proxies)
```

## Tools Available

- **requests** - HTTP library
- **BeautifulSoup** - HTML parsing
- **lxml** - Fast XML/HTML parsing
- **selenium** - Browser automation
- **scrapy** - Full scraping framework
- ** playwright** - Modern browser automation

## Use Cases

1. **Price Monitoring** - Track competitor prices, get alerts on drops
2. **News Aggregation** - Scrape financial news, sentiment analysis
3. **Product Availability** - Monitor restocks, limited drops
4. **Market Research** - Gather data on competitors, trends
5. **Lead Generation** - Extract contact info, business data
6. **Alpha Generation** - Scrape alternative data sources

## Error Handling

Always wrap scrapes in try/except:
```python
try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
except requests.RequestException as e:
    print(f"Failed to fetch {url}: {e}")
    return None
```

## Legal Note

- Check website's Terms of Service
- Respect robots.txt
- Don't scrape personal data without consent
- Don't overwhelm servers (rate limit)

## Scripts

- `scripts/price_monitor.py` - Production price monitoring with alerts
- `scripts/news_scraper.py` - News article extraction and summarization
- `scripts/availability_checker.py` - Product restock monitoring

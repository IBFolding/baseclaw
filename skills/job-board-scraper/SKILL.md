# job-board-scraper

Find freelance gigs and auto-apply with templates.

## Features

- Scrape Upwork, Fiverr, and other job boards
- Filter by skills, budget, and job type
- Auto-apply with customizable templates
- Track applications and responses
- Rate limiting to avoid blocks
- New job alerts

## Usage

```bash
# Search Upwork for jobs
./scraper.py --source upwork --query "python developer" --budget-min 50

# Search with filters
./scraper.py --source fiverr --skills "react,nodejs" --remote-only

# Auto-apply with template
./scraper.py --source upwork --query "web scraping" --auto-apply --template python-dev

# Track applications
./tracker.py list
./tracker.py status JOB-001 --applied
./tracker.py stats
```

## Supported Platforms

| Platform | Search | Auto-Apply | Notes |
|----------|--------|------------|-------|
| Upwork | ✅ | ⚠️ API only | Requires API key |
| Fiverr | ✅ | ❌ | Public gigs only |
| We Work Remotely | ✅ | ❌ | RSS feed |
| RemoteOK | ✅ | ❌ | API available |
| Hacker News | ✅ | ❌ | Who is hiring |
| Freelancer | ⚠️ | ❌ | Requires API |

## Configuration

Create `~/.openclaw/job-config.json`:

```json
{
  "upwork": {
    "client_id": "your_client_id",
    "client_secret": "your_secret",
    "access_token": "your_token"
  },
  "filters": {
    "min_budget": 100,
    "max_budget": 5000,
    "skills": ["python", "javascript"],
    "exclude": ["wordpress", "php"],
    "remote_only": true
  },
  "templates": {
    "python-dev": "templates/python-dev.txt",
    "fullstack": "templates/fullstack.txt"
  }
}
```

## Templates

Create application templates in `~/.openclaw/job-templates/`:

```
~/.openclaw/job-templates/python-dev.txt
---
Subject: Application for {{job_title}}

Hi {{client_name}},

I saw your posting for {{job_title}} and I'm excited to apply. 
I have {{years}} years of experience with {{skills}}.

[Your cover letter here...]

Best regards,
{{my_name}}
```

## Rate Limiting

The scraper respects rate limits:
- Upwork: 100 requests/hour
- Others: 1 request/5 seconds

## Data Storage

```
~/.openclaw/
├── job-searches/      # Search results
├── job-applications/  # Applied jobs
└── job-config.json    # Configuration
```

## Requirements

- Python 3.8+
- requests, beautifulsoup4, feedparser

## Install

```bash
pip install requests beautifulsoup4 feedparser
```

## API Keys

### Upwork
1. Go to https://developers.upwork.com/
2. Create a new app
3. Get Client ID and Secret
4. Generate access token

### RemoteOK
Public API, no key needed

## Disclaimer

Auto-apply features should be used responsibly. Some platforms prohibit automated applications. Always review terms of service.

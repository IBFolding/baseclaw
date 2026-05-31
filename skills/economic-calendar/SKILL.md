# economic-calendar

Track market-moving economic events and get alerts before they happen.

## Features

- Fed meetings and interest rate decisions
- Earnings releases for major companies
- Economic indicators (CPI, jobs, GDP, etc.)
- Custom alert thresholds
- Export to calendar formats

## Usage

```bash
# Show upcoming events for this week
./calendar.py --week

# Show events for specific date
./calendar.py --date 2024-03-15

# Filter by type
./calendar.py --type fed --days 30

# Set up alerts
./calendar.py --alert --email user@example.com

# Export to iCal format
./calendar.py --export calendar.ics --month
```

## Event Types

- **fed** - Federal Reserve meetings, rate decisions
- **earnings** - Company earnings releases
- **economic** - CPI, PPI, jobs reports, GDP
- **all** - All event types

## Data Sources

- Federal Reserve Calendar
- Earnings data from Yahoo Finance
- Economic indicators from FRED/BLS

## Configuration

Create `~/.openclaw/econ-config.json`:
```json
{
  "alerts": {
    "fed": true,
    "earnings": ["AAPL", "TSLA", "NVDA"],
    "indicators": ["CPI", "NFP"]
  },
  "alert_hours_before": 24,
  "notification_email": "user@example.com"
}
```

## Requirements

- Python 3.8+
- requests, icalendar (for export)

## Install

```bash
pip install requests icalendar
```

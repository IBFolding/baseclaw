# Web Scraping Patterns

Common patterns for extracting data from websites.

## Price Extraction

### Basic Price Selector
```python
# Find price by class
price = soup.select_one('.price').get_text()

# Find by ID
price = soup.find(id='product-price').get_text()

# Find by attribute
price = soup.find(attrs={'data-testid': 'price'}).get_text()

# Multiple attempts
selectors = ['.price', '.product-price', '[data-price]', '.current-price']
for sel in selectors:
    elem = soup.select_one(sel)
    if elem:
        price = elem.get_text()
        break
```

### Price Parsing
```python
import re

def parse_price(text: str) -> float:
    """Extract numeric price from text."""
    # Remove currency symbols and whitespace
    cleaned = re.sub(r'[^\d.,]', '', text)
    
    # Handle European format (1.234,56)
    if ',' in cleaned and '.' in cleaned:
        if cleaned.rfind(',') > cleaned.rfind('.'):
            cleaned = cleaned.replace('.', '').replace(',', '.')
        else:
            cleaned = cleaned.replace(',', '')
    elif ',' in cleaned:
        cleaned = cleaned.replace(',', '.')
    
    return float(cleaned)
```

## Pagination

### Page Numbers
```python
# Get last page number
pagination = soup.select('.pagination a')
last_page = int(pagination[-1].get_text())

# Loop through pages
for page in range(1, last_page + 1):
    url = f"{base_url}?page={page}"
    # scrape page...
```

### "Load More" Buttons
```python
from selenium import webdriver

driver = webdriver.Chrome()
driver.get(url)

while True:
    try:
        load_more = driver.find_element_by_css_selector('.load-more')
        load_more.click()
        time.sleep(2)  # Wait for content
    except:
        break  # No more pages

html = driver.page_source
```

### Infinite Scroll
```python
from selenium import webdriver

driver = webdriver.Chrome()
driver.get(url)

last_height = driver.execute_script("return document.body.scrollHeight")

while True:
    # Scroll down
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    
    # Check if more content loaded
    new_height = driver.execute_script("return document.body.scrollHeight")
    if new_height == last_height:
        break
    last_height = new_height
```

## Login/Authentication

### Session-based Login
```python
import requests

session = requests.Session()

# Login
login_data = {
    'username': 'your_username',
    'password': 'your_password'
}
session.post('https://example.com/login', data=login_data)

# Now session has cookies, use it for scraping
response = session.get('https://example.com/protected-page')
```

### Token-based Auth
```python
headers = {
    'Authorization': 'Bearer your_api_token'
}
response = requests.get(url, headers=headers)
```

## Anti-Detection

### Rotating User Agents
```python
import random

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
]

headers = {
    "User-Agent": random.choice(USER_AGENTS)
}
```

### Using Proxies
```python
proxies = {
    "http": "http://proxy.example.com:8080",
    "https": "https://proxy.example.com:8080",
}

response = requests.get(url, proxies=proxies)
```

### Adding Delays
```python
import time
import random

# Random delay between 1-3 seconds
time.sleep(random.uniform(1, 3))
```

### Handling CAPTCHAs
```python
# 2captcha integration
import requests

def solve_captcha(site_key: str, page_url: str) -> str:
    api_key = "your_2captcha_key"
    
    # Submit CAPTCHA
    result = requests.post("http://2captcha.com/in.php", data={
        "key": api_key,
        "method": "userrecaptcha",
        "googlekey": site_key,
        "pageurl": page_url,
        "json": 1
    }).json()
    
    captcha_id = result["request"]
    
    # Wait for solution
    while True:
        time.sleep(5)
        result = requests.get(f"http://2captcha.com/res.php?key={api_key}&action=get&id={captcha_id}&json=1").json()
        if result["request"] != "CAPCHA_NOT_READY":
            return result["request"]
```

## JavaScript Rendering

### Selenium
```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")

driver = webdriver.Chrome(options=options)
driver.get(url)

# Wait for element
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

element = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located(("css selector", ".product"))
)

html = driver.page_source
driver.quit()
```

### Playwright
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(url)
    
    # Wait for network to be idle
    page.wait_for_load_state("networkidle")
    
    html = page.content()
    browser.close()
```

## Data Storage

### JSON Lines (for large datasets)
```python
import json

# Write
with open("data.jsonl", "a") as f:
    for item in data:
        f.write(json.dumps(item) + "\n")

# Read
with open("data.jsonl") as f:
    for line in f:
        item = json.loads(line)
        # process item...
```

### SQLite (structured storage)
```python
import sqlite3

conn = sqlite3.connect("scraped_data.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        url TEXT,
        title TEXT,
        price REAL,
        scraped_at TIMESTAMP
    )
""")

cursor.execute(
    "INSERT INTO products (url, title, price, scraped_at) VALUES (?, ?, ?, ?)",
    (url, title, price, datetime.now())
)
conn.commit()
```

## Error Handling

### Retry Logic
```python
from functools import wraps
import time

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay * (attempt + 1))
        return wrapper
    return decorator

@retry(max_attempts=3)
def fetch_url(url):
    return requests.get(url)
```

## Common Site Patterns

### E-commerce
```python
# Amazon
price = soup.select_one('.a-price-whole').get_text()
title = soup.select_one('#productTitle').get_text(strip=True)

# eBay
price = soup.select_one('.notranslate').get_text()
title = soup.select_one('h1').get_text(strip=True)

# Walmart
price = soup.select_one('[itemprop="price"]').get('content')
```

### News Sites
```python
# Generic article extraction
title = soup.find('h1').get_text()
author = soup.select_one('.author, .byline').get_text()
date = soup.find('time').get('datetime')
content = '\n'.join(p.get_text() for p in soup.select('article p'))
```

### Social Media
```python
# Twitter/X (requires API or selenium)
# Instagram (requires API)
# Reddit (has API: https://www.reddit.com/dev/api/)
```

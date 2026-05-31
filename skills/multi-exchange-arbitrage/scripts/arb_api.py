#!/usr/bin/env python3
"""
Arbitrage Scanner API - Web service for real-time arbitrage monitoring
Run: python3 arb_api.py
"""

import asyncio
import json
from datetime import datetime
from aiohttp import web
import sys
sys.path.insert(0, '/opt/arb-scanner')
from arbitrage_scanner import fetch_all_prices, find_arbitrage_opportunities

# Global state
latest_scan = {}
scan_history = []
MAX_HISTORY = 100

async def run_scan(symbol="BTC/USDT", capital=1000, min_spread=0.3):
    """Run a scan and store results."""
    global latest_scan
    
    try:
        prices = await fetch_all_prices(symbol, include_dex=True, include_hyperliquid=True)
        
        cex_prices = [p for p in prices if p.source == "cex"]
        dex_prices = [p for p in prices if p.source == "dex"]
        
        opportunities = find_arbitrage_opportunities(prices, min_spread)
        
        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "symbol": symbol,
            "capital": capital,
            "min_spread": min_spread,
            "cex_count": len(cex_prices),
            "dex_count": len(dex_prices),
            "opportunities_count": len(opportunities),
            "cex_prices": [{"exchange": p.exchange, "bid": p.bid, "ask": p.ask} for p in cex_prices],
            "dex_prices": [{"exchange": p.exchange, "bid": p.bid, "ask": p.ask} for p in dex_prices],
            "opportunities": opportunities[:5],
            "best_spread": opportunities[0]["profit_after_fees"] if opportunities else 0
        }
        
        latest_scan = result
        scan_history.append(result)
        if len(scan_history) > MAX_HISTORY:
            scan_history.pop(0)
        
        return result
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}

async def background_scanner():
    """Background task to scan every 60 seconds."""
    symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
    while True:
        for symbol in symbols:
            await run_scan(symbol)
        await asyncio.sleep(60)

# Web handlers
async def index(request):
    """Root endpoint - status."""
    return web.json_response({
        "service": "Arbitrage Scanner API",
        "status": "running",
        "endpoints": [
            "/api/status",
            "/api/scan?symbol=BTC/USDT",
            "/api/latest",
            "/api/history",
            "/api/opportunities"
        ],
        "timestamp": datetime.utcnow().isoformat()
    })

async def status(request):
    """Get scanner status."""
    return web.json_response({
        "status": "running",
        "latest_scan": latest_scan.get("timestamp"),
        "history_count": len(scan_history),
        "monitored_pairs": ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
    })

async def scan(request):
    """Trigger a fresh scan."""
    symbol = request.query.get("symbol", "BTC/USDT")
    capital = float(request.query.get("capital", 1000))
    min_spread = float(request.query.get("min_spread", 0.3))
    
    result = await run_scan(symbol, capital, min_spread)
    return web.json_response(result)

async def latest(request):
    """Get latest scan results."""
    if not latest_scan:
        return web.json_response({"error": "No scans yet"}, status=404)
    return web.json_response(latest_scan)

async def history(request):
    """Get scan history."""
    limit = int(request.query.get("limit", 50))
    return web.json_response(scan_history[-limit:])

async def opportunities(request):
    """Get only opportunities above threshold."""
    min_profit = float(request.query.get("min_profit", 0.5))
    all_opps = []
    
    for scan in scan_history:
        for opp in scan.get("opportunities", []):
            if opp.get("profit_after_fees", 0) >= min_profit:
                all_opps.append({
                    **opp,
                    "detected_at": scan.get("timestamp")
                })
    
    all_opps.sort(key=lambda x: x.get("profit_after_fees", 0), reverse=True)
    return web.json_response(all_opps[:20])

# Create app
app = web.Application()
app.router.add_get("/", index)
app.router.add_get("/api/status", status)
app.router.add_get("/api/scan", scan)
app.router.add_get("/api/latest", latest)
app.router.add_get("/api/history", history)
app.router.add_get("/api/opportunities", opportunities)

async def start_background_tasks(app):
    app["scanner"] = asyncio.create_task(background_scanner())

async def cleanup_background_tasks(app):
    app["scanner"].cancel()
    await app["scanner"]

app.on_startup.append(start_background_tasks)
app.on_cleanup.append(cleanup_background_tasks)

if __name__ == "__main__":
    print("🚀 Starting Arbitrage Scanner API on port 8081...")
    web.run_app(app, host="0.0.0.0", port=8081)

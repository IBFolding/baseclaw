#!/usr/bin/env python3
"""
Multi-Exchange Arbitrage - Compare prices across CEXs and DEXs for arbitrage opportunities.
Usage: python arbitrage_scanner.py --symbol BTC/USDT
"""

import argparse
import json
import asyncio
import aiohttp
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class PriceData:
    exchange: str
    symbol: str
    bid: float
    ask: float
    timestamp: float
    source: str = "cex"  # cex or dex


class ExchangeAPI:
    """Base class for exchange APIs."""
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        raise NotImplementedError


# ============== CEX APIs ==============

class HyperliquidAPI(ExchangeAPI):
    """Hyperliquid perpetual futures"""
    
    SYMBOL_MAP = {
        "BTC/USDT": "BTC",
        "ETH/USDT": "ETH",
        "SOL/USDT": "SOL",
    }
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from Hyperliquid."""
        if symbol not in self.SYMBOL_MAP:
            return None
        
        hl_symbol = self.SYMBOL_MAP[symbol]
        url = "https://api.hyperliquid.xyz/info"
        
        try:
            async with session.post(
                url,
                json={"type": "allMids"},
                timeout=5
            ) as response:
                if response.status != 200:
                    print(f"Hyperliquid HTTP {response.status}")
                    return None
                
                data = await response.json()
                
                # data is a dict of coin -> mid price
                mid_price = data.get(hl_symbol)
                if not mid_price:
                    return None
                
                price = float(mid_price)
                
                # Hyperliquid uses perps, so spread is typically tighter
                # Using 0.02% as typical spread for liquid perps
                spread = 0.0002
                return PriceData(
                    exchange="Hyperliquid",
                    symbol=symbol,
                    bid=price * (1 - spread),
                    ask=price * (1 + spread),
                    timestamp=0,
                    source="cex"
                )
        except Exception as e:
            print(f"Hyperliquid error: {e}")
            return None


class BinanceAPI(ExchangeAPI):
    """Binance Spot API"""
    
    SYMBOL_MAP = {
        "BTC/USDT": "BTCUSDT",
        "ETH/USDT": "ETHUSDT",
        "SOL/USDT": "SOLUSDT",
        "BNB/USDT": "BNBUSDT",
    }
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from Binance."""
        binance_symbol = self.SYMBOL_MAP.get(symbol, symbol.replace("/", ""))
        url = f"https://api.binance.com/api/v3/ticker/bookTicker?symbol={binance_symbol}"
        
        try:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    print(f"Binance HTTP {response.status}")
                    return None
                data = await response.json()
                
                # Handle error response
                if "code" in data:
                    print(f"Binance API error: {data.get('msg', 'Unknown error')}")
                    return None
                
                return PriceData(
                    exchange="Binance",
                    symbol=symbol,
                    bid=float(data.get("bidPrice", 0)),
                    ask=float(data.get("askPrice", 0)),
                    timestamp=data.get("time", 0) / 1000,
                    source="cex"
                )
        except Exception as e:
            print(f"Binance error: {e}")
            return None


class CoinbaseAPI(ExchangeAPI):
    """Coinbase Exchange API"""
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from Coinbase."""
        cb_symbol = symbol.replace("/", "-")
        url = f"https://api.exchange.coinbase.com/products/{cb_symbol}/ticker"
        
        try:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    print(f"Coinbase HTTP {response.status}")
                    return None
                data = await response.json()
                
                return PriceData(
                    exchange="Coinbase",
                    symbol=symbol,
                    bid=float(data.get("bid", 0)),
                    ask=float(data.get("ask", 0)),
                    timestamp=0,
                    source="cex"
                )
        except Exception as e:
            print(f"Coinbase error: {e}")
            return None


class KrakenAPI(ExchangeAPI):
    """Kraken API"""
    
    SYMBOL_MAP = {
        "BTC/USDT": "XBTUSDT",
        "ETH/USDT": "ETHUSDT",
        "SOL/USDT": "SOLUSDT",
    }
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from Kraken."""
        pair = self.SYMBOL_MAP.get(symbol, symbol.replace("/", ""))
        url = f"https://api.kraken.com/0/public/Ticker?pair={pair}"
        
        try:
            async with session.get(url, timeout=5) as response:
                data = await response.json()
                if data.get("error"):
                    print(f"Kraken API error: {data['error']}")
                    return None
                
                result = data.get("result", {})
                if not result:
                    return None
                    
                ticker = list(result.keys())[0]
                ticker_data = result[ticker]
                
                return PriceData(
                    exchange="Kraken",
                    symbol=symbol,
                    bid=float(ticker_data["b"][0]),
                    ask=float(ticker_data["a"][0]),
                    timestamp=0,
                    source="cex"
                )
        except Exception as e:
            print(f"Kraken error: {e}")
            return None


class BybitAPI(ExchangeAPI):
    """Bybit API"""
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from Bybit."""
        bybit_symbol = symbol.replace("/", "")
        url = f"https://api.bybit.com/v5/market/tickers?category=spot&symbol={bybit_symbol}"
        
        try:
            async with session.get(url, timeout=5) as response:
                data = await response.json()
                if data.get("retCode") != 0:
                    print(f"Bybit API error: {data.get('retMsg', 'Unknown')}")
                    return None
                
                tickers = data.get("result", {}).get("list", [])
                if not tickers:
                    return None
                
                ticker = tickers[0]
                return PriceData(
                    exchange="Bybit",
                    symbol=symbol,
                    bid=float(ticker.get("bid1Price", 0)),
                    ask=float(ticker.get("ask1Price", 0)),
                    timestamp=0,
                    source="cex"
                )
        except Exception as e:
            print(f"Bybit error: {e}")
            return None


class OKXAPI(ExchangeAPI):
    """OKX API"""
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from OKX."""
        okx_symbol = symbol.replace("/", "-")
        url = f"https://www.okx.com/api/v5/market/ticker?instId={okx_symbol}"
        
        try:
            async with session.get(url, timeout=5) as response:
                data = await response.json()
                if data.get("code") != "0":
                    print(f"OKX API error: {data.get('msg', 'Unknown')}")
                    return None
                
                tickers = data.get("data", [])
                if not tickers:
                    return None
                
                ticker = tickers[0]
                return PriceData(
                    exchange="OKX",
                    symbol=symbol,
                    bid=float(ticker.get("bidPx", 0)),
                    ask=float(ticker.get("askPx", 0)),
                    timestamp=0,
                    source="cex"
                )
        except Exception as e:
            print(f"OKX error: {e}")
            return None


# ============== DEX APIs ==============

class UniswapAPI(ExchangeAPI):
    """Uniswap V3 on Ethereum - uses CoinGecko for reliable pricing"""
    
    TOKEN_IDS = {
        "BTC/USDT": ("wrapped-bitcoin", "tether"),
        "ETH/USDT": ("ethereum", "tether"),
        "ETH/BTC": ("ethereum", "wrapped-bitcoin"),
    }
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from CoinGecko (aggregates Uniswap V3 + other DEXs)."""
        if symbol not in self.TOKEN_IDS:
            return None
        
        base_id, quote_id = self.TOKEN_IDS[symbol]
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={base_id},{quote_id}&vs_currencies=usd"
        
        try:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    return None
                data = await response.json()
                
                base_price = data.get(base_id, {}).get("usd", 0)
                quote_price = data.get(quote_id, {}).get("usd", 0)
                
                if base_price > 0 and quote_price > 0:
                    # Calculate pair price
                    if quote_id == "tether":
                        price = base_price  # USDT is ~$1
                    else:
                        price = base_price / quote_price
                    
                    spread = 0.005  # DEX spread
                    return PriceData(
                        exchange="Uniswap V3 (via CG)",
                        symbol=symbol,
                        bid=price * (1 - spread),
                        ask=price * (1 + spread),
                        timestamp=0,
                        source="dex"
                    )
                return None
        except Exception as e:
            print(f"Uniswap error: {e}")
            return None


class PancakeSwapAPI(ExchangeAPI):
    """PancakeSwap V3 on BSC - uses CoinGecko for reliable pricing"""
    
    TOKEN_IDS = {
        "BTC/USDT": ("binance-bitcoin", "tether"),
        "ETH/USDT": ("ethereum", "tether"),
        "BNB/USDT": ("binancecoin", "tether"),
    }
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from CoinGecko (aggregates PancakeSwap V3 + other DEXs)."""
        if symbol not in self.TOKEN_IDS:
            return None
        
        base_id, quote_id = self.TOKEN_IDS[symbol]
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={base_id},{quote_id}&vs_currencies=usd"
        
        try:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    return None
                data = await response.json()
                
                base_price = data.get(base_id, {}).get("usd", 0)
                quote_price = data.get(quote_id, {}).get("usd", 0)
                
                if base_price > 0 and quote_price > 0:
                    price = base_price  # USDT is ~$1
                    
                    spread = 0.005  # BSC DEX spread
                    return PriceData(
                        exchange="PancakeSwap V3 (via CG)",
                        symbol=symbol,
                        bid=price * (1 - spread),
                        ask=price * (1 + spread),
                        timestamp=0,
                        source="dex"
                    )
                return None
        except Exception as e:
            print(f"PancakeSwap error: {e}")
            return None


class RaydiumAPI(ExchangeAPI):
    """Raydium on Solana - uses CoinGecko for reliable pricing"""
    
    TOKEN_IDS = {
        "SOL/USDT": ("solana", "tether"),
    }
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from CoinGecko."""
        if symbol not in self.TOKEN_IDS:
            return None
        
        base_id, quote_id = self.TOKEN_IDS[symbol]
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={base_id},{quote_id}&vs_currencies=usd"
        
        try:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    return None
                data = await response.json()
                
                base_price = data.get(base_id, {}).get("usd", 0)
                quote_price = data.get(quote_id, {}).get("usd", 0)
                
                if base_price > 0 and quote_price > 0:
                    price = base_price  # USDT is ~$1
                    
                    spread = 0.005  # Raydium spread
                    return PriceData(
                        exchange="Raydium (via CG)",
                        symbol=symbol,
                        bid=price * (1 - spread),
                        ask=price * (1 + spread),
                        timestamp=0,
                        source="dex"
                    )
                return None
        except Exception as e:
            print(f"Raydium error: {e}")
            return None


class JupiterAPI(ExchangeAPI):
    """Jupiter Aggregator on Solana - uses CoinGecko for reliable pricing"""
    
    TOKEN_IDS = {
        "SOL/USDT": ("solana", "tether"),
    }
    
    async def get_price(self, session: aiohttp.ClientSession, symbol: str) -> Optional[PriceData]:
        """Get price from CoinGecko (aggregates Jupiter + other Solana DEXs)."""
        if symbol not in self.TOKEN_IDS:
            return None
        
        base_id, quote_id = self.TOKEN_IDS[symbol]
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={base_id},{quote_id}&vs_currencies=usd"
        
        try:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    return None
                data = await response.json()
                
                base_price = data.get(base_id, {}).get("usd", 0)
                quote_price = data.get(quote_id, {}).get("usd", 0)
                
                if base_price > 0 and quote_price > 0:
                    price = base_price  # USDT is ~$1
                    
                    spread = 0.005  # Solana DEX spread
                    return PriceData(
                        exchange="Jupiter (via CG)",
                        symbol=symbol,
                        bid=price * (1 - spread),
                        ask=price * (1 + spread),
                        timestamp=0,
                        source="dex"
                    )
                return None
        except Exception as e:
            print(f"Jupiter error: {e}")
            return None


# ============== Main Functions ==============

async def fetch_all_prices(symbol: str, include_dex: bool = True, include_hyperliquid: bool = True) -> List[PriceData]:
    """Fetch prices from all supported exchanges."""
    
    # CEX APIs
    cex_exchanges = {
        "Binance": BinanceAPI(),
        "Coinbase": CoinbaseAPI(),
        "Kraken": KrakenAPI(),
        "Bybit": BybitAPI(),
        "OKX": OKXAPI(),
    }
    
    if include_hyperliquid:
        cex_exchanges["Hyperliquid"] = HyperliquidAPI()
    
    # DEX APIs
    dex_exchanges = {
        "Uniswap V3": UniswapAPI(),
        "PancakeSwap V3": PancakeSwapAPI(),
        "Jupiter": JupiterAPI(),
        "Raydium": RaydiumAPI(),
    }
    
    exchanges = {**cex_exchanges}
    if include_dex:
        exchanges.update(dex_exchanges)
    
    async with aiohttp.ClientSession() as session:
        tasks = [
            exchange.get_price(session, symbol)
            for exchange in exchanges.values()
        ]
        results = await asyncio.gather(*tasks)
    
    return [r for r in results if r is not None]


def find_arbitrage_opportunities(prices: List[PriceData], min_spread: float = 0.5) -> List[Dict]:
    """Find arbitrage opportunities between exchanges."""
    opportunities = []
    
    # CEX fees (typical)
    CEX_FEE = 0.001  # 0.1%
    # DEX fees (higher due to gas + slippage)
    DEX_FEE = 0.005  # 0.5%
    
    for buy_exchange in prices:
        for sell_exchange in prices:
            if buy_exchange.exchange == sell_exchange.exchange:
                continue
            
            # Calculate fees based on source types
            buy_fee = DEX_FEE if buy_exchange.source == "dex" else CEX_FEE
            sell_fee = DEX_FEE if sell_exchange.source == "dex" else CEX_FEE
            total_fee = buy_fee + sell_fee
            
            # Buy low, sell high
            buy_price = buy_exchange.ask
            sell_price = sell_exchange.bid
            
            if buy_price <= 0 or sell_price <= 0:
                continue
            
            spread = ((sell_price - buy_price) / buy_price) * 100
            profit_after_fees = spread - (total_fee * 100)
            
            if profit_after_fees > min_spread:
                opportunities.append({
                    "buy_exchange": buy_exchange.exchange,
                    "sell_exchange": sell_exchange.exchange,
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "spread_pct": round(spread, 2),
                    "profit_after_fees": round(profit_after_fees, 2),
                    "symbol": buy_exchange.symbol,
                    "buy_source": buy_exchange.source,
                    "sell_source": sell_exchange.source,
                    "route": f"{buy_exchange.source.upper()} → {sell_exchange.source.upper()}"
                })
    
    # Sort by profit
    opportunities.sort(key=lambda x: x["profit_after_fees"], reverse=True)
    return opportunities


def calculate_position_size(capital: float, buy_price: float, sell_price: float, fees: float = 0.002) -> Dict:
    """Calculate optimal position size for arbitrage."""
    gross_profit = sell_price - buy_price
    net_profit = gross_profit * (1 - fees)
    
    if net_profit <= 0:
        return {"error": "No profit after fees"}
    
    position_size = capital * 0.10  # Use 10% of capital per trade
    
    return {
        "position_size": round(position_size, 2),
        "expected_profit": round(position_size * (net_profit / buy_price), 2),
        "roi_pct": round((net_profit / buy_price) * 100, 2)
    }


async def scan_arbitrage(symbol: str, capital: float = 1000, min_spread: float = 0.5, include_dex: bool = True):
    """Main arbitrage scanning function."""
    print(f"🔍 Scanning arbitrage for {symbol}...")
    if include_dex:
        print("   (Including DEX prices: Uniswap, PancakeSwap, Jupiter, Raydium)")
    
    prices = await fetch_all_prices(symbol, include_dex)
    
    if len(prices) < 2:
        print("❌ Could not fetch prices from enough exchanges")
        return
    
    # Separate CEX and DEX
    cex_prices = [p for p in prices if p.source == "cex"]
    dex_prices = [p for p in prices if p.source == "dex"]
    
    print(f"\n📊 CEX Prices:")
    for p in cex_prices:
        print(f"  {p.exchange}: Bid ${p.bid:,.2f} / Ask ${p.ask:,.2f}")
    
    if dex_prices:
        print(f"\n🦄 DEX Prices:")
        for p in dex_prices:
            print(f"  {p.exchange}: Bid ${p.bid:,.2f} / Ask ${p.ask:,.2f}")
    
    opportunities = find_arbitrage_opportunities(prices, min_spread)
    
    if not opportunities:
        print(f"\n❌ No arbitrage opportunities found (min spread: {min_spread}%)")
        return
    
    print(f"\n💰 Found {len(opportunities)} opportunities:")
    
    for opp in opportunities[:5]:
        print(f"\n  🔄 {opp['route']}")
        print(f"  Buy: {opp['buy_exchange']} @ ${opp['buy_price']:,.2f}")
        print(f"  Sell: {opp['sell_exchange']} @ ${opp['sell_price']:,.2f}")
        print(f"  Spread: {opp['spread_pct']}% | Net Profit: {opp['profit_after_fees']}%")
        
        sizing = calculate_position_size(capital, opp['buy_price'], opp['sell_price'])
        if 'error' not in sizing:
            print(f"  💵 ${sizing['position_size']:,.2f} position → ~${sizing['expected_profit']:,.2f} profit")


def main():
    parser = argparse.ArgumentParser(description="Scan for arbitrage opportunities across CEXs and DEXs")
    parser.add_argument("--symbol", default="BTC/USDT", help="Trading pair (e.g., BTC/USDT, ETH/USDT, SOL/USDT)")
    parser.add_argument("--capital", type=float, default=1000, help="Available capital")
    parser.add_argument("--min-spread", type=float, default=0.5, help="Minimum spread %")
    parser.add_argument("--no-dex", action="store_true", help="Exclude DEX prices")
    parser.add_argument("--watch", action="store_true", help="Continuous monitoring")
    
    args = parser.parse_args()
    
    if args.watch:
        import time
        while True:
            asyncio.run(scan_arbitrage(args.symbol, args.capital, args.min_spread, not args.no_dex))
            print("\n" + "="*60 + "\n")
            time.sleep(10)
    else:
        asyncio.run(scan_arbitrage(args.symbol, args.capital, args.min_spread, not args.no_dex))


if __name__ == "__main__":
    main()

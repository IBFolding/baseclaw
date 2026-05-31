# Swimming Pauls - Multi-Agent Prediction Pool

A pool of AI agents (the "Pauls") that swim through data, debate predictions, and surface insights. **100% local - no cloud, no APIs required.**

## Installation

```bash
# The Pauls require Python 3.8+ and have zero mandatory dependencies
cd ~/.openclaw/workspace/swimming_pauls

# Test the pool (no setup needed)
python main.py --demo --rounds 5
```

## Commands

### Predict

Send a question to the Pauls and let them debate the answer.

```bash
swimming_pauls predict --topic "Will Netflix raise prices in 2026?"
swimming_pauls predict --file report.pdf --question "What's the market impact?"
swimming_pauls predict --topic "AI regulation" --rounds 50 --agents 10 --output json
```

### Simulate

Run the Pauls through scenario simulations.

```bash
swimming_pauls simulate --scenario "economic_recession" --rounds 100
swimming_pauls simulate --topic "streaming wars" --adaptive --consensus 0.7
```

### Trends

Have the Pauls analyze trends over time.

```bash
swimming_pauls trends --topic "film production LA" --days 90
swimming_pauls trends --file historical_data/ --metric "production_volume"
```

### Advanced Analysis

```bash
# Monte Carlo simulation (1000+ runs)
swimming_pauls predict --topic "Bitcoin Q2" --monte-carlo --runs 1000

# Sensitivity analysis
swimming_pauls sensitivity --file data.csv --target revenue

# Scenario comparison
swimming_pauls compare --scenario "Plan A" --scenario "Plan B"
```

## The Pauls (Agent Personas)

Each Paul has a unique perspective:

| Paul | Type | Bias | Strength |
|------|------|------|----------|
| **Producer Paul** | Budget-focused | Conservative | ROI analysis |
| **Director Paul** | Creative/Vision | Optimistic | Trend spotting |
| **Analyst Paul** | Data-driven | Neutral | Pattern recognition |
| **Trader Paul** | Short-term | Reactive | Market timing |
| **Visionary Paul** | Long-term | Bullish | Future casting |
| **Skeptic Paul** | Contrarian | Bearish | Blindspot detection |
| **Academic Paul** | Research-based | Cautious | Evidence-focused |
| **Journalist Paul** | Narrative-driven | Inquisitive | Story sensing |
| **Hedgie Paul** | Risk-manager | Defensive | Downside protection |
| **Entrepreneur Paul** | Innovation-focused | Aggressive | Opportunity spotting |

Plus **30+ more** with unique backstories and specialties.

## How The Pool Works

1. **Cast the Pauls** - Spawn agents with diverse personas
2. **Seed the Pool** - Provide data, topics, or questions
3. **Let Them Swim** - Agents debate and predict independently
4. **Surface Consensus** - Weighted aggregation of Paul opinions
5. **Report Findings** - Formatted output with confidence scores

## Example Output

```
SWIMMING PAULS PREDICTION REPORT
================================

Question: Will major productions return to LA in 2026?
Pool Size: 10 Pauls | Rounds: 20 | Duration: 3.2s

CONSENSUS: 72% confidence
Prediction: MODERATE POSITIVE

Paul Breakdown:
• Producer Paul: 68% confidence, CAUTIOUSLY BULLISH
• Director Paul: 82% confidence, VERY BULLISH  
• Hedgie Paul: 45% confidence, NEUTRAL
• Visionary Paul: 79% confidence, BULLISH
• Skeptic Paul: 51% confidence, SLIGHTLY BEARISH

Key Factors Surfaced:
→ California tax credits competitive (20-25%)
→ Quality premium justifies LA costs
→ Streaming demand increasing
→ Talent availability critical advantage
```

## Data Sources (All Local)

The Pauls swim through:
- **Local files** - PDFs, CSVs, JSON, text (no upload)
- **RSS feeds** - Real-time headlines (no API key)
- **Web scraping** - Direct page reading (no service)
- **File watching** - Monitor directories for changes

## Memory & Learning

The Pauls remember (all local SQLite):
- Past predictions and accuracy
- Which Pauls were right most often
- Knowledge graphs from your data
- Session resume capability

## Visualizations

- **Terminal charts** - ASCII/Unicode graphics
- **HTML reports** - Interactive dashboards
- **PNG exports** - Static charts

## 100% Local - No Cloud Required

**Swimming Pauls runs entirely on your machine:**
- ✅ No API keys needed
- ✅ No cloud accounts
- ✅ No internet required (after install)
- ✅ No data leaves your machine
- ✅ Fully private and auditable

See `LOCAL_ONLY.md` for details.

## Files

- `agent.py` - The Pauls themselves (40+ personas)
- `simulation.py` - The pool orchestration
- `persona_factory.py` - Generate custom Pauls
- `visualization.py` - Charts and reports
- `data_feeds_local.py` - Local data connectors
- `knowledge_graph.py` - Graph memory
- `local_memory.py` - SQLite persistence
- `memory.py` - Session tracking
- `advanced.py` - Monte Carlo, sensitivity, backtesting
- `main.py` - CLI entry point
- `swimming_pauls.py` - Unified API

## Optional Dependencies

System works with zero external packages. Optional enhancements:

```bash
# For web scraping
pip install httpx beautifulsoup4

# For RSS feeds
pip install feedparser

# For PDF reading
pip install PyPDF2

# For charts
pip install matplotlib plotext

# For graph analysis
pip install networkx
```

## Why "Swimming Pauls"?

Like fish in a school, individual Pauls have limited perspective. But together, swimming through data in parallel, they create emergent intelligence greater than any single agent. The collective surfaces truth through disagreement and debate.

## Quick Start

```python
from swimming_pauls import SwimmingPauls

# Create the pool
pauls = SwimmingPauls()

# Cast 40 Pauls and get prediction
result = await pauls.run_simulation(
    topic="Will CRITIC succeed?",
    rounds=20
)

# Visualize
pauls.visualize()

# Full analysis with Monte Carlo
await pauls.full_analysis(topic="AI regulation")
```

## License

MIT - Use it however you want. Your machine, your Pauls, your predictions.

---

**Swimming Pauls: Your own private pool of agents.** 🐟🏊‍♂️

# Scales - Multi-Agent Prediction Engine

Multi-agent swarm simulation for trend prediction and strategic analysis. Creates digital personas that debate and predict outcomes based on seed data.

## Installation

Scales requires Python 3.8+ and has no external dependencies.

```bash
# Clone or copy the scales directory to your workspace
cd ~/.openclaw/workspace/scales

# Verify it works
python main.py --demo --rounds 5
```

## Commands

### Predict

Run a multi-agent simulation to predict outcomes based on seed data.

```bash
scales predict --file report.pdf --question "What happens if Netflix raises prices 20%?"
scales predict --file market_data.json --rounds 50 --output json
scales predict --topic "AI regulation impact on tech stocks" --agents 10
```

**Parameters:**
- `--file` - Seed data file (PDF, TXT, JSON)
- `--topic` - Direct topic string (alternative to file)
- `--question` - Specific question to answer
- `--rounds` - Number of simulation rounds (default: 20)
- `--agents` - Number of agents to spawn (default: 5)
- `--output` - Output format: text, json, csv (default: text)
- `--personas` - Agent mix: balanced, bullish, bearish, random

### Simulate

Run a scenario simulation with custom parameters.

```bash
scales simulate --scenario market_crash --rounds 100
scales simulate --topic "streaming wars 2026" --agents 20 --adaptive
```

**Parameters:**
- `--scenario` - Named scenario or custom description
- `--topic` - Topic to simulate
- `--rounds` - Simulation rounds (default: 20)
- `--agents` - Number of agents (default: 5)
- `--adaptive` - Enable adaptive learning
- `--consensus` - Consensus threshold 0-1 (default: 0.6)

### Trends

Analyze trends over time with historical context.

```bash
scales trends --topic "film production LA" --days 90
scales trends --file industry_reports/ --metric "production_volume"
```

**Parameters:**
- `--topic` - Trend topic
- `--file` - Historical data files
- `--days` - Lookback period (default: 30)
- `--metric` - Metric to track

## Agent Personas

Scales uses 5 distinct agent types:

| Persona | Bias | Strength | Use Case |
|---------|------|----------|----------|
| **Analyst** | Neutral | Data-driven | Baseline predictions |
| **Trader** | Short-term | Pattern recognition | Market timing |
| **Hedgie** | Risk-aware | Downside protection | Risk assessment |
| **Visionary** | Long-term | Trend spotting | Strategic planning |
| **Skeptic** | Contrarian | Blindspot detection | Sanity checks |

## Examples

### Market Prediction

```bash
# Predict crypto market movement
scales predict --topic "Bitcoin Q2 2026" --agents 10 --rounds 50 --output json

# Analyze earnings impact
scales predict --file earnings_call.txt --question "Will revenue beat expectations?"
```

### Competitive Analysis

```bash
# Simulate competitor response
scales simulate --scenario "Netflix enters gaming" --personas balanced

# Market share prediction
scales trends --topic "streaming market share" --days 180
```

### Strategic Planning

```bash
# Product launch success
scales predict --file product_plan.pdf --question "What's our market penetration in 6 months?"

# Risk assessment
scales simulate --scenario "economic recession" --personas bearish --rounds 100
```

## Output Formats

**Text (default):**
```
SCALES PREDICTION REPORT
========================

Question: What happens if X?
Rounds: 20 | Agents: 5 | Duration: 2.3s

CONSENSUS: 72% confidence
Prediction: Moderate positive outcome

Agent Breakdown:
• Analyst Alice: 65% confidence, Bullish
• Trader Bob: 78% confidence, Very Bullish
• Hedgie Carol: 45% confidence, Neutral
• Visionary Dave: 82% confidence, Bullish
• Skeptic Eve: 52% confidence, Slightly Bearish

Key Factors:
→ Market conditions favorable
→ Execution risk moderate
→ Competitive response likely
```

**JSON:**
```json
{
  "consensus": 0.72,
  "prediction": "moderate_positive",
  "agents": [
    {"name": "Alice", "persona": "analyst", "confidence": 0.65, "bias": 0.3}
  ],
  "factors": ["market_conditions", "execution_risk", "competition"]
}
```

**CSV:**
```csv
round,agent,persona,prediction,confidence
1,Alice,analyst,0.65,0.72
1,Bob,trader,0.78,0.81
...
```

## How It Works

1. **Seed Input** - Provide text, data, or topic
2. **Agent Spawn** - Create personas with unique traits
3. **Simulation** - Agents debate and predict in rounds
4. **Consensus** - Weighted aggregation of predictions
5. **Output** - Formatted report with confidence scores

## Tips

- More agents = more perspectives but slower
- More rounds = better consensus but diminishing returns
- Use `--personas bearish` for risk analysis
- Use `--personas bullish` for opportunity assessment
- Combine with real data feeds for best results

## Files

- `agent.py` - Agent class and personas
- `simulation.py` - Async simulation engine
- `prediction.py` - Output formatting
- `main.py` - CLI entry point
- `example.py` - Usage examples

## No Dependencies

Scales is pure Python 3.8+ with zero external packages. Just run and predict.

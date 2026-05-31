# Risk Calculator Skill

Position sizing and risk management tools for trading.

## Features

- Kelly criterion calculator
- Position size based on risk percentage
- Maximum drawdown analysis
- Risk/reward ratio calculator
- Fixed fractional position sizing

## Installation

```bash
pip install numpy pandas
```

## Usage

### Kelly Criterion

```bash
./kelly_calculator.py --win-rate 0.55 --avg-win 100 --avg-loss 50
```

### Position Size by Risk %

```bash
./position_size.py --account 10000 --risk 2 --entry 50000 --stop 48000
```

### Risk/Reward Calculator

```bash
./risk_reward.py --entry 100 --stop 95 --target 115
```

### Drawdown Analysis

```bash
./drawdown_analysis.py --returns "10,-5,8,-12,15,-3,20"
```

## Formulas

### Kelly Criterion
```
f* = (p × b - q) / b
Where:
- f* = fraction of bankroll to bet
- p = probability of win
- q = probability of loss (1-p)
- b = average win / average loss (odds)
```

### Position Size
```
Position Size = (Account × Risk%) / (|Entry - Stop| / Entry)
```

### Risk/Reward Ratio
```
RR = (Target - Entry) / (Entry - Stop)
```

## Commands

| Command | Description |
|---------|-------------|
| `kelly_calculator.py` | Calculate optimal bet size via Kelly criterion |
| `position_size.py` | Calculate position size based on risk % |
| `risk_reward.py` | Calculate risk/reward ratio |
| `drawdown_analysis.py` | Analyze maximum drawdown from returns |

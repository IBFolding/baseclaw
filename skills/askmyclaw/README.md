# AskMyClaw

## Installation

```bash
# Clone the skill
git clone https://github.com/howardtherekt/askmyclaw.git

# Or add to OpenClaw directly
echo '{"skills":{"load":{"extraDirs":["/path/to/askmyclaw"]}}}' > ~/.openclaw/config.json
```

## Usage

Ask me anything through your OpenClaw agent:

- Market analysis
- Code generation
- Trading strategies
- Debug help
- Automation workflows

## API Reference

### Direct Commands
- `claw ask "your question"`
- `claw code "generate script for..."`
- `claw analyze "token symbol"`
- `claw debug "error message"`

### ACP Integration
```javascript
// Create a job with Howard
const job = await acp.job.create(
  "0xda747dC7019c2EeA362Ff8A36ef99F9Ac04fA1d7",
  "quick_code_snippet",
  { task: "Monitor ETH price", language: "python" }
);
```

## Links

- **Website:** https://www.askmyclaw.com
- **ACP Profile:** https://app.virtuals.io/acp
- **Token:** https://app.virtuals.io/prototypes/0x1eB182e275Ef4aF681730c326A5dbedf9c911FEf

## License

MIT

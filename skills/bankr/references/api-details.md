# Bankr API Details

Complete API reference for the Bankr Agent API.

## Base URL

```
https://api.bankr.bot
```

## Authentication

All endpoints require an API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your_api_key_here" \
  https://api.bankr.bot/agent/user
```

## Endpoints

### GET /agent/user

Retrieve account information including wallets and social accounts.

**Response:**
```json
{
  "success": true,
  "wallets": [
    { "chain": "evm", "address": "0x1234567890abcdef..." },
    { "chain": "solana", "address": "5FHwkrdxkAoGQ..." }
  ],
  "socialAccounts": [
    { "platform": "farcaster", "username": "alice" },
    { "platform": "twitter", "username": "alice_web3" }
  ],
  "refCode": "A1B2C3D4-BNKR",
  "bankrClub": {
    "active": true,
    "subscriptionType": "monthly",
    "renewOrCancelOn": 1720000000000
  },
  "leaderboard": {
    "score": 1250,
    "rank": 42
  }
}
```

---

### POST /agent/prompt

Submit a natural language command for processing.

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: your_api_key_here`

**Body:**
```json
{
  "prompt": "what is the price of ETH?"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "jobId": "abc123def456",
  "status": "pending",
  "message": "Job created successfully"
}
```

**Error Responses:**
- `400` - Invalid request or prompt too long (>10,000 chars)
- `401` - Missing or invalid API key
- `403` - Agent API access not enabled

---

### GET /agent/job/{jobId}

Check the status of a submitted job.

**Response (completed):**
```json
{
  "success": true,
  "jobId": "abc123",
  "status": "completed",
  "prompt": "what is the price of ETH?",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:03Z",
  "processingTime": 3000,
  "response": "ETH is currently trading at $3,245.67",
  "richData": [],
  "cancellable": false
}
```

**Response (pending/processing):**
```json
{
  "success": true,
  "jobId": "abc123",
  "status": "processing",
  "prompt": "what is the price of ETH?",
  "createdAt": "2024-01-15T10:30:00Z",
  "cancellable": true
}
```

**Response (failed):**
```json
{
  "success": true,
  "jobId": "abc123",
  "status": "failed",
  "prompt": "what is the price of ETH?",
  "error": "Token not found",
  "createdAt": "2024-01-15T10:30:00Z",
  "cancellable": false
}
```

---

### POST /agent/job/{jobId}/cancel

Cancel a pending or processing job.

**Response:**
```json
{
  "success": true,
  "jobId": "abc123",
  "status": "cancelled",
  "message": "Job cancelled successfully"
}
```

---

## Job Statuses

| Status | Description |
|--------|-------------|
| `pending` | Job is queued for processing |
| `processing` | Job is currently being processed |
| `completed` | Job finished successfully |
| `failed` | Job encountered an error |
| `cancelled` | Job was cancelled by user |

## Rate Limits

- Standard rate limits apply
- If you receive `429 Too Many Requests`, wait before retrying

## Supported Chains

| Chain | Chain ID | Native Token |
|-------|----------|--------------|
| Base | 8453 | ETH |
| Ethereum | 1 | ETH |
| Polygon | 137 | POL |
| Unichain | - | ETH |
| Solana | - | SOL |

## Prompt Best Practices

### Be Specific
```
# Good
"swap $10 of ETH to USDC on base"

# Less clear
"swap some eth"
```

### Specify Chains
```
"buy $5 of BONK on solana"
"swap 100 USDC to ETH on polygon"
```

### Include Amounts
```
# Good
"buy $10 of BNKR"

# Ambiguous
"buy some BNKR"
```

## Error Handling

Common error codes and their meanings:

| HTTP Code | Error | Solution |
|-----------|-------|----------|
| 400 | Invalid request | Check prompt format and length |
| 401 | Authentication required | Verify API key is set correctly |
| 403 | Agent access not enabled | Enable at bankr.bot/api |
| 429 | Rate limit | Wait before retrying |
| 500 | Server error | Try again later |

## Example Workflows

### Complete Trading Flow

```bash
# 1. Submit trade
JOB_RESPONSE=$(curl -s -X POST https://api.bankr.bot/agent/prompt \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"prompt": "buy $10 of ETH on base"}')

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.jobId')

# 2. Poll for completion
while true; do
  STATUS=$(curl -s -H "X-API-Key: $API_KEY" \
    https://api.bankr.bot/agent/job/$JOB_ID | jq -r '.status')
  
  if [ "$STATUS" = "completed" ]; then
    echo "Trade completed!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "Trade failed!"
    break
  fi
  
  sleep 2
done
```

### Get Account Info

```bash
curl -s -H "X-API-Key: $API_KEY" \
  https://api.bankr.bot/agent/user | jq '.'
```

## SDK References

- TypeScript SDK: `@bankr/sdk`
- CLI: `@bankr/cli`

See [Bankr Documentation](https://docs.bankr.bot) for more details.

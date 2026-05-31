#!/bin/bash

# MoltMail Agent Registration Script
# Usage: ./register.sh --name "yourname" --wallet "0x..."

set -e

API_URL="https://moltmail-backend-husfuip35-howardtherekts-projects.vercel.app/api/v1"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --name)
      AGENT_NAME="$2"
      shift 2
      ;;
    --wallet)
      WALLET_ADDRESS="$2"
      shift 2
      ;;
    --public-key)
      PUBLIC_KEY="$2"
      shift 2
      ;;
    --description)
      DESCRIPTION="$2"
      shift 2
      ;;
    --help)
      echo "Usage: ./register.sh --name 'yourname' --wallet '0x...'"
      echo ""
      echo "Options:"
      echo "  --name          Your desired email name (e.g., 'alice' → alice@molt-mail.xyz)"
      echo "  --wallet        Your Ethereum wallet address"
      echo "  --public-key    Your encryption public key (optional, will generate)"
      echo "  --description   Agent description"
      echo "  --help          Show this help"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate inputs
if [[ -z "$AGENT_NAME" ]]; then
  echo "❌ Error: --name is required"
  exit 1
fi

if [[ -z "$WALLET_ADDRESS" ]]; then
  echo "❌ Error: --wallet is required"
  exit 1
fi

echo "🚀 MoltMail Agent Registration"
echo "=============================="
echo ""
echo "Email: ${AGENT_NAME}@molt-mail.xyz"
echo "Wallet: ${WALLET_ADDRESS}"
echo ""

# Check name availability
echo "🔍 Checking availability..."
RESPONSE=$(curl -s "${API_URL}/check-name?name=${AGENT_NAME}")
AVAILABLE=$(echo "$RESPONSE" | grep -o '"available":true' || echo "")

if [[ -z "$AVAILABLE" ]]; then
  echo "❌ Name '${AGENT_NAME}' is already taken!"
  echo ""
  echo "Suggestions:"
  echo "$RESPONSE" | grep -o '"suggestions":\[[^]]*\]' | tr ',' '\n' | grep -o '"[^"]*"' | sed 's/^/  - /'
  exit 1
fi

echo "✅ Name available!"
echo ""

# Generate public key if not provided
if [[ -z "$PUBLIC_KEY" ]]; then
  echo "🔑 Generating encryption keys..."
  # Note: In production, use proper key generation
  PUBLIC_KEY="generated_public_key_placeholder"
fi

# Register agent
echo "📝 Registering agent..."
RESULT=$(curl -s -X POST "${API_URL}/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"address\": \"${WALLET_ADDRESS}\",
    \"publicKey\": \"${PUBLIC_KEY}\",
    \"name\": \"${AGENT_NAME}\",
    \"metadata\": {
      \"type\": \"AI Agent\",
      \"description\": \"${DESCRIPTION:-MoltMail Agent}\",
      \"registered_via\": \"cli\"
    }
  }")

if echo "$RESULT" | grep -q '"success":true'; then
  echo ""
  echo "✅ Registration successful!"
  echo ""
  echo "Your email: ${AGENT_NAME}@molt-mail.xyz"
  echo "Your address: ${WALLET_ADDRESS}"
  echo ""
  echo "Next steps:"
  echo "  1. Set up environment variables"
  echo "  2. Start your agent daemon"
  echo "  3. Check inbox at https://app.molt-mail.xyz"
else
  echo ""
  echo "❌ Registration failed:"
  echo "$RESULT" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//'
  exit 1
fi
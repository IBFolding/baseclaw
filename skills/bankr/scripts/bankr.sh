#!/bin/bash
#
# Bankr API Wrapper Script
# A command-line interface to the Bankr AI trading API
#
# Usage: ./bankr.sh [OPTIONS] "natural language prompt"
#
# Examples:
#   ./bankr.sh "What is my wallet address?"
#   ./bankr.sh "Buy $10 of ETH on Base"
#   ./bankr.sh -c solana "Buy $5 of BONK"
#   ./bankr.sh -j "Show my portfolio"

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SKILL_DIR/config.json"

# Default values
DEFAULT_CHAIN="base"
DEFAULT_TIMEOUT=120
WAIT_FOR_COMPLETION=true
JSON_OUTPUT=false
VERBOSE=false

# Colors for output (disable if not terminal)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    NC='\033[0m' # No Color
else
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' NC=''
fi

# Function: Print usage
print_usage() {
    cat << EOF
Bankr API Wrapper Script

Usage: $(basename "$0") [OPTIONS] "prompt"

Execute natural language trading commands via the Bankr API.

OPTIONS:
    -c, --chain <chain>     Specify blockchain (base, ethereum, polygon, 
                            unichain, solana). Default: base
    -t, --timeout <secs>    Timeout for job polling in seconds. Default: 120
    -w, --wait <true|false> Wait for job completion. Default: true
    -j, --json              Output raw JSON response
    -v, --verbose           Verbose output
    -h, --help              Show this help message

EXAMPLES:
    # Get wallet address
    $(basename "$0") "What is my wallet address?"

    # Check portfolio
    $(basename "$0") "Show my portfolio on Base"

    # Get token price
    $(basename "$0") "What is the price of ETH?"

    # Buy tokens on specific chain
    $(basename "$0") -c solana "Buy \$5 of BONK"

    # Sell tokens
    $(basename "$0") "Sell \$10 of TOKEN on Base"

    # Set stop loss
    $(basename "$0") "Set stop loss for TOKEN at -15%"

    # Check balances with JSON output
    $(basename "$0") -j "What are my balances?"

    # DCA automation
    $(basename "$0") "DCA \$20 into ETH every week on Base"

ENVIRONMENT:
    BANKR_API_KEY           API key (overrides config.json)
    BANKR_BASE_URL          API base URL (default: https://api.bankr.bot)

CONFIGURATION:
    Config file: $CONFIG_FILE
    Template:    ${CONFIG_FILE}.template

For more information, see: $SKILL_DIR/SKILL.md
EOF
}

# Function: Print error and exit
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Function: Print warning
warn() {
    echo -e "${YELLOW}Warning: $1${NC}" >&2
}

# Function: Print info
info() {
    echo -e "${BLUE}$1${NC}"
}

# Function: Print success
success() {
    echo -e "${GREEN}$1${NC}"
}

# Function: Print verbose
verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[VERBOSE] $1${NC}" >&2
    fi
}

# Function: Load configuration
load_config() {
    local config_file="$1"
    
    if [ ! -f "$config_file" ]; then
        error "Config file not found: $config_file\nPlease copy config.json.template to config.json and add your API key."
    fi
    
    # Parse JSON config using basic tools (jq preferred, fallback to grep/sed)
    if command -v jq &> /dev/null; then
        API_KEY=$(jq -r '.api_key // empty' "$config_file")
        BASE_URL=$(jq -r '.base_url // "https://api.bankr.bot"' "$config_file")
        DEFAULT_CHAIN=$(jq -r '.default_chain // "base"' "$config_file")
    else
        # Fallback parsing (less robust)
        API_KEY=$(grep -o '"api_key"[[:space:]]*:[[:space:]]*"[^"]*"' "$config_file" | cut -d'"' -f4)
        BASE_URL=$(grep -o '"base_url"[[:space:]]*:[[:space:]]*"[^"]*"' "$config_file" | cut -d'"' -f4)
        [ -z "$BASE_URL" ] && BASE_URL="https://api.bankr.bot"
    fi
    
    # Environment overrides
    [ -n "$BANKR_API_KEY" ] && API_KEY="$BANKR_API_KEY"
    [ -n "$BANKR_BASE_URL" ] && BASE_URL="$BANKR_BASE_URL"
    
    if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_bankr_api_key_here" ]; then
        error "API key not configured.\nPlease set your API key in $config_file or set BANKR_API_KEY environment variable."
    fi
    
    verbose "Using base URL: $BASE_URL"
}

# Function: Submit prompt to API
submit_prompt() {
    local prompt="$1"
    local api_key="$2"
    local base_url="$3"
    
    verbose "Submitting prompt: $prompt"
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "${base_url}/agent/prompt" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $api_key" \
        -d "{\"prompt\": \"$(echo "$prompt" | sed 's/"/\\"/g')\"}" 2>&1)
    
    local http_code
    http_code=$(echo "$response" | tail -n1)
    local body
    body=$(echo "$response" | sed '$d')
    
    verbose "HTTP response code: $http_code"
    
    case "$http_code" in
        202)
            echo "$body"
            ;;
        401)
            error "Authentication failed. Please check your API key."
            ;;
        403)
            error "Agent API access not enabled. Please enable it at bankr.bot/api"
            ;;
        400)
            local error_msg
            error_msg=$(echo "$body" | jq -r '.message // "Bad request"' 2>/dev/null || echo "Bad request")
            error "Bad request: $error_msg"
            ;;
        429)
            error "Rate limit exceeded. Please wait before trying again."
            ;;
        500|502|503)
            error "Bankr API server error (HTTP $http_code). Please try again later."
            ;;
        *)
            error "Unexpected response (HTTP $http_code): $body"
            ;;
    esac
}

# Function: Get job status
get_job_status() {
    local job_id="$1"
    local api_key="$2"
    local base_url="$3"
    
    curl -s \
        -H "X-API-Key: $api_key" \
        "${base_url}/agent/job/${job_id}" 2>&1
}

# Function: Poll for job completion
poll_job() {
    local job_id="$1"
    local api_key="$2"
    local base_url="$3"
    local timeout="$4"
    
    local start_time
    start_time=$(date +%s)
    local elapsed=0
    local attempt=0
    
    info "Processing..."
    
    while [ $elapsed -lt "$timeout" ]; do
        attempt=$((attempt + 1))
        verbose "Poll attempt $attempt (elapsed: ${elapsed}s)"
        
        local response
        response=$(get_job_status "$job_id" "$api_key" "$base_url")
        
        if [ $? -ne 0 ]; then
            warn "Failed to get job status, retrying..."
            sleep 2
            continue
        fi
        
        local status
        status=$(echo "$response" | jq -r '.status // "unknown"' 2>/dev/null)
        
        verbose "Job status: $status"
        
        case "$status" in
            "completed")
                echo "$response"
                return 0
                ;;
            "failed")
                local error_msg
                error_msg=$(echo "$response" | jq -r '.error // "Unknown error"' 2>/dev/null)
                error "Job failed: $error_msg"
                ;;
            "cancelled")
                error "Job was cancelled"
                ;;
            "pending"|"processing")
                # Continue polling
                ;;
            *)
                verbose "Unknown status: $status"
                ;;
        esac
        
        sleep 2
        
        local current_time
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
    done
    
    error "Timeout waiting for job completion after ${timeout}s. Job ID: $job_id"
}

# Function: Format and print response
print_response() {
    local response="$1"
    local json_mode="$2"
    
    if [ "$json_mode" = true ]; then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        local text_response
        text_response=$(echo "$response" | jq -r '.response // empty' 2>/dev/null)
        
        if [ -n "$text_response" ]; then
            echo "$text_response"
        else
            # Fallback: print raw response
            echo "$response" | jq -r '.' 2>/dev/null || echo "$response"
        fi
    fi
}

# Function: Get account info
get_account_info() {
    local api_key="$1"
    local base_url="$2"
    
    curl -s \
        -H "X-API-Key: $api_key" \
        "${base_url}/agent/user" 2>&1
}

# Main execution
main() {
    local prompt=""
    local chain=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--chain)
                chain="$2"
                shift 2
                ;;
            -t|--timeout)
                DEFAULT_TIMEOUT="$2"
                shift 2
                ;;
            -w|--wait)
                WAIT_FOR_COMPLETION="$2"
                shift 2
                ;;
            -j|--json)
                JSON_OUTPUT=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            --)
                shift
                prompt="$*"
                break
                ;;
            -*)
                error "Unknown option: $1\nUse -h for help."
                ;;
            *)
                if [ -z "$prompt" ]; then
                    prompt="$1"
                else
                    prompt="$prompt $1"
                fi
                shift
                ;;
        esac
    done
    
    # Validate prompt
    if [ -z "$prompt" ]; then
        error "No prompt provided.\nUsage: $(basename "$0") [OPTIONS] \"prompt\"\nUse -h for help."
    fi
    
    # Add chain context if specified
    if [ -n "$chain" ]; then
        # Only append chain if not already mentioned
        if [[ ! "${prompt,,}" =~ ${chain,,} ]]; then
            prompt="$prompt on $chain"
        fi
    fi
    
    verbose "Final prompt: $prompt"
    
    # Load configuration
    load_config "$CONFIG_FILE"
    
    # Submit prompt
    verbose "Submitting to Bankr API..."
    local submit_response
    submit_response=$(submit_prompt "$prompt" "$API_KEY" "$BASE_URL")
    
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    # Parse job ID
    local job_id
    job_id=$(echo "$submit_response" | jq -r '.jobId // empty' 2>/dev/null)
    
    if [ -z "$job_id" ]; then
        error "Failed to get job ID from response: $submit_response"
    fi
    
    verbose "Job ID: $job_id"
    
    # Wait for completion or return immediately
    if [ "$WAIT_FOR_COMPLETION" = true ]; then
        local final_response
        final_response=$(poll_job "$job_id" "$API_KEY" "$BASE_URL" "$DEFAULT_TIMEOUT")
        print_response "$final_response" "$JSON_OUTPUT"
    else
        # Return job info for async processing
        if [ "$JSON_OUTPUT" = true ]; then
            echo "$submit_response"
        else
            job_id=$(echo "$submit_response" | jq -r '.jobId')
            success "Job submitted: $job_id"
            echo "Poll status with: curl -H 'X-API-Key: ***' ${BASE_URL}/agent/job/${job_id}"
        fi
    fi
}

# Run main function
main "$@"

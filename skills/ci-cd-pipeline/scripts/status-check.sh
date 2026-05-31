#!/bin/bash
#
# status-check.sh - Check CI/CD pipeline status
# Usage: status-check.sh [options]
#

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Options
WATCH=false
FAILED_ONLY=false
REPO=""
LIMIT=10

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --watch)
      WATCH=true
      shift
      ;;
    --failed)
      FAILED_ONLY=true
      shift
      ;;
    --repo)
      REPO="$2"
      shift 2
      ;;
    --limit)
      LIMIT="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Check if gh CLI is available
check_gh() {
  if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) not installed${NC}"
    echo "Install from: https://cli.github.com/"
    exit 1
  fi
}

# Get workflow runs
get_runs() {
  local repo_arg=""
  if [[ -n "$REPO" ]]; then
    repo_arg="--repo $REPO"
  fi
  
  if $FAILED_ONLY; then
    gh run list $repo_arg --limit "$LIMIT" --json name,status,conclusion,createdAt,event,headBranch,url | jq '[.[] | select(.conclusion == "failure")]' 2>/dev/null || echo "[]"
  else
    gh run list $repo_arg --limit "$LIMIT" --json name,status,conclusion,createdAt,event,headBranch,url 2>/dev/null || echo "[]"
  fi
}

# Display runs
display_runs() {
  local runs="$1"
  
  if [[ "$runs" == "[]" ]]; then
    if $FAILED_ONLY; then
      echo -e "${GREEN}✅ No failed runs found${NC}"
    else
      echo -e "${YELLOW}⚠️  No runs found or gh CLI not authenticated${NC}"
    fi
    return
  fi
  
  echo "$runs" | jq -r '.[] | "\(.status)|\(.conclusion // "N/A")|\(.name)|\(.headBranch)|\(.createdAt)|\(.url)"' | while IFS='|' read -r status conclusion name branch created url; do
    # Format status
    if [[ "$status" == "completed" ]]; then
      if [[ "$conclusion" == "success" ]]; then
        status_icon="${GREEN}✅${NC}"
      elif [[ "$conclusion" == "failure" ]]; then
        status_icon="${RED}❌${NC}"
      else
        status_icon="${YELLOW}⚠️${NC}"
      fi
    else
      status_icon="${BLUE}🔄${NC}"
    fi
    
    # Format date
    local date_str=$(echo "$created" | cut -d'T' -f1)
    
    echo -e "${status_icon} ${name}"
    echo "   Branch: ${branch} | ${date_str}"
    echo "   ${url}"
    echo ""
  done
}

# Watch mode
watch_runs() {
  while true; do
    clear
    echo -e "${BLUE}👁️  Watching CI/CD Status (Ctrl+C to exit)${NC}"
    echo ""
    
    local runs=$(get_runs)
    display_runs "$runs"
    
    sleep 10
  done
}

# Main
check_gh

if $WATCH; then
  watch_runs
else
  echo -e "${BLUE}📊 Recent CI/CD Runs:${NC}"
  echo ""
  
  local runs=$(get_runs)
  display_runs "$runs"
fi

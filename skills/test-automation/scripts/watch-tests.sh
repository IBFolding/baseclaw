#!/bin/bash
#
# watch-tests.sh - Watch mode for continuous testing
# Usage: watch-tests.sh [options]
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Options
PATTERN=""
CLEAR=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --pattern|-p)
      PATTERN="$2"
      shift 2
      ;;
    --clear)
      CLEAR=true
      shift
      ;;
    --help)
      echo "Usage: watch-tests.sh [options]"
      echo ""
      echo "Options:"
      echo "  --pattern, -p     Only run tests matching pattern"
      echo "  --clear           Clear screen between runs"
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

# Detect framework
detect_framework() {
  if [[ -f "jest.config.js" ]] || grep -q "jest" package.json 2>/dev/null; then
    echo "jest"
  elif [[ -f "vitest.config.js" ]] || grep -q "vitest" package.json 2>/dev/null; then
    echo "vitest"
  elif [[ -f "pytest.ini" ]]; then
    echo "pytest"
  else
    echo "unknown"
  fi
}

# Watch mode command
watch_command() {
  local framework="$1"
  
  case $framework in
    jest)
      echo "npx jest --watch${PATTERN:+ --testNamePattern='$PATTERN'}"
      ;;
    vitest)
      echo "npx vitest --watch${PATTERN:+ -t '$PATTERN'}"
      ;;
    pytest)
      if command -v pytest-watch &> /dev/null; then
        echo "ptw${PATTERN:+ -- -k '$PATTERN'}"
      else
        echo -e "${YELLOW}⚠️  Install pytest-watch for watch mode:${NC}"
        echo "pip install pytest-watch"
        exit 1
      fi
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

# Main
FRAMEWORK=$(detect_framework)

echo -e "${BLUE}👁️  Watch Mode - $FRAMEWORK${NC}"
echo ""
echo "Tests will re-run when files change."
echo "Press 'a' to run all tests, 'f' to run failed tests, 'q' to quit."
echo ""

CMD=$(watch_command "$FRAMEWORK")

if [[ "$CMD" == "unknown" ]]; then
  echo -e "${YELLOW}⚠️  Watch mode not supported for this framework${NC}"
  exit 1
fi

eval "$CMD"

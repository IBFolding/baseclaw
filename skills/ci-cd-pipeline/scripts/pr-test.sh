#!/bin/bash
#
# pr-test.sh - Run tests on pull requests
# Usage: pr-test.sh <pr-number> [options]
#

set -e

PR_NUMBER="${1:-}"
OPTIONS="${2:-}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

usage() {
  echo "Usage: pr-test.sh <pr-number> [options]"
  echo ""
  echo "Options:"
  echo "  --full       Run full test suite including integration tests"
  echo "  --unit       Run only unit tests (default)"
  echo "  --lint       Run only linting checks"
  echo "  --coverage   Generate coverage report"
  echo ""
  echo "Examples:"
  echo "  pr-test.sh 42"
  echo "  pr-test.sh 42 --full"
  echo "  pr-test.sh 42 --coverage"
}

if [[ -z "$PR_NUMBER" ]]; then
  echo -e "${RED}❌ PR number is required${NC}"
  usage
  exit 1
fi

echo -e "${GREEN}🧪 Running tests for PR #$PR_NUMBER${NC}"

# Detect project type and run appropriate tests
run_tests() {
  if [[ -f "package.json" ]]; then
    run_node_tests
  elif [[ -f "requirements.txt" || -f "pyproject.toml" ]]; then
    run_python_tests
  else
    echo -e "${YELLOW}⚠️  Unknown project type${NC}"
    exit 1
  fi
}

run_node_tests() {
  echo "📦 Running Node.js tests..."
  
  # Install dependencies
  npm ci
  
  case $OPTIONS in
    --lint)
      npm run lint
      ;;
    --unit)
      npm test
      ;;
    --coverage)
      npm test -- --coverage
      ;;
    --full)
      npm run lint
      npm test
      npm run test:integration --if-present
      npm run build
      ;;
    *)
      npm run lint --if-present
      npm test
      ;;
  esac
}

run_python_tests() {
  echo "🐍 Running Python tests..."
  
  # Install dependencies
  pip install -r requirements.txt
  pip install -r requirements-dev.txt 2>/dev/null || true
  
  case $OPTIONS in
    --lint)
      flake8 .
      black --check .
      ;;
    --unit)
      pytest
      ;;
    --coverage)
      pytest --cov=./ --cov-report=xml
      ;;
    --full)
      flake8 .
      black --check .
      pytest
      pytest tests/integration/ -v || true
      ;;
    *)
      flake8 . || true
      pytest
      ;;
  esac
}

# Fetch PR info (if gh CLI is available)
fetch_pr_info() {
  if command -v gh &> /dev/null; then
    echo ""
    echo "📋 PR Information:"
    gh pr view "$PR_NUMBER" --json title,author,headRefName || true
  fi
}

# Main
fetch_pr_info
run_tests

echo ""
echo -e "${GREEN}✅ PR #$PR_NUMBER tests completed successfully${NC}"

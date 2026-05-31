#!/bin/bash
#
# run-tests.sh - Run test suites with various options
# Usage: run-tests.sh [options]
#

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default options
COVERAGE=false
UNIT_ONLY=false
INTEGRATION_ONLY=false
E2E_ONLY=false
WATCH=false
PARALLEL=""
CHANGED=false
PATTERN=""
UPDATE_SNAPSHOTS=false
VERBOSE=false
FAIL_FAST=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --coverage|-c)
      COVERAGE=true
      shift
      ;;
    --unit|-u)
      UNIT_ONLY=true
      shift
      ;;
    --integration|-i)
      INTEGRATION_ONLY=true
      shift
      ;;
    --e2e)
      E2E_ONLY=true
      shift
      ;;
    --watch|-w)
      WATCH=true
      shift
      ;;
    --parallel|-p)
      PARALLEL="$2"
      shift 2
      ;;
    --changed)
      CHANGED=true
      shift
      ;;
    --grep|-g)
      PATTERN="$2"
      shift 2
      ;;
    --update-snapshots)
      UPDATE_SNAPSHOTS=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --fail-fast)
      FAIL_FAST=true
      shift
      ;;
    --help|-h)
      echo "Usage: run-tests.sh [options]"
      echo ""
      echo "Options:"
      echo "  --coverage, -c         Run with coverage report"
      echo "  --unit, -u             Run only unit tests"
      echo "  --integration, -i      Run only integration tests"
      echo "  --e2e                  Run only e2e tests"
      echo "  --watch, -w            Watch mode (continuous testing)"
      echo "  --parallel, -p N       Run tests in parallel (N workers)"
      echo "  --changed              Test only changed files"
      echo "  --grep, -g PATTERN     Run tests matching pattern"
      echo "  --update-snapshots     Update test snapshots"
      echo "  --verbose, -v          Verbose output"
      echo "  --fail-fast            Stop on first failure"
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

# Detect test framework
detect_framework() {
  if [[ -f "jest.config.js" || -f "jest.config.json" ]] || grep -q "jest" package.json 2>/dev/null; then
    echo "jest"
  elif [[ -f "pytest.ini" || -f "pyproject.toml" ]] || grep -q "pytest" requirements-dev.txt 2>/dev/null; then
    echo "pytest"
  elif [[ -f "go.mod" ]]; then
    echo "go"
  elif [[ -f "Cargo.toml" ]]; then
    echo "rust"
  elif [[ -f ".rspec" || -f "Gemfile" ]]; then
    echo "rspec"
  elif [[ -f "vitest.config.js" ]] || grep -q "vitest" package.json 2>/dev/null; then
    echo "vitest"
  else
    echo "unknown"
  fi
}

# Build test command
build_command() {
  local framework="$1"
  local cmd=""
  
  case $framework in
    jest)
      cmd="npx jest"
      
      $COVERAGE && cmd="$cmd --coverage"
      $WATCH && cmd="$cmd --watch"
      $VERBOSE && cmd="$cmd --verbose"
      $FAIL_FAST && cmd="$cmd --bail"
      $UPDATE_SNAPSHOTS && cmd="$cmd --updateSnapshot"
      [[ -n "$PATTERN" ]] && cmd="$cmd --testNamePattern='$PATTERN'"
      [[ -n "$PARALLEL" ]] && cmd="$cmd --maxWorkers=$PARALLEL"
      
      if $UNIT_ONLY; then
        cmd="$cmd tests/unit"
      elif $INTEGRATION_ONLY; then
        cmd="$cmd tests/integration"
      elif $E2E_ONLY; then
        cmd="$cmd tests/e2e"
      fi
      
      $CHANGED && cmd="$cmd --changedSince=main"
      ;;
      
    vitest)
      cmd="npx vitest"
      
      $COVERAGE && cmd="$cmd --coverage"
      $WATCH && cmd="$cmd --watch"
      $VERBOSE && cmd="$cmd --reporter=verbose"
      [[ -n "$PATTERN" ]] && cmd="$cmd -t '$PATTERN'"
      
      if $UNIT_ONLY; then
        cmd="$cmd tests/unit"
      elif $INTEGRATION_ONLY; then
        cmd="$cmd tests/integration"
      fi
      ;;
      
    pytest)
      cmd="pytest"
      
      $COVERAGE && cmd="$cmd --cov=. --cov-report=term-missing"
      $VERBOSE && cmd="$cmd -v"
      $FAIL_FAST && cmd="$cmd -x"
      [[ -n "$PATTERN" ]] && cmd="$cmd -k '$PATTERN'"
      [[ -n "$PARALLEL" ]] && cmd="$cmd -n $PARALLEL"
      
      if $UNIT_ONLY; then
        cmd="$cmd tests/unit"
      elif $INTEGRATION_ONLY; then
        cmd="$cmd tests/integration"
      elif $E2E_ONLY; then
        cmd="$cmd tests/e2e"
      fi
      
      $CHANGED && cmd="$cmd --changed"
      ;;
      
    go)
      cmd="go test"
      
      $VERBOSE && cmd="$cmd -v"
      $FAIL_FAST && cmd="$cmd -failfast"
      [[ -n "$PARALLEL" ]] && cmd="$cmd -parallel=$PARALLEL"
      
      if $UNIT_ONLY; then
        cmd="$cmd ./tests/unit/..."
      elif $INTEGRATION_ONLY; then
        cmd="$cmd ./tests/integration/..."
      else
        cmd="$cmd ./..."
      fi
      
      $COVERAGE && cmd="$cmd -coverprofile=coverage.out && go tool cover -func=coverage.out"
      ;;
      
    rust)
      cmd="cargo test"
      
      $VERBOSE && cmd="$cmd -- --nocapture"
      [[ -n "$PATTERN" ]] && cmd="$cmd $PATTERN"
      
      if $UNIT_ONLY; then
        cmd="$cmd --lib"
      elif $INTEGRATION_ONLY; then
        cmd="$cmd --test integration"
      fi
      
      $COVERAGE && cmd="cargo tarpaulin --out Html"
      ;;
      
    rspec)
      cmd="bundle exec rspec"
      
      $VERBOSE && cmd="$cmd --format documentation"
      $FAIL_FAST && cmd="$cmd --fail-fast"
      [[ -n "$PATTERN" ]] && cmd="$cmd -e '$PATTERN'"
      
      if $UNIT_ONLY; then
        cmd="$cmd tests/unit"
      elif $INTEGRATION_ONLY; then
        cmd="$cmd tests/integration"
      fi
      ;;
      
    *)
      echo "Unknown test framework"
      exit 1
      ;;
  esac
  
  echo "$cmd"
}

# Main execution
FRAMEWORK=$(detect_framework)

echo -e "${BLUE}🧪 Running tests with $FRAMEWORK${NC}"
echo ""

if [[ "$FRAMEWORK" == "unknown" ]]; then
  echo -e "${RED}❌ Cannot detect test framework${NC}"
  echo "Run 'init.sh <language>' first to set up testing"
  exit 1
fi

CMD=$(build_command "$FRAMEWORK")

echo -e "${YELLOW}Command: $CMD${NC}"
echo ""

# Run tests
if eval "$CMD"; then
  echo ""
  echo -e "${GREEN}✅ All tests passed!${NC}"
else
  echo ""
  echo -e "${RED}❌ Tests failed${NC}"
  exit 1
fi

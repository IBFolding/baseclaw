#!/bin/bash
#
# ci-integration.sh - CI-specific test runner
# Usage: ci-integration.sh [options]
#

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration from environment
COVERAGE_THRESHOLD="${COVERAGE_THRESHOLD:-80}"
TEST_FRAMEWORK="${TEST_FRAMEWORK:-auto}"
REPORT_FORMAT="${REPORT_FORMAT:-junit}"

# Options
SKIP_COVERAGE=false
ONLY_UNIT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-coverage)
      SKIP_COVERAGE=true
      shift
      ;;
    --only-unit)
      ONLY_UNIT=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

echo -e "${GREEN}🔧 CI Test Runner${NC}"
echo ""
echo "Configuration:"
echo "  Framework: ${TEST_FRAMEWORK}"
echo "  Coverage Threshold: ${COVERAGE_THRESHOLD}%"
echo "  Report Format: ${REPORT_FORMAT}"
echo ""

# Auto-detect framework if not set
if [[ "$TEST_FRAMEWORK" == "auto" ]]; then
  if [[ -f "jest.config.js" ]] || grep -q "jest" package.json 2>/dev/null; then
    TEST_FRAMEWORK="jest"
  elif [[ -f "pytest.ini" ]]; then
    TEST_FRAMEWORK="pytest"
  elif [[ -f "go.mod" ]]; then
    TEST_FRAMEWORK="go"
  elif [[ -f "Cargo.toml" ]]; then
    TEST_FRAMEWORK="rust"
  fi
fi

# Run tests based on framework
case $TEST_FRAMEWORK in
  jest)
    echo "Running Jest tests..."
    
    TEST_CMD="npx jest --ci --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=cobertura"
    
    if [[ "$REPORT_FORMAT" == "junit" ]]; then
      TEST_CMD="$TEST_CMD --reporters=default --reporters=jest-junit"
    fi
    
    $ONLY_UNIT && TEST_CMD="$TEST_CMD tests/unit"
    
    eval "$TEST_CMD"
    
    if ! $SKIP_COVERAGE; then
      COVERAGE=$(grep -o '"pct":[0-9.]*' coverage/coverage-summary.json | head -1 | grep -o '[0-9.]*' || echo "0")
      
      echo ""
      echo "Coverage: ${COVERAGE}%"
      
      if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${RED}❌ Coverage below threshold (${COVERAGE_THRESHOLD}%)${NC}"
        exit 1
      fi
    fi
    ;;
    
  pytest)
    echo "Running pytest tests..."
    
    TEST_CMD="pytest -v --tb=short"
    
    if ! $SKIP_COVERAGE; then
      TEST_CMD="$TEST_CMD --cov=. --cov-report=xml --cov-report=term --cov-fail-under=$COVERAGE_THRESHOLD"
    fi
    
    if [[ "$REPORT_FORMAT" == "junit" ]]; then
      TEST_CMD="$TEST_CMD --junitxml=test-results.xml"
    fi
    
    $ONLY_UNIT && TEST_CMD="$TEST_CMD tests/unit"
    
    eval "$TEST_CMD"
    ;;
    
  go)
    echo "Running Go tests..."
    
    if ! $SKIP_COVERAGE; then
      go test -race -coverprofile=coverage.out -covermode=atomic ./...
      go tool cover -func=coverage.out | tee coverage.txt
      
      COVERAGE=$(grep total coverage.txt | awk '{print $3}' | tr -d '%')
      
      if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${RED}❌ Coverage below threshold (${COVERAGE_THRESHOLD}%)${NC}"
        exit 1
      fi
    else
      go test -race ./...
    fi
    ;;
    
  rust)
    echo "Running Rust tests..."
    cargo test --release
    
    if ! $SKIP_COVERAGE; then
      if command -v cargo-tarpaulin &> /dev/null; then
        cargo tarpaulin --fail-under $COVERAGE_THRESHOLD --out Xml
      fi
    fi
    ;;
    
  *)
    echo -e "${YELLOW}⚠️  Unknown test framework: $TEST_FRAMEWORK${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✅ CI tests passed!${NC}"

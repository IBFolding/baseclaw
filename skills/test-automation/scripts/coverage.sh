#!/bin/bash
#
# coverage.sh - Generate and analyze coverage reports
# Usage: coverage.sh [options]
#

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Options
HTML=false
THRESHOLD=""
OPEN=false
FORMAT="text"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --html)
      HTML=true
      FORMAT="html"
      shift
      ;;
    --threshold)
      THRESHOLD="$2"
      shift 2
      ;;
    --open)
      OPEN=true
      shift
      ;;
    --format)
      FORMAT="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: coverage.sh [options]"
      echo ""
      echo "Options:"
      echo "  --html              Generate HTML report"
      echo "  --threshold N       Fail if coverage below N%"
      echo "  --open              Open HTML report in browser"
      echo "  --format FORMAT     Output format (text, html, json, xml)"
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
  elif [[ -f "pytest.ini" ]] || grep -q "pytest" requirements-dev.txt 2>/dev/null; then
    echo "pytest"
  elif [[ -f "go.mod" ]]; then
    echo "go"
  elif [[ -f "Cargo.toml" ]]; then
    echo "rust"
  else
    echo "unknown"
  fi
}

# Generate coverage
generate_coverage() {
  local framework="$1"
  
  echo -e "${BLUE}📊 Generating coverage report...${NC}"
  
  case $framework in
    jest)
      npx jest --coverage --coverageReporters=text --coverageReporters=html --coverageReporters=lcov
      ;;
      
    pytest)
      pytest --cov=. --cov-report=term --cov-report=html --cov-report=xml
      ;;
      
    go)
      go test -coverprofile=coverage.out ./...
      go tool cover -html=coverage.out -o coverage.html
      go tool cover -func=coverage.out
      ;;
      
    rust)
      if command -v cargo-tarpaulin &> /dev/null; then
        cargo tarpaulin --out Html --out Lcov
      else
        echo -e "${YELLOW}⚠️  cargo-tarpaulin not installed${NC}"
        echo "Install with: cargo install cargo-tarpaulin"
        exit 1
      fi
      ;;
      
    *)
      echo -e "${RED}❌ Unknown framework${NC}"
      exit 1
      ;;
  esac
}

# Extract coverage percentage
get_coverage_percent() {
  local framework="$1"
  
  case $framework in
    jest)
      if [[ -f "coverage/lcov-report/index.html" ]]; then
        grep -o 'pct">[0-9.]*%' coverage/lcov-report/index.html | head -1 | grep -o '[0-9.]*' || echo "0"
      else
        echo "0"
      fi
      ;;
      
    pytest)
      if [[ -f "coverage.xml" ]]; then
        grep -o 'line-rate="[0-9.]*"' coverage.xml | head -1 | grep -o '[0-9.]*' | awk '{print $1 * 100}' || echo "0"
      else
        echo "0"
      fi
      ;;
      
    go)
      go tool cover -func=coverage.out | grep total | awk '{print $3}' | tr -d '%' || echo "0"
      ;;
      
    rust)
      # Tarpaulin outputs to stdout
      cat /dev/null | echo "0"
      ;;
      
    *)
      echo "0"
      ;;
  esac
}

# Open report in browser
open_report() {
  local framework="$1"
  local report_file=""
  
  case $framework in
    jest)
      report_file="coverage/lcov-report/index.html"
      ;;
    pytest)
      report_file="htmlcov/index.html"
      ;;
    go)
      report_file="coverage.html"
      ;;
    rust)
      report_file="tarpaulin-report.html"
      ;;
  esac
  
  if [[ -n "$report_file" ]] && [[ -f "$report_file" ]]; then
    if command -v open &> /dev/null; then
      open "$report_file"
    elif command -v xdg-open &> /dev/null; then
      xdg-open "$report_file"
    else
      echo -e "${YELLOW}⚠️  Cannot open browser automatically${NC}"
      echo "Open manually: $report_file"
    fi
  fi
}

# Main
FRAMEWORK=$(detect_framework)

echo -e "${BLUE}📊 Coverage Report${NC}"
echo ""

generate_coverage "$FRAMEWORK"

# Check threshold if specified
if [[ -n "$THRESHOLD" ]]; then
  COVERAGE=$(get_coverage_percent "$FRAMEWORK")
  
  echo ""
  echo -e "${BLUE}Coverage: ${COVERAGE}%${NC}"
  echo -e "${BLUE}Threshold: ${THRESHOLD}%${NC}"
  
  if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
    echo ""
    echo -e "${RED}❌ Coverage below threshold!${NC}"
    exit 1
  else
    echo ""
    echo -e "${GREEN}✅ Coverage meets threshold${NC}"
  fi
fi

# Open report if requested
if $OPEN; then
  open_report "$FRAMEWORK"
fi

echo ""
echo -e "${GREEN}✅ Coverage report generated${NC}"

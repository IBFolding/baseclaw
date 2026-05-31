#!/bin/bash
#
# generate-tests.sh - Auto-generate unit test scaffolding
# Usage: generate-tests.sh <file-or-directory> [options]
#

set -e

TARGET="${1:-}"
shift || true

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Options
RECURSIVE=false
LANGUAGE=""
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --recursive|-r)
      RECURSIVE=true
      shift
      ;;
    --language|-l)
      LANGUAGE="$2"
      shift 2
      ;;
    --force)
      FORCE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "Usage: generate-tests.sh <file-or-directory> [options]"
  echo ""
  echo "Options:"
  echo "  --recursive, -r    Process directories recursively"
  echo "  --language, -l     Force language (nodejs, python, go)"
  echo "  --force            Overwrite existing test files"
  exit 1
fi

# Detect language from file extension or project files
detect_language() {
  local file="$1"
  
  if [[ -n "$LANGUAGE" ]]; then
    echo "$LANGUAGE"
    return
  fi
  
  case "$file" in
    *.js|*.ts)
      echo "nodejs"
      ;;
    *.py)
      echo "python"
      ;;
    *.go)
      echo "go"
      ;;
    *.rb)
      echo "ruby"
      ;;
    *.rs)
      echo "rust"
      ;;
    *)
      # Check for project files
      if [[ -f "package.json" ]]; then
        echo "nodejs"
      elif [[ -f "requirements.txt" || -f "pyproject.toml" ]]; then
        echo "python"
      elif [[ -f "go.mod" ]]; then
        echo "go"
      elif [[ -f "Cargo.toml" ]]; then
        echo "rust"
      elif [[ -f "Gemfile" ]]; then
        echo "ruby"
      else
        echo "unknown"
      fi
      ;;
  esac
}

# Extract function/class names from file
extract_functions() {
  local file="$1"
  local lang="$2"
  
  case $lang in
    nodejs)
      grep -E "^(export\s+)?(async\s+)?function\s+\w+|exports\.\w+\s*=|module\.exports\s*=" "$file" 2>/dev/null | \
        sed -E 's/.*function\s+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        sed -E 's/.*exports\.([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        grep -v "^\s*$" || true
      ;;
    python)
      grep -E "^def\s+\w+|^class\s+\w+" "$file" 2>/dev/null | \
        sed -E 's/^def\s+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        sed -E 's/^class\s+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        grep -v "^__" || true
      ;;
    go)
      grep -E "^func\s+\w+" "$file" 2>/dev/null | \
        sed -E 's/^func\s+([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' | \
        grep -v "^Test" || true
      ;;
    *)
      echo ""
      ;;
  esac
}

# Generate test file path
get_test_path() {
  local source_file="$1"
  local lang="$2"
  local filename=$(basename "$source_file")
  local name="${filename%.*}"
  
  case $lang in
    nodejs)
      echo "tests/unit/${name}.test.js"
      ;;
    python)
      echo "tests/unit/${name}_test.py"
      ;;
      go)
      echo "tests/unit/${name}_test.go"
      ;;
    ruby)
      echo "tests/unit/${name}_spec.rb"
      ;;
    rust)
      echo "tests/unit_${name}.rs"
      ;;
    *)
      echo "tests/unit/${name}_test.txt"
      ;;
  esac
}

# Generate test content
generate_test_content() {
  local source_file="$1"
  local test_file="$2"
  local lang="$3"
  local functions="$4"
  
  local basename=$(basename "$source_file")
  
  case $lang in
    nodejs)
      cat > "$test_file" << EOF
const { $(echo "$functions" | tr '\n' ',' | sed 's/,$//') } = require('../../${source_file}');

describe('${basename}', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });
$(echo "$functions" | while read -r func; do
  [[ -z "$func" ]] && continue
  cat << INNER

  describe('${func}', () => {
    test('should handle normal case', () => {
      // TODO: Implement test
      expect(true).toBe(true);
    });

    test('should handle edge case', () => {
      // TODO: Implement edge case test
      expect(true).toBe(true);
    });

    test('should throw error for invalid input', () => {
      // TODO: Implement error case test
      expect(() => {
        ${func}();
      }).toThrow();
    });
  });
INNER
done)
});
EOF
      ;;
      
    python)
      cat > "$test_file" << EOF
import pytest
import sys
sys.path.insert(0, '../../')

from ${source_file%.py} import $(echo "$functions" | tr '\n' ',' | sed 's/,$//')


class Test$(basename "$source_file" .py | sed 's/.*/\u\0/'):
    \"\"\"Tests for ${basename}\"\"\"
    
    @pytest.fixture
    def setup(self):
        \"\"\"Setup test fixtures\"\"\"
        pass
$(echo "$functions" | while read -r func; do
  [[ -z "$func" ]] && continue
  cat << INNER

    def test_${func}_normal_case(self, setup):
        \"\"\"Test ${func} with normal input\"\"\"
        # TODO: Implement test
        assert True

    def test_${func}_edge_case(self, setup):
        \"\"\"Test ${func} with edge case\"\"\"
        # TODO: Implement test
        assert True

    def test_${func}_invalid_input(self, setup):
        \"\"\"Test ${func} raises error for invalid input\"\"\"
        # TODO: Implement error test
        with pytest.raises(Exception):
            ${func}()
INNER
done)
EOF
      ;;
      
    go)
      cat > "$test_file" << EOF
package main

import (
	"testing"
)
$(echo "$functions" | while read -r func; do
  [[ -z "$func" ]] && continue
  cat << INNER

func Test${func}(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected interface{}
		wantErr  bool
	}{
		{
			name:     "normal case",
			input:    nil,
			expected: nil,
			wantErr:  false,
		},
		{
			name:     "edge case",
			input:    nil,
			expected: nil,
			wantErr:  false,
		},
		{
			name:     "invalid input",
			input:    nil,
			expected: nil,
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// TODO: Implement test
			_ = tt
		})
	}
}
INNER
done)
EOF
      ;;
      
    *)
      echo "# Tests for ${basename}" > "$test_file"
      echo "" >> "$test_file"
      echo "# TODO: Implement tests for functions:" >> "$test_file"
      echo "$functions" | while read -r func; do
        [[ -z "$func" ]] && continue
        echo "# - $func" >> "$test_file"
      done
      ;;
  esac
}

# Process a single file
process_file() {
  local file="$1"
  
  echo -e "${BLUE}📄 Processing: $file${NC}"
  
  local lang=$(detect_language "$file")
  
  if [[ "$lang" == "unknown" ]]; then
    echo -e "${YELLOW}⚠️  Cannot detect language for $file, skipping${NC}"
    return
  fi
  
  local test_file=$(get_test_path "$file" "$lang")
  
  # Check if test file already exists
  if [[ -f "$test_file" ]] && ! $FORCE; then
    echo -e "${YELLOW}⚠️  Test file exists: $test_file (use --force to overwrite)${NC}"
    return
  fi
  
  # Create test directory
  mkdir -p "$(dirname "$test_file")"
  
  # Extract functions
  local functions=$(extract_functions "$file" "$lang")
  
  # Generate test file
  generate_test_content "$file" "$test_file" "$lang" "$functions"
  
  echo -e "${GREEN}✅ Generated: $test_file${NC}"
}

# Process directory
process_directory() {
  local dir="$1"
  
  echo -e "${BLUE}📁 Processing directory: $dir${NC}"
  
  local find_opts="-maxdepth 1"
  if $RECURSIVE; then
    find_opts=""
  fi
  
  eval "find '$dir' $find_opts -type f \( \""
  case $(detect_language "") in
    nodejs) echo "-name '*.js' -o -name '*.ts'" ;;
    python) echo "-name '*.py'" ;;
    go) echo "-name '*.go'" ;;
    ruby) echo "-name '*.rb'" ;;
    rust) echo "-name '*.rs'" ;;
    *) echo "-name '*.js' -o -name '*.py' -o -name '*.go'" ;;
  esac
  echo "\)" | while read -r file; do
    [[ -f "$file" ]] || continue
    [[ "$file" == *"_test.go" ]] && continue
    [[ "$file" == *".test.js" ]] && continue
    [[ "$file" == *"_test.py" ]] && continue
    process_file "$file"
  done
}

# Main execution
if [[ -f "$TARGET" ]]; then
  process_file "$TARGET"
elif [[ -d "$TARGET" ]]; then
  process_directory "$TARGET"
else
  echo -e "${RED}❌ Target not found: $TARGET${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Test generation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review generated test files"
echo "  2. Implement the TODO test cases"
echo "  3. Run: run-tests.sh"

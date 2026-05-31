#!/bin/bash
#
# init.sh - Initialize testing framework for a project
# Usage: init.sh <language> [options]
#

set -e

LANGUAGE="${1:-}"
shift || true

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

usage() {
  echo "Usage: init.sh <language> [options]"
  echo ""
  echo "Languages: nodejs, python, go, rust, ruby"
  echo ""
  echo "Options:"
  echo "  --force    Overwrite existing configuration"
}

if [[ -z "$LANGUAGE" ]]; then
  echo -e "${RED}❌ Language is required${NC}"
  usage
  exit 1
fi

echo -e "${GREEN}🧪 Initializing test framework for $LANGUAGE...${NC}"

# Create test directory structure
mkdir -p tests/{unit,integration,e2e,fixtures}

case $LANGUAGE in
  nodejs|javascript|js)
    init_nodejs
    ;;
  python|py)
    init_python
    ;;
  go|golang)
    init_go
    ;;
  rust|rs)
    init_rust
    ;;
  ruby|rb)
    init_ruby
    ;;
  *)
    echo -e "${RED}❌ Unsupported language: $LANGUAGE${NC}"
    usage
    exit 1
    ;;
esac

# Create test config
cat > test.config.json << EOF
{
  "language": "$LANGUAGE",
  "framework": "auto-detected",
  "coverage": {
    "threshold": 80,
    "reporters": ["text", "html", "lcov"]
  },
  "directories": {
    "unit": "tests/unit",
    "integration": "tests/integration",
    "e2e": "tests/e2e",
    "fixtures": "tests/fixtures"
  }
}
EOF

echo ""
echo -e "${GREEN}✅ Test framework initialized!${NC}"
echo ""
echo "Directory structure created:"
echo "  tests/unit/       - Unit tests"
echo "  tests/integration/ - Integration tests"
echo "  tests/e2e/        - End-to-end tests"
echo "  tests/fixtures/   - Test data"
echo ""
echo "Next steps:"
echo "  1. Run: generate-tests.sh <file> to create tests"
echo "  2. Run: run-tests.sh to execute tests"

# Language-specific initialization functions

init_nodejs() {
  echo "📦 Setting up Jest for Node.js..."
  
  # Check if package.json exists
  if [[ ! -f "package.json" ]]; then
    echo -e "${YELLOW}⚠️  No package.json found, creating one...${NC}"
    npm init -y
  fi
  
  # Install jest and related packages
  npm install --save-dev jest @types/jest
  
  # Create jest config
  cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'html', 'lcov'],
  coverageDirectory: 'coverage',
};
EOF
  
  # Update package.json with test script
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.test = 'jest';
    pkg.scripts['test:watch'] = 'jest --watch';
    pkg.scripts['test:coverage'] = 'jest --coverage';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  "
  
  # Create example test
  cat > tests/unit/example.test.js << 'EOF'
describe('Example Test Suite', () => {
  test('should pass a basic test', () => {
    expect(true).toBe(true);
  });
  
  test('should perform basic math', () => {
    expect(1 + 1).toBe(2);
  });
});
EOF
  
  echo -e "${GREEN}✓ Jest configured in package.json${NC}"
}

init_python() {
  echo "🐍 Setting up pytest for Python..."
  
  # Create pytest config
  cat > pytest.ini << 'EOF'
[tool:pytest]
testpaths = tests
python_files = *_test.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
EOF
  
  # Create conftest.py
  cat > tests/conftest.py << 'EOF'
import pytest

@pytest.fixture
def sample_data():
    return {
        'name': 'Test',
        'value': 42
    }
EOF
  
  # Create example test
  cat > tests/unit/example_test.py << 'EOF'
def test_basic_assertion():
    assert True

def test_math():
    assert 1 + 1 == 2

class TestExampleSuite:
    def test_class_method(self):
        assert "hello".upper() == "HELLO"
EOF
  
  # Create requirements-dev.txt
  cat > requirements-dev.txt << 'EOF'
pytest>=7.0.0
pytest-cov>=4.0.0
pytest-xdist>=3.0.0
EOF
  
  echo -e "${GREEN}✓ pytest configured${NC}"
  echo "Install test dependencies: pip install -r requirements-dev.txt"
}

init_go() {
  echo "🐹 Setting up Go testing..."
  
  # Create example test
  cat > tests/unit/example_test.go << 'EOF'
package main

import "testing"

func TestBasic(t *testing.T) {
    if false {
        t.Error("This should not fail")
    }
}

func TestAddition(t *testing.T) {
    result := 1 + 1
    if result != 2 {
        t.Errorf("Expected 2, got %d", result)
    }
}
EOF
  
  # Create test script
  cat > run_tests.sh << 'EOF'
#!/bin/bash
go test -v ./...
EOF
  chmod +x run_tests.sh
  
  echo -e "${GREEN}✓ Go testing configured${NC}"
}

init_rust() {
  echo "🦀 Rust tests are built-in with cargo test"
  
  # Create example test
  cat > tests/unit_example.rs << 'EOF'
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
EOF
  
  echo -e "${GREEN}✓ Run tests with: cargo test${NC}"
}

init_ruby() {
  echo "💎 Setting up RSpec for Ruby..."
  
  # Create RSpec config
  cat > .rspec << 'EOF'
--require spec_helper
--format documentation
--color
EOF
  
  # Create spec helper
  cat > tests/spec_helper.rb << 'EOF'
RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end
  
  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end
  
  config.shared_context_metadata_behavior = :apply_to_host_groups
end
EOF
  
  # Create example spec
  cat > tests/unit/example_spec.rb << 'EOF'
RSpec.describe 'Example' do
  it 'passes a basic test' do
    expect(true).to be true
  end
  
  it 'performs basic math' do
    expect(1 + 1).to eq(2)
  end
end
EOF
  
  echo -e "${GREEN}✓ RSpec configured${NC}"
  echo "Install RSpec: gem install rspec"
}

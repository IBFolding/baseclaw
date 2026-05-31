#!/bin/bash
#
# env-manager.sh - Manage environment variables and secrets
# Usage: env-manager.sh <command> [args]
#

set -e

COMMAND="${1:-list}"
shift || true

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
  echo "Environment Manager"
  echo ""
  echo "Usage: env-manager.sh <command> [args]"
  echo ""
  echo "Commands:"
  echo "  list                              List all environments"
  echo "  set <env> <key> <value>           Set environment variable"
  echo "  get <env> <key>                   Get environment variable"
  echo "  unset <env> <key>                 Remove environment variable"
  echo "  set-secret <env> <key>            Set secret (interactive)"
  echo "  export <env>                      Export environment to .env file"
  echo "  import <env> <file>               Import environment from file"
  echo "  compare <env1> <env2>             Compare two environments"
  echo ""
  echo "Environments: dev, staging, prod"
  echo ""
  echo "Examples:"
  echo "  env-manager.sh set dev DB_HOST localhost"
  echo "  env-manager.sh set-secret prod API_KEY"
  echo "  env-manager.sh export staging > .env.staging"
}

# Storage directory
ENV_DIR="${HOME}/.openclaw/envs"
mkdir -p "$ENV_DIR"

list_environments() {
  echo -e "${BLUE}📁 Environments:${NC}"
  for env_file in "$ENV_DIR"/*.env; do
    if [[ -f "$env_file" ]]; then
      env_name=$(basename "$env_file" .env)
      var_count=$(grep -c '^[A-Z]' "$env_file" 2>/dev/null || echo "0")
      echo "  $env_name ($var_count variables)"
    fi
  done
  
  echo ""
  echo -e "${BLUE}🔒 Secrets:${NC}"
  for secret_file in "$ENV_DIR"/*.secrets; do
    if [[ -f "$secret_file" ]]; then
      env_name=$(basename "$secret_file" .secrets)
      secret_count=$(grep -c '^[A-Z]' "$secret_file" 2>/dev/null || echo "0")
      echo "  $env_name ($secret_count secrets)"
    fi
  done
}

set_var() {
  local env="$1"
  local key="$2"
  local value="$3"
  
  if [[ -z "$env" || -z "$key" || -z "$value" ]]; then
    echo -e "${RED}❌ Usage: set <env> <key> <value>${NC}"
    exit 1
  fi
  
  local env_file="$ENV_DIR/${env}.env"
  
  # Remove existing key if present
  if [[ -f "$env_file" ]]; then
    grep -v "^${key}=" "$env_file" > "$env_file.tmp" || true
    mv "$env_file.tmp" "$env_file"
  fi
  
  # Add new key
  echo "${key}=${value}" >> "$env_file"
  echo -e "${GREEN}✅ Set ${key} for ${env}${NC}"
}

get_var() {
  local env="$1"
  local key="$2"
  
  if [[ -z "$env" || -z "$key" ]]; then
    echo -e "${RED}❌ Usage: get <env> <key>${NC}"
    exit 1
  fi
  
  local env_file="$ENV_DIR/${env}.env"
  
  if [[ -f "$env_file" ]]; then
    grep "^${key}=" "$env_file" | cut -d'=' -f2- || echo ""
  fi
}

unset_var() {
  local env="$1"
  local key="$2"
  
  if [[ -z "$env" || -z "$key" ]]; then
    echo -e "${RED}❌ Usage: unset <env> <key>${NC}"
    exit 1
  fi
  
  local env_file="$ENV_DIR/${env}.env"
  
  if [[ -f "$env_file" ]]; then
    grep -v "^${key}=" "$env_file" > "$env_file.tmp" || true
    mv "$env_file.tmp" "$env_file"
    echo -e "${GREEN}✅ Unset ${key} for ${env}${NC}"
  fi
}

set_secret() {
  local env="$1"
  local key="$2"
  
  if [[ -z "$env" || -z "$key" ]]; then
    echo -e "${RED}❌ Usage: set-secret <env> <key>${NC}"
    exit 1
  fi
  
  read -s -p "Enter secret value: " value
  echo ""
  
  local secret_file="$ENV_DIR/${env}.secrets"
  
  # Remove existing key if present
  if [[ -f "$secret_file" ]]; then
    grep -v "^${key}=" "$secret_file" > "$secret_file.tmp" || true
    mv "$secret_file.tmp" "$secret_file"
  fi
  
  echo "${key}=${value}" >> "$secret_file"
  chmod 600 "$secret_file"
  echo -e "${GREEN}✅ Set secret ${key} for ${env}${NC}"
}

export_env() {
  local env="$1"
  
  if [[ -z "$env" ]]; then
    echo -e "${RED}❌ Usage: export <env>${NC}"
    exit 1
  fi
  
  local env_file="$ENV_DIR/${env}.env"
  local secret_file="$ENV_DIR/${env}.secrets"
  
  echo "# Environment: $env"
  echo "# Exported: $(date)"
  echo ""
  
  if [[ -f "$env_file" ]]; then
    cat "$env_file"
  fi
  
  if [[ -f "$secret_file" ]]; then
    echo ""
    echo "# Secrets (masked)"
    while IFS='=' read -r key value; do
      echo "${key}=***REDACTED***"
    done < "$secret_file"
  fi
}

import_env() {
  local env="$1"
  local file="$2"
  
  if [[ -z "$env" || -z "$file" ]]; then
    echo -e "${RED}❌ Usage: import <env> <file>${NC}"
    exit 1
  fi
  
  if [[ ! -f "$file" ]]; then
    echo -e "${RED}❌ File not found: $file${NC}"
    exit 1
  fi
  
  local env_file="$ENV_DIR/${env}.env"
  
  # Backup existing
  if [[ -f "$env_file" ]]; then
    cp "$env_file" "$env_file.bak"
  fi
  
  # Import new values
  cp "$file" "$env_file"
  echo -e "${GREEN}✅ Imported environment $env from $file${NC}"
}

compare_envs() {
  local env1="$1"
  local env2="$2"
  
  if [[ -z "$env1" || -z "$env2" ]]; then
    echo -e "${RED}❌ Usage: compare <env1> <env2>${NC}"
    exit 1
  fi
  
  local file1="$ENV_DIR/${env1}.env"
  local file2="$ENV_DIR/${env2}.env"
  
  echo -e "${BLUE}🔍 Comparing $env1 and $env2:${NC}"
  echo ""
  
  if command -v diff &> /dev/null; then
    diff "$file1" "$file2" || true
  else
    echo -e "${YELLOW}⚠️  diff command not available${NC}"
  fi
}

# Main
case $COMMAND in
  list)
    list_environments
    ;;
  set)
    set_var "$@"
    ;;
  get)
    get_var "$@"
    ;;
  unset)
    unset_var "$@"
    ;;
  set-secret)
    set_secret "$@"
    ;;
  export)
    export_env "$@"
    ;;
  import)
    import_env "$@"
    ;;
  compare)
    compare_envs "$@"
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    echo -e "${RED}❌ Unknown command: $COMMAND${NC}"
    usage
    exit 1
    ;;
esac

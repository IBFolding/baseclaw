#!/bin/bash
#
# deploy.sh - Deploy to specific environments
# Usage: deploy.sh <environment>
#

set -e

ENVIRONMENT="${1:-dev}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate environment
validate_environment() {
  case $ENVIRONMENT in
    dev|development)
      ENV="development"
      URL="${DEV_URL:-https://dev.example.com}"
      ;;
    staging)
      ENV="staging"
      URL="${STAGING_URL:-https://staging.example.com}"
      ;;
    prod|production)
      ENV="production"
      URL="${PROD_URL:-https://example.com}"
      ;;
    *)
      echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
      echo "Valid environments: dev, staging, prod"
      exit 1
      ;;
  esac
}

# Confirm production deployment
confirm_production() {
  if [[ "$ENV" == "production" ]]; then
    echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to PRODUCTION${NC}"
    echo -e "${YELLOW}   URL: $URL${NC}"
    echo ""
    read -p "Are you sure? Type 'deploy' to confirm: " confirm
    if [[ "$confirm" != "deploy" ]]; then
      echo -e "${RED}❌ Deployment cancelled${NC}"
      exit 1
    fi
  fi
}

# Deploy based on project type
deploy() {
  echo -e "${GREEN}🚀 Deploying to $ENV...${NC}"
  
  # Detect project type
  if [[ -f "package.json" ]]; then
    deploy_nodejs
  elif [[ -f "requirements.txt" || -f "pyproject.toml" ]]; then
    deploy_python
  elif [[ -f "Dockerfile" ]]; then
    deploy_docker
  elif [[ -f "terraform/main.tf" ]]; then
    deploy_terraform
  else
    echo -e "${YELLOW}⚠️  Unknown project type, using generic deployment${NC}"
    deploy_generic
  fi
}

deploy_nodejs() {
  echo "📦 Node.js project detected"
  
  # Install dependencies
  npm ci
  
  # Run build
  npm run build
  
  # Deploy (customize based on your platform)
  case $ENV in
    development)
      echo "Deploying to dev server..."
      # Add your dev deployment command here
      ;;
    staging)
      echo "Deploying to staging server..."
      # Add your staging deployment command here
      ;;
    production)
      echo "Deploying to production server..."
      # Add your production deployment command here
      ;;
  esac
}

deploy_python() {
  echo "🐍 Python project detected"
  
  # Install dependencies
  pip install -r requirements.txt
  
  # Run migrations if applicable
  if command -v alembic &> /dev/null; then
    echo "Running database migrations..."
    alembic upgrade head
  fi
  
  # Deploy
  echo "Deploying Python application..."
}

deploy_docker() {
  echo "🐳 Docker project detected"
  
  # Build image
  docker build -t "app:$ENV" .
  
  # Push to registry (if configured)
  if [[ -n "$DOCKER_REGISTRY" ]]; then
    docker tag "app:$ENV" "$DOCKER_REGISTRY/app:$ENV"
    docker push "$DOCKER_REGISTRY/app:$ENV"
  fi
  
  # Deploy
  echo "Deploying Docker container..."
}

deploy_terraform() {
  echo "🏗️  Terraform project detected"
  
  cd terraform || exit 1
  
  # Initialize and apply
  terraform init
  terraform workspace select "$ENV" || terraform workspace new "$ENV"
  terraform apply -auto-approve
}

deploy_generic() {
  echo "Running generic deployment..."
  # Add custom deployment logic here
}

# Main execution
main() {
  validate_environment
  confirm_production
  deploy
  
  echo ""
  echo -e "${GREEN}✅ Deployment to $ENV complete!${NC}"
  echo -e "${GREEN}   URL: $URL${NC}"
}

main

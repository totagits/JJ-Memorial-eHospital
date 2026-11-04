#!/usr/bin/env bash
# ==============================================================================
# J & J Memorial e-Hospital — Automated Coolify GitHub Webhook Setup Script
# Repository: totagits/JJ-Memorial-eHospital
# Target Branch: JJ-Memorial-staging
# Coolify Host: https://coolify.totaggroup.com
# ==============================================================================

set -euo pipefail

# ANSI Color Codes
GREEN='\033[0;32m'
TEAL='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

REPO_OWNER="totagits"
REPO_NAME="JJ-Memorial-eHospital"
TARGET_BRANCH="JJ-Memorial-staging"

echo -e "${TEAL}${BOLD}"
echo "========================================================================"
echo "    J & J Memorial e-Hospital — Coolify GitHub Webhook Configurator     "
echo "========================================================================"
echo -e "${NC}"

COOLIFY_URL=""
GITHUB_TOKEN=""
ACTION="create"

# Parse CLI arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --webhook-url|-u)
      COOLIFY_URL="$2"
      shift 2
      ;;
    --token|-t)
      GITHUB_TOKEN="$2"
      shift 2
      ;;
    --test-only)
      ACTION="test"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -u, --webhook-url   The Coolify deployment webhook URL"
      echo "  -t, --token         GitHub Personal Access Token (PAT) with repo scope"
      echo "      --test-only     Only ping the Coolify webhook to test connectivity"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Prompt for Coolify Webhook URL if not supplied
if [ -z "$COOLIFY_URL" ]; then
  echo -e "${YELLOW}Step 1: Enter your Coolify Webhook URL${NC}"
  echo -e "You can find this in Coolify (${TEAL}https://coolify.totaggroup.com/${NC}) under:"
  echo -e "Your Resource -> Webhooks -> Webhook Deployment URL"
  echo ""
  read -r -p "Coolify Webhook URL: " COOLIFY_URL
  echo ""
fi

if [ -z "$COOLIFY_URL" ]; then
  echo -e "${RED}Error: Coolify Webhook URL cannot be empty.${NC}"
  exit 1
fi

# If test-only, ping the webhook and exit
if [ "$ACTION" = "test" ]; then
  echo -e "${TEAL}Testing Coolify Webhook connectivity...${NC}"
  HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$COOLIFY_URL" \
    -H "Content-Type: application/json" \
    -d "{\"ref\":\"refs/heads/$TARGET_BRANCH\",\"repository\":{\"full_name\":\"$REPO_OWNER/$REPO_NAME\"}}" || true)

  if [[ "$HTTP_RESPONSE" =~ ^(200|201|202|204)$ ]]; then
    echo -e "${GREEN}✓ Success! Coolify responded with HTTP $HTTP_RESPONSE (Deployment Queued).${NC}"
    exit 0
  else
    echo -e "${YELLOW}Notice: Coolify returned HTTP $HTTP_RESPONSE. Please check your URL.${NC}"
    exit 1
  fi
fi

# Prompt for GitHub PAT if not supplied
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${YELLOW}Step 2: Enter your GitHub Personal Access Token (PAT)${NC}"
  echo -e "Token must have ${BOLD}repo${NC} or ${BOLD}admin:repo_hook${NC} scope."
  echo ""
  read -r -s -p "GitHub PAT (hidden): " GITHUB_TOKEN
  echo ""
  echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}Error: GitHub Token is required to register the webhook.${NC}"
  exit 1
fi

echo -e "${TEAL}Registering webhook on GitHub (${REPO_OWNER}/${REPO_NAME})...${NC}"

# Check for existing webhooks to avoid duplicates
EXISTING_HOOKS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/hooks")

# Create payload
HOOK_PAYLOAD=$(cat <<EOF
{
  "name": "web",
  "active": true,
  "events": [
    "push"
  ],
  "config": {
    "url": "$COOLIFY_URL",
    "content_type": "json",
    "insecure_ssl": "0"
  }
}
EOF
)

API_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/hooks" \
  -d "$HOOK_PAYLOAD")

HTTP_STATUS=$(echo "$API_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$API_RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" -eq 201 ]; then
  HOOK_ID=$(echo "$RESPONSE_BODY" | grep -o '"id": [0-9]*' | head -n1 | cut -d' ' -f2 || echo "Created")
  echo -e "${GREEN}========================================================================${NC}"
  echo -e "${GREEN}✓ GitHub Webhook successfully created! (ID: ${HOOK_ID})${NC}"
  echo -e "${GREEN}========================================================================${NC}"
  echo ""
  echo -e "Repository: ${BOLD}$REPO_OWNER/$REPO_NAME${NC}"
  echo -e "Target:     ${BOLD}$COOLIFY_URL${NC}"
  echo -e "Events:     ${BOLD}push (Branch: $TARGET_BRANCH)${NC}"
  echo ""
  echo -e "From now on, every push to ${TEAL}$TARGET_BRANCH${NC} will automatically"
  echo -e "trigger a rebuild and deploy on Coolify at ${TEAL}https://coolify.totaggroup.com/${NC}!"
  echo ""
elif [ "$HTTP_STATUS" -eq 422 ]; then
  echo -e "${YELLOW}Notice: A webhook with this URL may already exist on GitHub.${NC}"
  echo -e "Response: $RESPONSE_BODY"
else
  echo -e "${RED}Failed to register webhook. HTTP Status: $HTTP_STATUS${NC}"
  echo -e "API Response: $RESPONSE_BODY"
  echo ""
  echo -e "${YELLOW}Fallback to manual setup in GitHub UI:${NC}"
  echo "1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/settings/hooks/new"
  echo "2. Payload URL: $COOLIFY_URL"
  echo "3. Content type: application/json"
  echo "4. Trigger: Just the push event"
  echo "5. Click 'Add webhook'"
fi

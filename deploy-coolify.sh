#!/bin/bash
set -euo pipefail

# =============================================================================
# Lead CRM — Coolify Deployment Script
# =============================================================================
# Prerequisites:
#   1. Coolify API key with * (full access) permissions
#   2. GitHub source configured in Coolify (Bigl Bot has access)
#
# Usage:
#   export COOLIFY_URL="https://coolify.bigls.net"
#   export COOLIFY_TOKEN="<your-api-token-with-full-access>"
#   bash deploy-coolify.sh
# =============================================================================

COOLIFY_URL="${COOLIFY_URL:-https://coolify.bigls.net}"
COOLIFY_TOKEN="${COOLIFY_TOKEN:?Set COOLIFY_TOKEN with a full-access API key}"
API="${COOLIFY_URL}/api/v1"
AUTH="Authorization: Bearer ${COOLIFY_TOKEN}"

# Generated API key for the CRM
CRM_API_KEY="${CRM_API_KEY:-Rlv95iRtGDOe2FbShgdUBdU3oipwy9u8WlQo3iSA}"

echo "=== Lead CRM Coolify Deployment ==="
echo "Coolify: ${COOLIFY_URL}"
echo ""

# Helper
call() {
  local method="$1" endpoint="$2" data="${3:-}"
  if [ -n "$data" ]; then
    curl -sf -X "$method" "${API}${endpoint}" \
      -H "$AUTH" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -sf -X "$method" "${API}${endpoint}" \
      -H "$AUTH" \
      -H "Content-Type: application/json"
  fi
}

# 1. Verify API access
echo "1. Verifying API access..."
VERSION=$(call GET "/version" || echo "FAIL")
if echo "$VERSION" | grep -q "not allowed\|FAIL"; then
  echo "ERROR: API key doesn't have sufficient permissions."
  echo "Go to Coolify → Settings → API Tokens → Create new token with * (all) permission"
  exit 1
fi
echo "   Coolify version: $VERSION"

# 2. Get server UUID (use localhost/default)
echo "2. Finding server..."
SERVERS=$(call GET "/servers")
SERVER_UUID=$(echo "$SERVERS" | python3 -c "import sys,json; servers=json.load(sys.stdin); print(servers[0]['uuid'])" 2>/dev/null)
echo "   Server UUID: ${SERVER_UUID}"

# 3. Find or list GitHub sources
echo "3. Finding GitHub source..."
# List existing sources to find the GitHub one
SOURCES=$(call GET "/security/keys" || echo "[]")
echo "   Available keys listed."

# 4. Create project
echo "4. Creating project 'Lead CRM'..."
PROJECT=$(call POST "/projects" '{"name":"Lead CRM","description":"Lead management CRM for Matthias Bigl Web Dev"}')
PROJECT_UUID=$(echo "$PROJECT" | python3 -c "import sys,json; print(json.load(sys.stdin)['uuid'])" 2>/dev/null)
echo "   Project UUID: ${PROJECT_UUID}"

# 5. Create PostgreSQL database
echo "5. Creating PostgreSQL database..."
DB=$(call POST "/databases" "{
  \"type\": \"postgresql\",
  \"name\": \"lead-crm-db\",
  \"server_uuid\": \"${SERVER_UUID}\",
  \"project_uuid\": \"${PROJECT_UUID}\",
  \"environment_name\": \"production\",
  \"postgres_user\": \"leadcrm\",
  \"postgres_password\": \"$(openssl rand -base64 24 | tr -d '/+=')\",
  \"postgres_db\": \"lead_crm\"
}")
DB_UUID=$(echo "$DB" | python3 -c "import sys,json; print(json.load(sys.stdin)['uuid'])" 2>/dev/null)
echo "   Database UUID: ${DB_UUID}"

# Get the internal DB URL
echo "   Waiting for DB to start..."
sleep 10
DB_DETAILS=$(call GET "/databases/${DB_UUID}")
DB_INTERNAL_URL=$(echo "$DB_DETAILS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('internal_db_url', 'UNKNOWN'))" 2>/dev/null)
echo "   Database URL: ${DB_INTERNAL_URL}"

# 6. Create application
echo "6. Creating application..."
APP=$(call POST "/applications" "{
  \"type\": \"dockerfile\",
  \"name\": \"lead-crm\",
  \"server_uuid\": \"${SERVER_UUID}\",
  \"project_uuid\": \"${PROJECT_UUID}\",
  \"environment_name\": \"production\",
  \"git_repository\": \"matthiasbigl/lead-crm\",
  \"git_branch\": \"main\",
  \"ports_exposes\": \"3000\",
  \"dockerfile_location\": \"/Dockerfile\",
  \"build_pack\": \"dockerfile\"
}")
APP_UUID=$(echo "$APP" | python3 -c "import sys,json; print(json.load(sys.stdin)['uuid'])" 2>/dev/null)
echo "   App UUID: ${APP_UUID}"

# 7. Set environment variables
echo "7. Setting environment variables..."
call POST "/applications/${APP_UUID}/envs" "{
  \"key\": \"DATABASE_URL\",
  \"value\": \"${DB_INTERNAL_URL}\",
  \"is_build_time\": false,
  \"is_preview\": false
}" > /dev/null

call POST "/applications/${APP_UUID}/envs" "{
  \"key\": \"API_KEY\",
  \"value\": \"${CRM_API_KEY}\",
  \"is_build_time\": false,
  \"is_preview\": false
}" > /dev/null

call POST "/applications/${APP_UUID}/envs" "{
  \"key\": \"GOOGLE_PLACES_API_KEY\",
  \"value\": \"\",
  \"is_build_time\": false,
  \"is_preview\": false
}" > /dev/null

call POST "/applications/${APP_UUID}/envs" "{
  \"key\": \"PUBLIC_APP_NAME\",
  \"value\": \"Lead CRM\",
  \"is_build_time\": false,
  \"is_preview\": false
}" > /dev/null

echo "   Environment variables set."

# 8. Deploy
echo "8. Deploying..."
DEPLOY=$(call POST "/applications/${APP_UUID}/deploy")
echo "   Deploy triggered: ${DEPLOY}"

echo ""
echo "=== DEPLOYMENT INITIATED ==="
echo "App UUID: ${APP_UUID}"
echo "DB UUID: ${DB_UUID}"
echo "CRM API Key: ${CRM_API_KEY}"
echo ""
echo "Check deployment status at: ${COOLIFY_URL}"
echo "Once deployed, configure a domain in Coolify UI."
echo ""
echo "Test commands after deployment:"
echo "  curl https://<your-domain>/api/leads"
echo "  curl -X POST https://<your-domain>/api/leads -H 'x-api-key: ${CRM_API_KEY}' -H 'Content-Type: application/json' -d '{\"businessName\":\"Test GmbH\"}'"

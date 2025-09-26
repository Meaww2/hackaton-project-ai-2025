#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}
LOGIN_EMAIL=${LOGIN_EMAIL:-manager@example.com}
LOGIN_PASSWORD=${LOGIN_PASSWORD:-Password123!}
COOKIE_JAR=$(mktemp)
CLEANUP_PERFORMED=false

cleanup() {
  if [ "$CLEANUP_PERFORMED" = false ]; then
    rm -f "$COOKIE_JAR"
    CLEANUP_PERFORMED=true
  fi
}

trap cleanup EXIT INT TERM

log_step() {
  echo "[SMOKE] $1"
}

log_step "Logging in as ${LOGIN_EMAIL}"
curl -fsSL -c "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -X POST "$BASE_URL/api/v1/login" \
  --data "{\"user\":{\"email\":\"${LOGIN_EMAIL}\",\"password\":\"${LOGIN_PASSWORD}\"}}" >/dev/null

log_step "GET /api/v1/products"
curl -fsSL -b "$COOKIE_JAR" "$BASE_URL/api/v1/products"
echo

dashboard_params="limit=5"
log_step "GET /api/v1/stock_movements?${dashboard_params}"
curl -fsSL -b "$COOKIE_JAR" "$BASE_URL/api/v1/stock_movements?${dashboard_params}"
echo

log_step "GET /api/v1/dashboard/stock"
curl -fsSL -b "$COOKIE_JAR" "$BASE_URL/api/v1/dashboard/stock"
echo

log_step "POST /api/v1/products/reorder_suggestion (sku: PEN-001)"
curl -fsSL -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -X POST "$BASE_URL/api/v1/products/reorder_suggestion" \
  --data '{"product":{"sku":"PEN-001"}}'
echo

echo
log_step "Logging out"
curl -fsSL -b "$COOKIE_JAR" -X DELETE "$BASE_URL/api/v1/logout" >/dev/null
cleanup

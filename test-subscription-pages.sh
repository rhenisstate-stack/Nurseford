#!/usr/bin/env bash
# ==============================================================================
# Script: test-subscription-pages.sh
# Purpose: Test all subscription message & callback routes in the terminal
# ==============================================================================

BASE_URL="http://localhost:3000"

# ANSI Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
BOLD="\033[1m"
NC="\033[0m" # No Color

echo -e "\n${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${CYAN}   Rhenis Subscription Message Routes Health Check   ${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}\n"

# Verify dev server is up
echo -e "${BLUE}Checking connection to ${BASE_URL}...${NC}"
SERVER_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" 2>/dev/null)
if [ -z "$SERVER_CHECK" ] || [ "$SERVER_CHECK" -eq 000 ]; then
  echo -e "${RED}[ERROR] Dev server is not reachable at ${BASE_URL}.${NC}"
  echo -e "Make sure 'npm run dev' is running.\n"
  exit 1
fi
echo -e "${GREEN}[OK] Dev server responded with HTTP ${SERVER_CHECK}${NC}\n"

# Define test endpoints
declare -a ENDPOINTS=(
  # Dedicated callback & message pages
  "/pages/subscription/package?status=success&plan=NCLEX-RN%20Prep&amount=49.99&currency=$&provider=stripe&reference=ch_test_123"
  "/pages/subscription/package?status=pending&provider=mpesa&reference=NL9820129&plan=ATI%20TEAS%20Monthly&amount=29.00&currency=$"
  "/pages/subscription/package?status=cancel"
  "/pages/subscription/package?status=failed&message=Card%20declined"
  "/pages/subscription/package?plan=Comprehensive%20Pass&amount=89.00&currency=$&provider=stripe"

  # Dashboard packages pages with flash status banner
  "/dashboards/rn-nursing/vista/subscriptions/packages?status=success&provider=stripe&reference=sub_8920112"
  "/dashboards/ati-teas/vista/subscriptions/packages?status=pending&provider=mpesa&reference=WS1029384"
  "/dashboards/nclex-rn/vista/subscriptions/packages?status=success&provider=stripe"
  "/dashboards/nclex-pn/vista/subscriptions/packages?status=cancel"
  "/dashboards/cna/vista/subscriptions/packages?status=failed&provider=paypal"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for ENDPOINT in "${ENDPOINTS[@]}"; do
  FULL_URL="${BASE_URL}${ENDPOINT}"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FULL_URL" 2>/dev/null)

  if [ "$STATUS" -eq 200 ]; then
    echo -e "  ${GREEN}✓ [${STATUS}]${NC} ${ENDPOINT}"
    ((SUCCESS_COUNT++))
  elif [ "$STATUS" -eq 307 ] || [ "$STATUS" -eq 308 ] || [ "$STATUS" -eq 302 ]; then
    echo -e "  ${YELLOW}↷ [${STATUS} REDIRECT]${NC} ${ENDPOINT}"
    ((SUCCESS_COUNT++))
  else
    echo -e "  ${RED}✗ [${STATUS}]${NC} ${ENDPOINT}"
    ((FAIL_COUNT++))
  fi
done

echo -e "\n${BOLD}${CYAN}------------------------------------------------------${NC}"
echo -e "${BOLD}Summary: ${GREEN}${SUCCESS_COUNT} Passed${NC} | ${RED}${FAIL_COUNT} Failed${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}\n"

# Optional: Open directly in browser if requested
if [ "$1" == "--open" ]; then
  echo -e "${BLUE}Opening success test page in browser...${NC}"
  if command -v explorer.exe >/dev/null 2>&1; then
    explorer.exe "${BASE_URL}/pages/subscription/package?status=success&plan=NCLEX-RN%20Prep&amount=49.99&currency=$&provider=stripe&reference=ch_test_123"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "${BASE_URL}/pages/subscription/package?status=success&plan=NCLEX-RN%20Prep&amount=49.99&currency=$&provider=stripe&reference=ch_test_123"
  elif command -v open >/dev/null 2>&1; then
    open "${BASE_URL}/pages/subscription/package?status=success&plan=NCLEX-RN%20Prep&amount=49.99&currency=$&provider=stripe&reference=ch_test_123"
  fi
fi

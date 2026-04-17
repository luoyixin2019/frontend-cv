#!/usr/bin/env bash
# deploy.sh — Deploy an HTML resume to Vercel for instant sharing
#
# Usage:
#   bash scripts/deploy.sh <path-to-html>
#
# Examples:
#   bash scripts/deploy.sh ./res/demo/resume.html
#   bash scripts/deploy.sh ./resume.html
#
# What this does:
#   1. Checks if Vercel CLI is installed (installs if not)
#   2. Checks if user is logged in (guides through login if not)
#   3. Deploys the resume to a public URL
#   4. Prints the live URL
#
# The deployed URL is permanent and works on any device.
# No server to maintain — Vercel hosts it for free.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${CYAN}ℹ${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
err()   { echo -e "${RED}✗${NC} $*" >&2; }

# ─── Input validation ─────────────────────────────────────

if [[ $# -lt 1 ]]; then
    err "Usage: bash scripts/deploy.sh <path-to-html>"
    err ""
    err "Examples:"
    err "  bash scripts/deploy.sh ./res/demo/resume.html"
    err "  bash scripts/deploy.sh ./resume.html"
    exit 1
fi

INPUT="$1"

if [[ ! -f "$INPUT" ]]; then
    err "File not found: $INPUT"
    exit 1
fi

INPUT=$(cd "$(dirname "$INPUT")" && pwd)/$(basename "$INPUT")

echo ""
echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║       Deploy Resume to URL            ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"
echo ""

# ─── Step 1: Prepare deploy directory ─────────────────────

DEPLOY_DIR=$(mktemp -d)
cp "$INPUT" "$DEPLOY_DIR/index.html"
PARENT_DIR=$(dirname "$INPUT")

grep -oE '(src|href|url\()["'"'"']?[^"'"'"'>)]+' "$INPUT" 2>/dev/null | \
    sed "s/^src=//; s/^href=//; s/^url(//; s/[\"']//g" | \
    grep -v '^http' | grep -v '^data:' | grep -v '^#' | grep -v '^/' | \
    sort -u | while read -r ref; do
        SOURCE_FILE="$PARENT_DIR/$ref"
        if [[ -e "$SOURCE_FILE" ]]; then
            TARGET_DIR="$DEPLOY_DIR/$(dirname "$ref")"
            mkdir -p "$TARGET_DIR"
            cp -r "$SOURCE_FILE" "$TARGET_DIR/"
        fi
    done

CLEANUP_TEMP=true
info "Resume prepared for deployment"

# ─── Step 2: Check Vercel CLI ─────────────────────────────

info "Checking Vercel CLI..."

if ! command -v vercel &>/dev/null; then
    warn "Vercel CLI not found. Installing..."
    npm install -g vercel
fi
ok "Vercel CLI ready"

# ─── Step 3: Check login ──────────────────────────────────

info "Checking Vercel login status..."

if ! vercel whoami &>/dev/null 2>&1; then
    warn "Not logged in to Vercel. Starting login..."
    vercel login
fi

VERCEL_USER=$(vercel whoami 2>/dev/null || echo "unknown")
ok "Logged in as: $VERCEL_USER"

# ─── Step 4: Deploy ───────────────────────────────────────

info "Deploying to Vercel..."

cd "$DEPLOY_DIR"

DEPLOY_URL=$(vercel --yes --prod 2>&1 | tail -1)

ok "Deployed!"

echo ""
echo -e "${GREEN}${BOLD}Done!${NC} Your resume is live at:"
echo -e "${CYAN}${BOLD}$DEPLOY_URL${NC}"
echo ""
echo "Share this URL with anyone — it works on phones, tablets, and desktops."

# ─── Cleanup ──────────────────────────────────────────────

if [[ "$CLEANUP_TEMP" == "true" ]]; then
    rm -rf "$DEPLOY_DIR"
fi

#!/usr/bin/env bash
# export-pdf.sh — Export an HTML resume to PDF
#
# Usage:
#   bash scripts/export-pdf.sh <path-to-html> [output.pdf]
#
# Examples:
#   bash scripts/export-pdf.sh ./res/demo/resume.html
#   bash scripts/export-pdf.sh ./resume.html ./my-resume.pdf
#
# What this does:
#   1. Starts a local server to serve the HTML (fonts need HTTP)
#   2. Uses Playwright to render the page and export as PDF
#   3. Cleans up the server
#
# The PDF preserves colors, fonts, and layout — but not animations.
# Perfect for email attachments, printing, or sharing.
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
    err "Usage: bash scripts/export-pdf.sh <path-to-html> [output.pdf]"
    err ""
    err "Examples:"
    err "  bash scripts/export-pdf.sh ./res/demo/resume.html"
    err "  bash scripts/export-pdf.sh ./resume.html ./my-resume.pdf"
    exit 1
fi

INPUT_HTML="$1"
if [[ ! -f "$INPUT_HTML" ]]; then
    err "File not found: $INPUT_HTML"
    exit 1
fi

INPUT_HTML=$(cd "$(dirname "$INPUT_HTML")" && pwd)/$(basename "$INPUT_HTML")

if [[ $# -ge 2 ]]; then
    OUTPUT_PDF="$2"
else
    OUTPUT_PDF="$(dirname "$INPUT_HTML")/$(basename "$INPUT_HTML" .html).pdf"
fi

OUTPUT_DIR=$(dirname "$OUTPUT_PDF")
mkdir -p "$OUTPUT_DIR"
OUTPUT_PDF="$OUTPUT_DIR/$(basename "$OUTPUT_PDF")"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║       Export Resume to PDF            ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"
echo ""

# ─── Step 1: Check dependencies ───────────────────────────

info "Checking dependencies..."

if ! command -v npx &>/dev/null; then
    err "Node.js and npx are required. Install from https://nodejs.org"
    exit 1
fi
ok "npx found"

if ! npx playwright --version &>/dev/null 2>&1; then
    warn "Playwright not found. Installing locally..."
    npm init -y &>/dev/null
    npm install playwright
    npx playwright install chromium
fi
ok "Playwright ready"

# ─── Step 2: Start local server ───────────────────────────

info "Starting local server..."
SERVE_DIR=$(dirname "$INPUT_HTML")
PORT=$(python3 -c "import socket; s=socket.socket(); s.bind(('',0)); print(s.getsockname()[1]); s.close()")

python3 -m http.server "$PORT" --directory "$SERVE_DIR" &>/dev/null &
SERVER_PID=$!

cleanup() {
    kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 1

HTML_FILENAME=$(basename "$INPUT_HTML")
SERVER_URL="http://localhost:${PORT}/${HTML_FILENAME}"

if ! curl -sI "$SERVER_URL" | head -1 | grep -q "200"; then
    err "Failed to start server or serve file"
    exit 1
fi
ok "Server running at $SERVER_URL"

# ─── Step 3: Export to PDF ────────────────────────────────

info "Exporting to PDF..."

EXPORT_SCRIPT=$(cat <<'EOF'
const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(process.argv[1], { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.pdf({
        path: process.argv[2],
        format: 'A4',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });

    await browser.close();
})();
EOF
)

node -e "$EXPORT_SCRIPT" "$SERVER_URL" "$OUTPUT_PDF"

ok "PDF saved to: $OUTPUT_PDF"

FILE_SIZE=$(du -h "$OUTPUT_PDF" | cut -f1)
ok "File size: $FILE_SIZE"

echo ""
echo -e "${GREEN}${BOLD}Done!${NC} Your resume PDF is ready at: $OUTPUT_PDF"

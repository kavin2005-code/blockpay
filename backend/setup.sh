#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  BlockPay — Backend Setup Script
#  Run this from inside the BlockPay/backend/ folder
#  Usage:  bash setup.sh
# ─────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🖥️  BlockPay Backend Setup                 ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Check Node ──
echo -e "${YELLOW}[1/4] Checking Node.js...${NC}"
NODE_VER=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 18+ required.${NC}"; exit 1
fi
echo -e "     ✅ Node.js $(node -v)"

# ── Detect package manager ──
echo -e "${YELLOW}[2/4] Detecting package manager...${NC}"
if command -v pnpm &>/dev/null; then PKG="pnpm"
elif command -v yarn &>/dev/null; then PKG="yarn"
else PKG="npm"; fi
echo -e "     ✅ Using: $PKG"

# ── Install packages ──
echo -e "${YELLOW}[3/4] Installing dependencies...${NC}"
$PKG install
echo -e "     ✅ Done"

# ── Setup .env ──
echo -e "${YELLOW}[4/4] Setting up .env...${NC}"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "     ✅ Created .env — ${YELLOW}⚠️  Edit it and fill in required values!${NC}"
else
  echo -e "     ✅ .env already exists"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Backend ready!                          ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Required .env values to fill in:"
echo "    MONGODB_URI        → your MongoDB connection string"
echo "    CONTRACT_ADDRESS   → paste address from blockchain deploy"
echo "    BLOCKCHAIN_RPC_URL → http://127.0.0.1:8545 for local"
echo "    ADMIN_PRIVATE_KEY  → copy a key from 'npx hardhat node' output"
echo "    JWT_SECRET         → any random 32+ char string"
echo "    ENCRYPTION_SECRET  → any random 32+ char string"
echo ""
echo "  Then start the server:"
echo "    npm run dev    ← development (auto-restart)"
echo "    npm start      ← production"
echo ""
echo "  Test it's working:"
echo "    curl http://localhost:5000/health"
echo ""

#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  BlockPay — Blockchain Setup Script
#  Run this from inside the BlockPay/blockchain/ folder
#  Usage:  bash setup.sh
# ─────────────────────────────────────────────────────────────

set -e  # exit on any error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # no color

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🔗 BlockPay Blockchain Setup               ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Step 1: Check Node version ──
echo -e "${YELLOW}[1/5] Checking Node.js version...${NC}"
NODE_VER=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 18+ required. Download from https://nodejs.org${NC}"
  exit 1
fi
echo -e "     ✅ Node.js $(node -v) found"

# ── Step 2: Detect package manager ──
echo -e "${YELLOW}[2/5] Detecting package manager...${NC}"
if command -v pnpm &>/dev/null; then
  PKG="pnpm"
elif command -v yarn &>/dev/null; then
  PKG="yarn"
else
  PKG="npm"
fi
echo -e "     ✅ Using: $PKG"

# ── Step 3: Install dependencies ──
echo -e "${YELLOW}[3/5] Installing dependencies (this takes ~1 min)...${NC}"
$PKG install
echo -e "     ✅ Dependencies installed"

# ── Step 4: Create .env if missing ──
echo -e "${YELLOW}[4/5] Setting up environment...${NC}"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "     ✅ Created .env from .env.example"
  echo -e "     ${YELLOW}⚠️  For testnet deployment, fill in PRIVATE_KEY and RPC URLs in .env${NC}"
else
  echo -e "     ✅ .env already exists"
fi

# ── Step 5: Compile contract ──
echo -e "${YELLOW}[5/5] Compiling smart contracts...${NC}"
npx hardhat compile
echo -e "     ✅ Contracts compiled successfully"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Setup Complete!                         ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Next steps:"
echo ""
echo "  ① Run tests:"
echo "       npx hardhat test"
echo ""
echo "  ② Start local blockchain (keep this running):"
echo "       npx hardhat node"
echo ""
echo "  ③ Deploy to local blockchain (new terminal):"
echo "       npx hardhat run scripts/deploy.js --network localhost"
echo ""
echo "  ④ Deploy to Polygon Mumbai testnet:"
echo "       (fill PRIVATE_KEY + POLYGON_MUMBAI_RPC_URL in .env first)"
echo "       npx hardhat run scripts/deploy.js --network mumbai"
echo ""

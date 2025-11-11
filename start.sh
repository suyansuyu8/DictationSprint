#!/usr/bin/env bash
# start.sh — macOS/Linux one-click launcher for Dictation Sprint (Local-First)
# Usage: double-click (macOS: 可改名为 start.command 后双击) 或在终端运行: bash start.sh
set -Eeuo pipefail

# --- locate repo root and app dir ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_PATH="/app/"

# --- choose Python interpreter ---
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "❌ 未找到 Python 3，请先安装后重试。"
  exit 1
fi

# --- find free port starting at 8000 ---
BASE=8000
TRIES=20
PORT=""
for ((i=0;i<=TRIES;i++)); do
  cand=$((BASE+i))
  if command -v lsof >/dev/null 2>&1; then
    if ! lsof -i TCP:$cand -sTCP:LISTEN >/dev/null 2>&1; then PORT=$cand; break; fi
  else
    # fallback: probe via Python bind
    if "$PY" - <<PY >/dev/null 2>&1; then
import socket, sys
s = socket.socket()
try:
    s.bind(("127.0.0.1", {cand})); s.close(); sys.exit(0)
except OSError:
    sys.exit(1)
PY
    then PORT=$cand; break; fi
  fi
done
: "${PORT:=$BASE}"

URL="http://localhost:${PORT}${APP_PATH}"

# --- open default browser ---
open_browser() {
  if command -v open >/dev/null 2>&1; then
    (sleep 1; open "$1") >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then
    (sleep 1; xdg-open "$1") >/dev/null 2>&1 &
  elif command -v gio >/dev/null 2>&1; then
    (sleep 1; gio open "$1") >/dev/null 2>&1 &
  fi
}

# --- serve repo root so /app/ is available ---
cd "$SCRIPT_DIR"
echo "➜ 本地服务启动中：$URL"
echo "   目录：$SCRIPT_DIR"
echo "   按 Ctrl+C 结束服务。"

open_browser "$URL"
# Python 3.7+ 支持 --directory；为最大兼容性，这里直接 cd 到脚本目录
exec "$PY" -m http.server "$PORT" --bind 127.0.0.1

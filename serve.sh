#!/bin/bash
# FinTrack local dev server (port 8888 — Jenkins uses 8080)
cd "$(dirname "$0")"
echo ""
echo "  FinTrack → http://localhost:8888"
echo "  Login    → http://localhost:8888/pages/login.html"
echo "  (Do NOT use port 8080 — that is Jenkins on this machine)"
echo ""
python3 -m http.server 8888

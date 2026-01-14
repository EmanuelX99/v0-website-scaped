#!/bin/bash
#
# Live Log Watcher - Shows only relevant emoji logs
#

echo "============================================"
echo "🔴 LIVE LOG MONITOR"
echo "============================================"
echo "Watching: backend/server.log"
echo "Press CTRL+C to stop"
echo ""

cd "$(dirname "$0")"

tail -f server.log | grep --line-buffered -E "🚀|📄|⏳|✅|❌|🔍|💾|🏁|⚠️|🤖|📊|Step|Analysis|PageSpeed|Gemini|Supabase|ERROR|Starting AI"

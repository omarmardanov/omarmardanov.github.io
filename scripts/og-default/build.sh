#!/usr/bin/env bash
# Генерирует assets/images/og-default.png 1200×630 из template.html через Chrome headless.
# Запускать из корня репозитория или откуда угодно — пути абсолютные.
#
# Если меняешь текст/композицию — правь template.html, потом запускай этот скрипт.
# Шрифты подгружаются через Google Fonts (онлайн, нужен интернет).

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TEMPLATE="$REPO_ROOT/scripts/og-default/template.html"
OUTPUT="$REPO_ROOT/assets/images/og-default.png"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [[ ! -x "$CHROME" ]]; then
  echo "Google Chrome не найден в /Applications/Google Chrome.app. Установи или поправь путь в скрипте." >&2
  exit 1
fi

"$CHROME" \
  --headless --disable-gpu --hide-scrollbars \
  --window-size=1200,630 \
  --virtual-time-budget=15000 \
  --screenshot="$OUTPUT" \
  "file://$TEMPLATE" 2>/dev/null

echo "Generated: $OUTPUT"
sips -g pixelWidth -g pixelHeight "$OUTPUT" 2>/dev/null | tail -2

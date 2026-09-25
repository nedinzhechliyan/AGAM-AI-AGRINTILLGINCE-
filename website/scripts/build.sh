#!/usr/bin/env bash
# Assemble website/dist: HTML player + both volume trees from the monorepo root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/.." && pwd)"
DIST="$ROOT/dist"

echo "Building Sound Kit website → $DIST"

rm -rf "$DIST"
mkdir -p "$DIST"

cp "$ROOT/index.html" "$DIST/index.html"

for tier in full-volume-5db low-volume-20db; do
  if [[ ! -d "$REPO/$tier" ]]; then
    echo "error: missing audio tree $REPO/$tier" >&2
    exit 1
  fi
  cp -R "$REPO/$tier" "$DIST/$tier"
done

# Minimal 404 page for Workers static assets
cat > "$DIST/404.html" <<'HTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Not found · Sound Kit</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: system-ui, sans-serif;
        background: #0a0a0b;
        color: #f4f4f5;
      }
      a { color: #c4b5fd; }
      main { text-align: center; padding: 2rem; }
      p { color: #a1a1aa; }
    </style>
  </head>
  <body>
    <main>
      <h1>404</h1>
      <p>That path is not part of Sound Kit.</p>
      <p><a href="/">Back to the kit</a></p>
    </main>
  </body>
</html>
HTML

count="$(find "$DIST" -name '*.m4a' | wc -l | tr -d ' ')"
echo "Done: index.html + $count .m4a files"

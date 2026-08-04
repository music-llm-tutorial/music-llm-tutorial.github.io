#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Error: run the deployment from the main branch." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: commit or stash working-tree changes before deploying." >&2
  exit 1
fi

"$SCRIPT_DIR/build_book.sh"

echo "Publishing _build/html to the gh-pages branch..."
uv run ghp-import -n -p -f _build/html
echo "Deployment pushed. GitHub Pages may take a few minutes to update."

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

export UV_CACHE_DIR="${UV_CACHE_DIR:-$REPO_ROOT/.uv-cache}"
export UV_PYTHON_INSTALL_DIR="${UV_PYTHON_INSTALL_DIR:-$REPO_ROOT/.uv-python}"

echo "Installing locked dependencies..."
uv sync --locked
echo "Building the book..."
uv run jupyter book build --html --strict
echo "Patching BibTeX-style alpha citation labels..."
node "$REPO_ROOT/scripts/patch_alpha_citations.mjs"
echo "Build complete: $REPO_ROOT/_build/html"

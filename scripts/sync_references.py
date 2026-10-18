#!/usr/bin/env python3
"""Keep book/references.md in sync with the citations used across the book.

MyST renders a reference list at the end of every page from the works that
page cites, but it has no project-wide bibliography. book/references.md gets
one by citing every key inside a hidden block. This script adds any key cited
in book/ (as [@key], @key or {cite}`key`) that is not listed there yet. Keys
are never removed, so works listed by hand stay on the page.

Usage: python scripts/sync_references.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIB = ROOT / "book" / "references.bib"
PAGE = ROOT / "book" / "references.md"
BLOCK = re.compile(r"(:::\{div\}\n:class: hidden\n)\[(.*?)\]\n(:::)", re.S)


def bib_keys():
    return set(re.findall(r"^@\w+\{\s*([^,\s]+)\s*,", BIB.read_text(), re.M))


def page_text(path):
    if path.suffix == ".ipynb":
        cells = json.loads(path.read_text())["cells"]
        return "\n".join("".join(c["source"]) for c in cells if c["cell_type"] == "markdown")
    return path.read_text()


def cited_keys(known):
    found = set()
    for path in sorted((ROOT / "book").rglob("*")):
        if path.suffix not in {".md", ".ipynb"} or path == PAGE:
            continue
        text = page_text(path)
        found.update(re.findall(r"@([\w:.-]*\w)", text))
        for keys in re.findall(r"\{cite(?::\w+)?\}`([^`]+)`", text):
            found.update(k.strip() for k in keys.split(","))
    return found & known


def main():
    known = bib_keys()
    page = PAGE.read_text()
    match = BLOCK.search(page)
    listed = set(re.findall(r"@([\w:.-]*\w)", match.group(2)))
    missing = sorted(listed - known)
    if missing:
        raise SystemExit(f"Keys on the References page but not in {BIB.name}: {missing}")
    added = sorted(cited_keys(known) - listed)
    keys = sorted(listed | set(added), key=str.lower)
    block = match.group(1) + "[" + "; ".join("@" + k for k in keys) + "]\n" + match.group(3)
    PAGE.write_text(page[: match.start()] + block + page[match.end() :])
    print(f"{len(keys)} works listed; added {len(added)}: {', '.join(added) or 'none'}")


if __name__ == "__main__":
    main()

# Contributor guide

Put Markdown or Notebook pages under `book/`, then register them in `myst.yml`.
Use one branch and pull request per focused change so the five contributors can
review and merge independently.

## Before opening a pull request

```bash
uv sync
uv run jupyter book build --html --strict
```

For notebooks, restart the kernel, run all cells, check that outputs contain no
secrets or large embedded data, and save the notebook. Website builds render
saved outputs but do not re-run cells.

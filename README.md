# Music × LLM Tutorial

Collaborative Jupyter Book for the ISMIR tutorial **LLMs × Music: Scalable
Language Modeling Unlocks Music Applications**. Pages may be written in MyST
Markdown (`.md`) or Jupyter Notebook (`.ipynb`) format.

## Book structure

| Chapter | Topic | Presenter |
|---|---|---|
| 0 | Introduction | — |
| 1 | Overview of Large Language Models | Keunwoo Choi |
| 2 | LLMs for Music Understanding | Zachary Novack |
| 3 | LLMs for Listeners | Seungheon Doh |
| 4 | LLMs for Composers | Yewon Kim |
| 5 | LLMs for Educators | Huan Zhang |
| 6 | Conclusion | — |
| Appendix | Shared resources | — |

## One-time setup

Install [uv](https://docs.astral.sh/uv/), then run:

```bash
uv sync
```

The lockfile keeps all five contributors and CI on the same dependency versions.

## Write and preview

1. Create a branch for your chapter.
2. Add `.md` or `.ipynb` files in the matching directory under `book/`.
3. Add each new page to `project.toc` in `myst.yml`.
4. Preview the live-reloading site:

```bash
uv run jupyter book start
```

Open the local URL shown in the terminal (normally <http://localhost:3000>).
Before opening a pull request, run the same check as CI:

```bash
uv run jupyter book build --html --strict
```

The equivalent repository scripts are:

```bash
./scripts/build_book.sh
./scripts/deploy_book.sh  # publishes to gh-pages after a clean main-branch build
```

Notebook cells are not executed during the website build. Run the notebook
locally and save outputs that should appear on the website. Add chapter-specific
libraries with `uv add <package>` and commit both `pyproject.toml` and `uv.lock`.

See [the contributor guide](.github/CONTRIBUTING.md) for the pull-request
checklist. Supporting assets such as the header logo and proposal live in
`asset/`.

## Automation

- Pull requests and non-`main` branches run a strict book build.
- A push to `main` builds and deploys the site with GitHub Pages.
- Dependencies are installed from the committed `uv.lock` in both workflows.

The deploy script is a manual `gh-pages`-branch fallback. If Pages is configured
with **GitHub Actions** (the recommended setup), pushing to `main` is sufficient.

## Publishing

After this initial setup is pushed, a repository administrator must select
**Settings → Pages → Source → GitHub Actions** once. Merges to `main` will then
publish to <https://music-llm-tutorial.github.io/> automatically.

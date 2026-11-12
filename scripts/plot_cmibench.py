#!/usr/bin/env python3
"""Plot book/assets/annotation-cmibench.svg.

Best audio-text LLM against the supervised reference on CMI-Bench2
(Ma et al., "Can Audio LLMs Understand Music?", 2026, Table V). For each task
the LLM score is the best in the row, including the "Appendix Best" column of
earlier models; the model is named above its bar. A trailing * marks a
proprietary model scored on a sampled subset.

Usage: python scripts/plot_cmibench.py
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent.parent / "book" / "assets" / "annotation-cmibench.svg"

# Book figure theme (same hex values as the hand-drawn SVGs in book/assets).
LLM = "#ab7827"         # amber: generated / LLM
SUP = "#3f78b5"         # blue: supervised
INK = "#3d3a35"
MUTED = "#77726a"
GRID = "#e4e1db"

# (task, dataset · metric, best LLM, score, supervised score)
PANELS = [
    ("Captioning (open output)", [
        ("MusicCaps", "BLEU", "Music Flamingo", 31.56, 21.7),
        ("MusicCaps", "METEOR", "Music Flamingo", 23.84, 22.4),
        ("MusicCaps", "ROUGE", "Qwen3-Omni", 33.94, 30.8),
        ("MusicCaps", "BERTScore", "Audio Flamingo 3", 87.54, 87.8),
        ("SongDescriber", "METEOR", "Qwen2-Audio", 23.21, 16.7),
        ("SongDescriber", "BERTScore", "Qwen2-Audio", 87.44, 86.0),
    ]),
    ("Multi-label tagging (ROC-AUC)", [
        ("MagnaTagATune", "tags", "Audio Flamingo 3", 82.10, 92.0),
        ("MTG-Jamendo", "top-50", "Qwen3-Omni", 71.72, 84.3),
        ("MTG-Jamendo", "genre", "Music Flamingo", 70.95, 88.0),
        ("MTG-Jamendo", "mood", "AudSemThinker", 65.90, 78.6),
        ("MTG-Jamendo", "instrument", "AudSemThinker", 64.69, 78.8),
    ]),
    ("Clip-level classification", [
        ("GTZAN", "genre acc.", "Qwen3-Omni", 92.76, 83.9),
        ("NSynth", "instrument acc.", "Music Flamingo", 75.17, 78.2),
        ("GiantSteps", "key score", "Qwen3-Omni", 63.56, 74.3),
        ("VocalSet", "technique acc.", "Gemini 3.1 Pro*", 42.50, 76.9),
        ("NSynth", "pitch acc.", "Music Flamingo", 39.75, 89.2),
    ]),
    ("Sequential, time-aligned tasks", [
        ("GTZAN", "beat F", "Gemini 3.1 Pro*", 30.32, 88.3),
        ("Ballroom", "beat F", "Gemini 3.1 Pro*", 30.41, 96.8),
        ("GTZAN", "downbeat F", "Audio Flamingo 3", 11.89, 54.1),
        ("Ballroom", "downbeat F", "MOSS-Audio", 13.50, 94.1),
        ("MedleyDB", "melody acc.", "MOSS-Audio", 7.18, 72.3),
        ("Guzheng", "technique F1", "Gemini 3.5 Flash*", 3.46, 90.0),
        ("SongForm", "F@0.5s", "Gemini 3.1 Pro*", 33.83, 70.3),
        ("SongForm", "F@3s", "Gemini 3.1 Pro*", 69.63, 78.4),
    ]),
]

plt.rcParams.update({
    "font.family": ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
    "font.size": 9,
    "svg.fonttype": "none",
    "text.color": INK,
    "axes.edgecolor": GRID,
    "axes.labelcolor": MUTED,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
})

fig, axes = plt.subplots(2, 2, figsize=(11, 7.2), sharey=True)
W = 0.38
for ax, (title, rows) in zip(axes.flat, PANELS):
    for i, (dataset, metric, model, llm, sup) in enumerate(rows):
        ax.bar(i - W / 2, llm, W, color=LLM, zorder=3)
        ax.bar(i + W / 2, sup, W, color=SUP, zorder=3)
        ax.text(i - W / 2, llm + 1.5, f"{llm:.1f}", ha="center", va="bottom", fontsize=8, color=INK)
        ax.text(i + W / 2, sup + 1.5, f"{sup:.1f}", ha="center", va="bottom", fontsize=8, color=INK)
        ax.text(i - W / 2, llm + 9.5, model, ha="center", va="bottom", fontsize=6.5,
                color=LLM, rotation=90)
    ax.set_xticks(range(len(rows)))
    ax.set_xticklabels([f"{d}\n{m}" for d, m, *_ in rows], fontsize=7 if len(rows) > 6 else 7.5)
    ax.set_title(title, loc="left", fontsize=10.5, fontweight="bold", color=INK, pad=8)
    ax.set_ylim(0, 125)
    ax.set_yticks([0, 25, 50, 75, 100])
    ax.grid(axis="y", color=GRID, linewidth=0.8, zorder=0)
    ax.tick_params(length=0)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
for ax in axes[:, 0]:
    ax.set_ylabel("score on each task's own metric")

handles = [plt.Rectangle((0, 0), 1, 1, color=LLM), plt.Rectangle((0, 0), 1, 1, color=SUP)]
fig.legend(handles, ["best audio-text LLM (one checkpoint, instructed)", "supervised model (built for the task)"],
           loc="upper center", ncol=2, frameon=False, fontsize=9.5, bbox_to_anchor=(0.5, 1.0))
fig.tight_layout(rect=(0, 0, 1, 0.955), h_pad=2.2)
fig.savefig(OUT, facecolor="white")
fig.savefig(OUT.with_suffix(".png"), facecolor="white", dpi=80)
print("wrote", OUT)

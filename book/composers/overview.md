---
title: Overview
subtitle: Chapter 4 | LLMs for Creators
short_title: Overview
authors:
  - name: Yewon Kim
---

(creators-overview)=

The creative process is rarely a straight line. A songwriter hums a phrase on the way home, sketches a chord progression at the piano, abandons it, comes back a week later with a new idea from a film they watched, and finally finishes the track in a DAW. Much of this time is not spent executing a plan but **getting unstuck**: finding the next idea, trying a variation, or turning a rough sketch into something that sounds right.

:::{figure} ../assets/composers/overview/creative-process.png
:label: fig-creative-process
:alt: Illustration of a non-linear creative process: a musician moves between playing guitar, working at a computer, talking with friends, getting stuck, a eureka moment, mixing, and finishing a song.
:width: 80%

The creative process is non-linear, and mostly about getting unstuck.
:::

This chapter asks a simple question: **what can LLMs do to assist creators without replacing their creativity?** Instead of generating a finished song from a prompt, the systems in this chapter offer *AI support within an ongoing creative process*. They meet creators at the moments they actually get stuck, which often sound like the questions in [](#fig-creator-questions).

:::{figure} ../assets/composers/overview/questions-from-creators.png
:label: fig-creator-questions
:alt: Four questions creators ask, arranged around the label "AI support within an ongoing creative process": "I have a feeling in mind, but no chords yet", "I like this phrase, what could come next?", "Can you help me make this change?", and "Can you play something that responds to me?"
:width: 75%

Questions that creators ask in the middle of their work. Each one asks the AI to support a process the creator is already leading.
:::

## Three ways creators work with LLMs

We organize the chapter around three ways music creators can work with LLMs and other language-model-style generative systems. They differ in *what the creator gives the model*, *what comes back*, and *how fast the exchange has to happen*.

:::{figure} ../assets/composers/overview/three-ways.png
:label: fig-three-ways
:alt: Three illustrations numbered 1 to 3: a composer writing a score (music making through suggestions), a band playing live (real-time music co-creation), and a computer screen showing code (agentic music making).
:width: 90%

Three ways to support music creators.
:::

:::{table} The three parts of this chapter.
:label: tbl-three-ways

| Part | The creator… | The model returns… | Pace |
| --- | --- | --- | --- |
| [**1 · Music making through suggestions**](part1-suggestions.md) | asks for ideas, or hands over material to rework: a mood, an image, a phrase, a tapped rhythm, a recording | editable options (chords, MIDI, audio, or building blocks such as drum hits and code) to keep, edit, or discard | Turn by turn, between edits |
| [**2 · Real-time music co-creation**](part2-realtime.md) | plays or sings | a musical response (chords, notes, or audio) that sounds while the creator keeps playing | Continuous, within ~100 ms |
| [**3 · Agentic music making**](part3-agentic.md) | describes a goal in words | a sequence of actions inside the creator's own tools (a Pure Data patch, an Ableton Live session, an effects chain), with its reasoning | Multi-step: the agent plans, acts, and checks |
:::

**[Part 1](part1-suggestions.md)** covers the most common pattern today: the creator asks, and the model *suggests*. We look at three families of suggestion systems: generating compositional ideas in symbolic form (Amuse, MIDI-LLM), generating audio under time-varying controls such as a tapped rhythm (TRIA), and recovering editable structure from existing material (D-Composer, Decomposer).

**[Part 2](part2-realtime.md)** removes the pause between turns. When a musician improvises, the model has to respond *while* the music is happening, under a latency budget of roughly a tenth of a second. We explain how real-time systems work (frame-based processing), why this is hard for large generative models, and how symbolic systems (ReaLchords, ReaLJam, jam_bot) and audio systems (Magenta RT, Live Music Diffusion Models, streaming accompaniment) meet the budget.

**[Part 3](part3-agentic.md)** moves from suggestions to *actions*. LLM agents can now operate the software musicians already use, such as Pure Data and Ableton Live, through a standard protocol (MCP). We close the part with music post-production, where agents inspect tracks, plan an effects chain, apply it, and critique the result (LLM2Fx-Tools, agentic mixing, RIME).

**[Looking ahead](looking-ahead.md)** brings the three parts together and lists open questions for building AI for *human* creativity.

## A common thread: keeping the creator at the center

The three parts use very different technology, but they are evaluated against the same question: does the system leave the creator in charge? In [Part 1](#what-matters-to-creators) we introduce four dimensions of human creativity that recur throughout the chapter.

::::{grid} 1 2 2 4

:::{card} Agency
*Am I driving the creative direction?*
:::

:::{card} Control
*Can I make the changes I want?*
:::

:::{card} Exploration
*Can I try out different ideas and discover new possibilities?*
:::

:::{card} Ownership
*Do I feel that this work is truly mine?*
:::

::::

:::{note} About the systems in this chapter
Each part presents a few representative systems in depth, with a shared "recipe" that generalizes beyond them. They are not an exhaustive survey. More system overviews are collected on the tutorial website.
:::

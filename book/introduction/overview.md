---
title: Overview of Tutorial
authors:
  - name: Seungheon Doh
---

The tutorial is organized around one practical question: which LLM
capabilities matter for music, and how can we deliberately use them?

## Structure

:::{figure} ../assets/overview.svg
:label: fig-overview
:alt: Structure of the tutorial. Part I, Foundations: Chapter 1, LLMs and LLM agents, and Chapter 2, LLMs for music understanding. Both lead to Part II, Applications: Chapter 3, LLMs for music listening, for listeners; Chapter 4, LLMs for music creation, for producers; Chapter 5, LLMs for music education, for students. All three lead to the conclusion.

Two foundation chapters lead into three applications, one for each kind of music user.
:::

### Part I · Foundations

- 1 · [Overview of Large Language Models and Agents](../llm/foundations.md) (30 min) — autoregressive modeling, pre-, mid-, and post-training, advanced capabilities, and evaluation
- 2 · [LLM-powered Music Understanding](../understanding/overview.md) (30 min) — music perception and reasoning, large music-language models across audio, score images, symbolic notation, and metadata, and benchmarks

### Part II · Applications

- 3 · [Music Listening](../applications/listeners.md) — music annotation and description, conversational retrieval and recommendation
- 4 · [Composition & Co-Creation](../applications/producers.md) — human-AI collaborative songwriting, composition support tools, and conversational post-production
- 5 · [Feedback & Music Education](../applications/performers.md) — multimodal understanding of performances, assessment and coaching, and interactive music education

### Wrap-up

- [Conclusion](../conclusion.md) — recap, future research directions, Q&A and discussion
- [References](../references.md) — every work cited in the tutorial, with further reading

## Learning goals

By the end of the tutorial, participants should be able to:

1. connect autoregressive modeling and post-training to modern LLM behavior;
2. compare architectures for audio, score-image, symbolic, and text inputs;
3. select capabilities such as instruction following, reasoning, or tool use for a musical task;
4. identify suitable benchmarks and test whether a system's answer depends on the music rather than on text alone.

## How to use this book

Each chapter has a web page, slides, and reproducible code on
[GitHub](https://github.com/music-llm-tutorial/music-llm-tutorial.github.io).
Chapters in Part II can be read in any order once Part I is familiar. Every
page lists the works it cites at its end, and [References](../references.md)
collects them all.

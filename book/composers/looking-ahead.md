---
title: "Looking Ahead: AI for Human Creativity"
subtitle: Chapter 4 | LLMs for Creators
short_title: Looking Ahead
authors:
  - name: Yewon Kim
---

(creators-looking-ahead)=

This chapter started from a question: **what can LLMs do to assist creators without replacing creativity?** We looked at three answers, each suited to a different moment in the creative process.

:::{figure} ../assets/composers/overview/three-ways.png
:label: fig-three-ways-recap
:alt: Three illustrations numbered 1 to 3: a composer writing a score, a band playing live, and a computer screen showing code.
:width: 80%

Three ways to support music creators.
:::

:::{table} What each part contributes, and how it keeps the creator at the center.
:label: tbl-recap

| Part | Core idea | How the creator stays in charge |
| --- | --- | --- |
| [**1 · Suggestions**](part1-suggestions.md) | Generate compositional ideas, controllable audio, and editable building blocks | Output is steerable (keywords, attributes, gestures) and editable (chords, MIDI, drum hits, code) |
| [**2 · Real-time co-creation**](part2-realtime.md) | Respond to a musician while they play, within the latency budget | The musician leads the performance; systems anticipate and share their plans (ReaLJam) or adapt to the player's style (jam_bot) |
| [**3 · Agentic music making**](part3-agentic.md) | Agents that plan and act in musicians' own tools | Actions land in patches, sessions, and effects chains that the creator can inspect, edit, and undo |
:::

## The same principles, at every pace

The four dimensions of human creativity and the four design principles from [Part 1](part1-suggestions.md) apply well beyond suggestion systems.

::::{grid} 1 1 2 2

:::{card} Protect…
- **Agency.** Am I driving the creative direction?
- **Control.** Can I make the changes I want?
- **Exploration.** Can I try out different ideas and discover new possibilities?
- **Ownership.** Do I feel that this work is truly mine?
:::

:::{card} …by making AI output
- **Steerable.** Easy to guide and redirect.
- **Modular & editable.** Adaptable musical building blocks.
- **Diverse.** Distinct creative possibilities.
- **Contextual.** Connected to work in progress.
:::

::::

In real-time systems, being *steerable* and *contextual* has to happen within a fraction of a second, which is why anticipation and plan sharing matter so much. In agentic systems, being *modular and editable* means acting through tools whose every step the creator can inspect, rather than returning a finished file.

## Open questions

1. **How do we build interactive systems that support iterative human–AI co-creation?** Most models are still trained and evaluated one generation at a time, while creators work in long loops of trying, listening, and revising.
2. **What new forms of musical experience could AI make possible?** A partner that responds faster than any human, a mirror of one's own style, or an instrument whose sound is generated live are not just faster versions of existing practice.
3. **Ultimately, how can AI expand the ways people create and interact with music while keeping *human creativity* at the center?**

---
title: Overview
subtitle: Chapter 4 | LLMs for Creators
short_title: Overview
authors:
  - name: Yewon Kim
---

(creators-overview)=

The creative process is rarely a straight line. For example, you could start with a few chords on a guitar which become a rough recording, but after hours at the computer, the song still doesn’t feel right. Some ideas get thrown out and others sit unfinished until a conversation with a friend gives them a new direction. Then it’s back to the guitar, or back to the mix, to try again. Much of making music happens in this back and forth: listening for what’s missing, rethinking a choice, and finding a way to move forward when you’re stuck.

:::{figure} ../assets/composers/overview/creative-process.png
:label: fig-creative-process
:alt: Illustration of a non-linear creative process: a musician moves between playing guitar, working at a computer, talking with friends, getting stuck, a eureka moment, mixing, and finishing a song.
:width: 80%

The creative process is non-linear, and mostly about getting unstuck.
:::

This chapter asks a simple question: **what can LLMs do to assist creators without replacing their creativity?** Instead of generating a finished song from a prompt, the systems in this chapter offer *AI support within an ongoing creative process*. 


## Three ways of working together

We follow three kinds of interaction: asking for suggestions, playing together in real time, and delegating tasks in music software. The chapter covers both LLMs and related generative systems, including models that work directly with musical events or audio.

:::{figure} ../assets/composers/overview/three-ways.png
:label: fig-three-ways
:alt: Three illustrations numbered 1 to 3: a composer writing a score (music making through suggestions), a band playing live (real-time music co-creation), and a computer screen showing code (agentic music making).
:width: 90%

Three ways to support music creators.
:::

:::{table} Three kinds of interaction explored in this chapter.
:label: tbl-three-ways

| Part | What the creator does | What the system contributes |
| --- | --- | --- |
| [1 · Music making through suggestions](part1-suggestions.md) | Shares an idea, a prompt, or material to develop | Suggestions to listen to, edit, and build on |
| [2 · Real-time music co-creation](part2-realtime.md) | Plays instruments or sings | A musical response while the performance continues |
| [3 · Agentic music making](part3-agentic.md) | Describes a task or a desired change | Actions carried out in music software |
:::

**[Part 1](part1-suggestions.md)** covers systems that suggest musical material for creators to use or edit. The suggestions might be notes and chords, as in Amuse and MIDI-LLM, or audio guided by a rhythm or other time-varying input, as in TRIA. We also look at D-Composer and Decomposer, which recover editable structure from existing material. We examine what creators can provide as input, what each system produces, and how the results can be used in further work.

**[Part 2](part2-realtime.md)** covers systems that respond while a musician plays or sings. These systems must process incoming music and generate a response quickly enough to keep up with the performance. We explain frame-based processing and the challenges of generating music with low latency. Examples include symbolic systems such as ReaLchords, ReaLJam, and jam_bot, and audio systems such as Magenta RT, Live Music Diffusion Models, and streaming accompaniment.

**[Part 3](part3-agentic.md)** covers LLM agents that carry out tasks in music software. We look at how agents use the Model Context Protocol (MCP) to interact with tools such as Pure Data and Ableton Live. We then examine music post-production through LLM2Fx-Tools, agentic mixing, and RIME, focusing on how agents inspect tracks, choose and apply effects, and evaluate the results.

**[Looking ahead](looking-ahead.md)** brings the three parts together and lists open questions for building AI for *human* creativity.

---
title: "Part 3: Real-time Co-performance"
subtitle: Chapter 4 | Applications for Creators
authors:
  - name: Yewon Kim
---

**TODO**: add a gif image demonstrating the real-time co-performance

In Parts 1 and 2, the creator could wait for the model's output, read it, and decide what to keep. In a live performance, such as a jam session or an improvised duet, there is no time to wait. The model plays *alongside* the creator, and it has to **commit to its next note while the human is still playing theirs**.

**TODO**: figure illustrating the offline vs. online generation

## What changes when it becomes real time

Playing live with a partner puts three demands on a system ([](#tbl-part3-requirements)).
 
1. **Act without hearing what comes next.** A human accompanist listens and predicts where the music is going. A model trained only to continue a fixed sequence has never had to do this, so it needs training that prepares it for a partner it cannot fully see.
2. **Respond within a fixed time budget.** The music does not pause while the model computes. Every step, from listening to inference to playback, has to fit inside the musical clock.
3. **Stay legible and steerable for the musician.** Musicians judge a partner by how responsive and predictable it is, not only by how it sounds. They need to know what the system is about to do and be able to direct it while playing.


:::{table} Three demands of live co-performance and how systems meet them.
:label: tbl-part3-requirements
 
| Demand | Approach | Example systems |
|---|---|---|
| Act without hearing what comes next | Train the model to anticipate and adapt to its partner | SongDriver, ReaLchords |
| Respond within a fixed time budget | Engineer the system: streaming inference, scheduling ahead on a shared clock | jam_bot, StreamMUSE |
| Stay legible and steerable | Show the model's plan, give it clear musical roles, accept live controls | ReaLJam, jam_bot, Live Music Models |
:::

The sections below introduce systems for each demand. The full list is in [](#tbl-part3-systems).

## Anticipating the partner
 
The core training problem is that the model must choose its output before hearing the input it has to fit.

SongDriver addressed this for accompaniment in two phases. A Transformer *arranges* chords for the incoming melody and caches them, and a conditional random field *predicts* playable accompaniment for the upcoming melody from those cached chords, so no logical latency is added.

ReaLchords applies the preference and reinforcement-learning alignment methods from earlier in the tutorial to this problem. An online chord model is first pretrained with maximum likelihood, then fine-tuned with RL using reward models for melody–chord harmony and coherence over time. It also learns from an offline *teacher* model that can see the future melody. The result adapts to the user and recovers from mistakes, which maximum-likelihood training alone does not achieve.

## Meeting the time budget
It has to be embedded in a system that listens, builds the right context, runs inference and schedules output on a shared clock.

The **jam_bot** was built to improvise on stage with a GRAMMY-winning keyboardist. Its authors optimized symbolic music language models for real-time use and embedded them in a low-latency, multi-threaded system that listens, prompts the models and schedules their output.

**StreamMUSE** frames this as *frame-synchronous streaming inference*, with a client that sends frequent requests and a server that runs the model. It models how system settings affect round-trip latency and reports that real-time performance tracks music quality.

## Staying legible and steerable

A live partner also has to be understandable and directable while the music is playing.

**ReaLJam** builds a jamming interface around RL-tuned models. The agent continually *anticipates* how the performance will unfold and **shows its planned chords** to the musician, which helps hide latency and makes the AI easier to predict. In a user study, experienced musicians found the sessions enjoyable and musically interesting.
The **jam_bot** gives the model clear **musical roles**, such as leading, accompanying or call and response, by changing its context and conditioning, and it is fine-tuned to the style of each piece.

**Live Music Models** take a different approach in audio. Magenta RealTime (open weights) and Lyria RealTime generate a continuous stream of music that the creator steers with text and audio prompts as it plays. Here the model is less an accompanist than an *instrument* that the creator plays by steering its style.

## Systems table
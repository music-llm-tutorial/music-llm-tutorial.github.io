---
title: Overview
subtitle: Chapter 4 | Applications for Creators
authors:
  - name: Yewon Kim
---

The previous section showed how LLMs serve listeners. This section turns to the people who make music: songwriters, lyricists, producers and performers. Co-creation ...
**TODO**: provide some examples (short relatable scenarios)

## Four ways creators work with LLMs

**TODO:** add figure.
*Figure 4.1 — The four modes differ in what the creator does, what the model gives back, and how fast they exchange.*

| Part | The creator… | The model returns… | Pace |
|---|---|---|---|
| [1 · Prompt → artifact](01_prompt_to_artifact.md) | describes what they want | a finished piece | once |
| [2 · Turn-based co-creation](02_turn_based_cocreation.md) | shapes material turn by turn | partial, editable material | turns of seconds to minutes |
| [3 · Real-time co-performance](03_realtime_performance.md) | plays live | music, as it is being played | milliseconds |
| [4 · Agentic music making](04_agentic_musicmaking.md) | delegates a task | a result produced by the tools it chose and called | one request, many internal steps |

In Parts 1–3, 
the model **generates music directly**, 
and the exchange with the creator gets tighter: 
once, then turn by turn, then continuously. 
Part 4 changes how the model works: 
the LLM **acts through tools**. 
As in the agentic section earlier in the tutorial, it decides which tools to call (e.g., other music models, software), 
observes the results, and continues. 
[Part 5](05_wrapup.md) closes with the questions these systems share and the problems they leave open.
**TODO:** double check the "as in the agentic section" part

**Scope.** 
This tutorial focuses on scalable language modeling across textual, symbolic, and audio-token representations, including natural language, ABC notation, MIDI events, audio codec tokens, and code or serialized tool calls. It covers both language models that directly generate music (e.g., MusicGen and YuE) and LLM-based systems that support music creation through code generation or tool use. Diffusion-based music generation methods themselves are outside the scope, although they may appear as tools within LLM-based systems.

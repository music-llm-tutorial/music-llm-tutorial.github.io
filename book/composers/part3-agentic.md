---
title: "Part 3: Agentic Music Making"
subtitle: Chapter 4 | LLMs for Creators
short_title: "Part 3 · Agentic"
authors:
  - name: Yewon Kim
---

(part3-agentic)=

:::{image} ../assets/composers/overview/icon-part3-agentic.png
:alt: Illustration of a computer monitor showing lines of code.
:width: 190px
:align: center
:::

The systems in Parts [1](part1-suggestions.md) and [2](part2-realtime.md) *generate music*. A large part of music making, however, is *operating tools*: building a synth patch, arranging clips in a DAW, choosing and tuning audio effects. This part looks at LLM **agents** that take actions in the software musicians already use, and at music post-production as a first domain where such agents are being studied systematically.

## Agents + music tools

An LLM agent works in a loop. Given a goal, it **plans the next step**, **calls a tool**, **reads the result**, and repeats until the goal is met ([](#fig-creators-agent-loop)). What makes an agent useful for music is the set of tools it can call.

::::{grid} 1 1 2 2

:::{figure} ../assets/composers/part3/agent-loop.png
:label: fig-creators-agent-loop
:alt: The agent loop: Goal leads to Plan the next step, then Call a tool, then Read the result, which feeds back to the goal. "Call a tool" is highlighted.

The agent loop. Calling a tool is where the agent touches the musician's software.
:::

:::{figure} ../assets/composers/part3/mcp-hub.png
:label: fig-mcp-hub
:alt: MCP as one standard plug between agents and apps: an agent (e.g., Claude) connects through MCP to Pure Data, Ableton Live, MuseScore, and REAPER.

MCP (Model Context Protocol): one standard plug between agents and apps.
:::

::::

The **Model Context Protocol (MCP)** is an open standard for connecting agents to applications. An app exposes its capabilities once, as an MCP server, and any MCP-capable agent can use them. For music, this means the same agent (e.g., Claude) can work with a visual audio programming environment such as Pure Data, a DAW such as Ableton Live or REAPER, or a notation editor such as MuseScore.

## Agents are learning to use the tools musicians already use

Two open-source projects illustrate the idea. In both, the musician stays in their usual environment and can see, play, and edit everything the agent creates.

### Pure Vibes: Pure Data ↔ MCP ↔ AI agent

[Pure Vibes](https://github.com/gclef-cmu/pure-vibes) connects **Pure Data**, a visual programming language for audio, to AI agents through MCP. The musician describes the sound or behavior they want in words, and the agent builds and edits the patch, with the result immediately audible and inspectable in Pure Data.

:::{figure} ../assets/composers/part3/pure-vibes.jpg
:label: fig-pure-vibes
:alt: Screen recording of Pure Vibes: a Claude chat window next to a Pure Data window showing that an MCP server has started.
:width: 85%

Pure Vibes: an agent working in Pure Data through MCP. ▶ [Watch the demo video](https://drive.google.com/file/d/1U0t1jxJtrdrqDziJJbOa4Ir9BkEjjYT8/view).
:::

### Ableton MCP: Ableton Live ↔ MCP ↔ AI agent

[ableton-mcp](https://github.com/ahujasid/ableton-mcp) connects **Ableton Live** to Claude through MCP, with two-way communication: the agent can read the session and create or modify MIDI and audio tracks, clips, instruments, and effects. Users have shared their experiences of producing music this way, for example in this [Reddit post](https://www.reddit.com/r/ClaudeAI/comments/1q00ll4/ok_i_have_a_job_for_you_you_have_an_ableton_mcp/).

:::{figure} ../assets/composers/part3/ableton-mcp.jpg
:label: fig-ableton-mcp
:alt: Screen recording of a chat with an agent describing a planned electronic track structure next to an Ableton Live arrangement with colored clips across tracks.
:width: 85%

Ableton MCP: the agent plans a track and builds it in Ableton Live. ▶ [Watch the demo video](https://drive.google.com/file/d/1XZV92dmAtIQs_Rcso1uU-9wbt9rQp36E/view).
:::

:::{tip} Why acting in the creator's tools matters
When an agent's output is a patch, a session, or an effects chain rather than a rendered audio file, every decision it made is still **editable**. The creator can undo a step, tweak a parameter, or take over entirely. This keeps the principles from [Part 1](part1-suggestions.md) (control and ownership in particular) intact even when the agent does many steps at once.
:::

---

## Music post-production with agents

Post-production (applying equalization, compression, reverb, delay, and other effects, and balancing tracks in a mix) is a natural fit for agents. It is done with well-defined tools, it involves long sequences of decisions, and the result can be listened to and checked. Recent work frames post-production as an agent loop with four steps [@doh2026llm2fxtools; @koo2026agenticpostproduction; @schaffer2026rime]:

:::{figure} ../assets/composers/part3/post-production-loop.png
:label: fig-post-production-loop
:alt: Post-production loop: Inspect (analyze the tracks, tools, and the request), Plan (pick effects and their order), Act (call effects with parameters), Critique (compare to the original goal and fix if needed), with a repeat arrow from Critique back to Plan.
:width: 100%

An agent loop for music post-production.
:::

1. **Inspect:** analyze the tracks, the available tools, and the request.
2. **Plan:** pick effects and their order.
3. **Act:** call the effects with parameters.
4. **Critique:** compare the result to the original goal, and fix it if needed. Then repeat.

### LLM2Fx-Tools: effects chains as tool calls

**LLM2Fx-Tools** uses an LLM to generate an executable chain of audio effects (an *Fx-chain*): which effects to use, in what order, and with what parameters [@doh2026llm2fxtools].

:::{figure} ../assets/composers/part3/llm2fx-tools.png
:label: fig-llm2fx-tools
:alt: LLM2Fx-Tools framework: the input contains an instruction, a list of available tools (EQ, distortion, gain, compressor, reverb, delay, limiter, ...), reference audio, and pseudo-dry audio produced by Fx-Removal and Fx-Norm; the LLM outputs a chain-of-thought, tool calls with parameters, and a response; the generated Fx-chain (e.g., pan, delay, EQ, limiter) is then applied to new input audio.
:width: 100%

The LLM2Fx-Tools framework. Figure from Doh et al. (2026).
:::

Reading the figure from left to right, all three steps happen at inference time:

1. **Input.** An instruction (e.g., "Please provide an audio effect similar to the reference audio, which features piano sounds."), the list of available tools (EQ, distortion, gain, compressor, reverb, delay, limiter, …), a **reference** audio clip with the desired sound, and a **dry** version of that clip without effects. When no dry version exists, a *pseudo-dry* version is produced automatically by removing effects from the reference (Fx-Removal) and normalizing it (Fx-Norm).
2. **Output.** The LLM first writes a **chain-of-thought** (identify the category and order of the effects, then plan), then a sequence of **tool calls** with parameters (e.g., `pan`, then `delay` with its delay time, feedback, and mix), and finally a natural-language **response** explaining the chain.
3. **Apply to a user's track.** Because the output is an executable Fx-chain rather than audio, the same chain can be run on the creator's *own* track, transferring the style of the reference to new material.

To train the model, the authors built LP-Fx, an instruction-following dataset of about 101K conversational examples with chain-of-thought annotations and tool calls [@doh2026llm2fxtools].

In terms of the loop, LLM2Fx-Tools covers **Inspect** (reasoning about the reference audio), **Plan** (choosing the chain and its order), and **Act** (tool calls). The output is interpretable and editable: a producer can read why an effect was chosen and adjust its parameters.

### Beyond a single effects chain

Two recent systems extend the loop to full mixes and to the **Critique** step.

- **Agentic Music Post-Production** (MixAgent) splits the work across agents: a grouping agent organizes the tracks of a session, a planning agent decides the processing, and a **critic** model, trained on MixCritic (a dataset of 45,657 critiques), evaluates the result and feeds corrections back into the loop. The authors report a 19% reduction in errors [@koo2026agenticpostproduction].
- **RIME** (Rule-based Instructions for Music Editing) formalizes *agentic post-production* as an iterative task: starting from a mixed track and a production intent, an agent targets individual elements, refines them, and recombines them into a finished mix. RIME generates realistic paired edit-instruction data from existing music datasets, grounded in patterns from real production workflows, and comes with POEMS, a toolkit of studio operators (stem separation, mixing, common effects) exposed through MCP for tool-calling agents. Evaluating current multimodal LLMs as agents on this data shows that post-production remains challenging for them [@schaffer2026rime].

:::{important} Takeaways
- Agents shift the creator's role from *making every edit* to *stating goals and reviewing steps*. Working through standard protocols such as MCP lets them act inside tools musicians already know.
- Post-production is an early testbed because effects are well-defined tools and results can be listened to and checked. The **Critique** step, judging whether audio actually matches a goal, remains the hardest part.
- Because agents act through editable tools, their work can stay transparent and reversible. Interfaces that let creators inspect, approve, and undo agent actions will matter as much as model quality.
:::

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

So far, we have looked at systems that suggest musical material or respond during a performance. Making music also involves working with software: building a synth patch, arranging clips, or adjusting effects. In this part, we turn to LLM agents that carry out these tasks in music tools. We begin with examples in Pure Data and Ableton Live, then look at research on agents for post-production.

## Connecting agents to music tools

An LLM agent can work through a task in several steps. It chooses an action, calls a tool, reads the result, and decides what to do next (). The tools available to it determine what it can inspect and change. In a music application, those tools might expose tracks, notes, patches, or effect parameters.

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

The Model Context Protocol (MCP) provides a standard way to expose tools and data to compatible AI applications. An MCP server describes the available operations and handles requests to use them. For music software, an integration can let an agent inspect a session or make changes without requiring the musician to leave the application. What the agent can do depends on the operations that each integration exposes.

## Working inside music software

Two open-source projects illustrate this approach. Both let musicians describe a task in words and inspect the resulting work in their usual editing environment.

### Pure Vibes: building patches in Pure Data

[Pure Vibes](https://github.com/gclef-cmu/pure-vibes) connects Pure Data, a visual programming environment for audio, to AI agents through MCP. A musician describes a sound or behaviour, and the agent builds or edits the patch. The musician can then inspect its structure, listen to it, and continue editing in Pure Data.

:::{figure} ../assets/composers/part3/pure-vibes.png
:label: fig-pure-vibes
:alt: Screen recording of Pure Vibes: a Claude chat window next to a Pure Data window showing that an MCP server has started.
:width: 85%

Pure Vibes: an agent working in Pure Data through MCP. Image from the [Pure Vibes repository](https://github.com/gclef-cmu/pure-vibes).
:::

### Ableton MCP: working with a DAW session

[ableton-mcp](https://github.com/ahujasid/ableton-mcp) connects Ableton Live to Claude through MCP. The agent can inspect the session and use the exposed tools to make changes, such as creating MIDI clips and working with instruments. The resulting session remains available for the musician to play and edit. This [Reddit post](https://www.reddit.com/r/ClaudeAI/comments/1q00ll4/ok_i_have_a_job_for_you_you_have_an_ableton_mcp/) offers an example of using the integration in music production.

:::{figure} ../assets/composers/part3/ableton-mcp.jpg
:label: fig-ableton-mcp
:alt: Screen recording of a chat with an agent describing a planned electronic track structure next to an Ableton Live arrangement with colored clips across tracks.
:width: 85%

Ableton MCP: the agent plans a track and builds it in Ableton Live. Image from a [Reddit post](https://www.reddit.com/r/ClaudeAI/comments/1q00ll4/ok_i_have_a_job_for_you_you_have_an_ableton_mcp/) using [ableton-mcp](https://github.com/ahujasid/ableton-mcp).
:::

---

## Music post-production with agents

Post-production involves many linked decisions: balancing tracks, choosing effects, and adjusting parameters such as EQ, compression, or reverb. These operations can be exposed as tools, making them useful tasks for studying agents. The harder question is how the agent judges whether its changes achieve the intended sound.

Recent work explores different parts of this process [@doh2026llm2fxtools; @koo2026agenticpostproduction; @schaffer2026rime]. We use the following loop to organise the discussion:

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

### LLM2Fx-Tools: generating an effects chain

LLM2Fx-Tools uses an LLM to specify an executable audio effects chain: which effects to apply, in what order, and with what parameters [@doh2026llm2fxtools]. The chain can then be applied to the creator’s audio.

:::{figure} ../assets/composers/part3/llm2fx-tools.png
:label: fig-llm2fx-tools
:alt: LLM2Fx-Tools framework: the input contains an instruction, a list of available tools (EQ, distortion, gain, compressor, reverb, delay, limiter, ...), reference audio, and pseudo-dry audio produced by Fx-Removal and Fx-Norm; the LLM outputs a chain-of-thought, tool calls with parameters, and a response; the generated Fx-chain (e.g., pan, delay, EQ, limiter) is then applied to new input audio.
:width: 100%

The LLM2Fx-Tools framework. Figure from Doh et al. (2026).
:::

The figure shows three steps at inference time:

1. **Prepare the inputs.** The model receives an instruction, a list of available effects, reference audio with the desired sound, and a dry version without effects. If a dry version is unavailable, Fx-Removal and Fx-Norm estimate a pseudo-dry version from the reference.
2. **Generate the chain.** The model produces a written rationale, a sequence of tool calls with parameters, and an explanation of the proposed processing. A chain might include panning, delay, EQ, and limiting.
3. **Apply to a user's track.** The effects chain can be run on the musician’s own track to approximate the processing heard in the reference.

The authors train the model using LP-Fx, an instruction-following dataset of about 101K conversational examples with reasoning annotations and tool calls [@doh2026llm2fxtools].

In the loop above, LLM2Fx-Tools mainly addresses inspection, planning, and action. Its output gives the producer a concrete chain to examine and adjust. The explanation can help them understand the proposed choices, though the processed audio still needs to be evaluated by listening.

### Extending the workflow to critique and revision

A proposed effects chain is a starting point. Processing one track can change how it sits against the others, and an instruction such as “make the vocals clearer” leaves room for several interpretations. Two recent projects examine broader workflows that include evaluating and revising a mix.

Agentic Music Post-Production (MixAgent) distributes the work across agents. A grouping agent organises session tracks, a planning agent selects processing, and a critic evaluates the result and provides feedback. The critic is trained on MixCritic, a dataset of 45,657 critiques. The authors report a 19% reduction in errors in their evaluation [@koo2026agenticpostproduction].

RIME (Rule-based Instructions for Music Editing) studies post-production as an iterative editing task. Given a mixed track and a production intent, an agent edits individual elements and recombines them. RIME creates paired music-editing instructions from existing datasets using patterns drawn from production workflows. It also provides POEMS, a toolkit that exposes operations such as stem separation, mixing, and effects through MCP. Evaluations of multimodal LLM agents on these tasks show that carrying out the requested edits remains challenging [@schaffer2026rime].

:::{important} Designing useful music agents
- **Delegate steps, retain decisions.** Agents can carry out sequences of operations, while creators set goals, review changes, and decide when to take over.
- **Keep changes accessible.** Working in patches and sessions lets creators inspect and revise the result. Clear action histories and undo support make that access more useful.
- **Evaluate the sound as well as the actions.** A valid tool call does not establish that an edit sounds right. Critique and revision are needed to assess whether the processing meets the creator’s intent.
:::

These examples bring the question of control down to individual actions: what an agent can change, how the creator reviews those changes, and what happens when the result misses the goal. Alongside better models, music agents need interfaces that make this exchange manageable during creative work.
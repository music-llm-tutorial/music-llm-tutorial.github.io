---
title: Memory for Longitudinal Coaching
authors:
  - name: Huan Zhang
---

# Memory for longitudinal coaching

A system that only sees the current take can critique what just happened. It cannot notice that the same passage has been unstable for three weeks, that improvement follows rest days, or that a student responds better to analogy than to metronome talk. Educational LLM-agent surveys therefore treat **memory** as a first-class module alongside tools and planning {cite}`chu_llm_agents_education_2025`: short-term interaction state plus longer-term learner knowledge, summarised and retrieved rather than pasted into the prompt.

A survey of agent memory mechanisms sorts systems by source, form, and *operation*, and it is the operations, writing and consolidating and forgetting, where systems differ most {cite}`zhang_agent_memory_survey_2024`. Reading and writing are not symmetric. Reading memory means putting some text into the prompt, writing it means asking a model to decide what is true about a student. If that decision is wrong, every later session starts from the wrong place.

## How general agents handle memory

**Generative Agents** keeps a list of observations and periodically runs *reflection*: a model call that reads recent observations and writes higher-level statements about the person back into the list {cite}`park_generative_agents_2023`. **MemoryBank** gives each memory a strength that decays along the Ebbinghaus curve and keeps a running portrait of the user {cite}`zhong_memorybank_2024`. **Codex CLI** is a coding agent in production whose memory code is open source {cite}`openai_codex_cli_2026`. A profile document goes into every prompt. After each session, one model call extracts a record and a second merges it into the profile, working from a version-controlled diff.

:::{figure} assets/memory_pipeline.svg
:label: fig-memory-pipeline
:alt: A write path running left to right from session log through extract and consolidate into a learner profile, each stage costing a model call, above a read path in which the profile is injected into the session prompt with no model call.
:width: 100%

The Codex write and read paths {cite}`openai_codex_cli_2026`. Reading is a prompt injection every session. Writing is two offline model calls, and is where claims about the learner get made.
:::

Reflection and the user portrait both turn events into claims about a person. Neither paper checks whether the claims are correct, and in a simulated town or a chat companion a wrong one costs little.

## How tutoring systems handle memory

**DeepTutor** builds its learner profile in layers: raw interaction traces become curated facts, and curated facts become a short profile. Because each layer points at the one below it, you can ask why the profile says what it says {cite}`deeptutor_2026`. The useful idea is a memory you can audit, rather than an embedding of everything that ever happened.

:::{figure} assets/deeptutor_engine.png
:label: fig-deeptutor-engine
:alt: A ring labelled agent loop with Chat, Solve and Mastery Path inside it, connected to six boxes: sub-agents, memory with three layers labelled raw event traces, per-capability summaries and cross-surface memory, knowledge bases, skills, and personal context.
:width: 100%

DeepTutor's engine {cite}`deeptutor_2026`. The memory box, bottom left, holds the three layers: raw event traces, per-capability summaries, and the cross-surface profile the agent loop reads. Memory sits beside tools, skills and knowledge bases as one shared module rather than inside any single capability.
:::

**ScaffoldLM** writes memory only after an assessment. It infers the student's state for the current step of a plan, checks whether that step's target has been met, and then picks the next teaching move {cite}`li_scaffoldlm_2026`. Tying writes to an assessment limits what is allowed into memory in the first place.

## What goes wrong when memory is written

**Overgeneralisation.** A student drags one bar. That is an observation. "This student struggles with rhythm" is a claim about the person, and once it is written down, every later session starts from it. Generative Agents and MemoryBank both turn observations into claims like this on purpose, since that is what reflection and user portraits are for {cite}`park_generative_agents_2023`, {cite}`zhong_memorybank_2024`. Codex deals with the risk in the prompt. The model that writes memory is told to keep the scope of what it actually saw: if a user asked for something once, write that they asked once, and do not write that they prefer it unless they said so {cite}`openai_codex_cli_2026`. DeepTutor arrives at the same rule from the tutoring side by requiring every claim in the profile to point back at its evidence {cite}`deeptutor_2026`.

:::{figure} assets/reflection_tree.png
:label: fig-reflection-tree
:alt: A tree whose leaves are observations that Klaus Mueller read articles, took notes and spoke to a librarian, with arrows synthesising them upward into the single statement that he is highly dedicated to research.
:width: 100%

Overgeneralisation is the mechanism working as designed {cite}`park_generative_agents_2023`. Every leaf is something that was observed. The root is a claim about the person that nobody observed, and it is the one that gets retrieved. Swap the leaves for "dragged bar 12", "dragged bar 12 again", "slowed in the coda" and the root writes itself.
:::

**Bad analysis becomes bad memory.** A practice agent writes memory from what its analysers returned, not from what a student said, so it inherits their mistakes. If the aligner places an error in the wrong bar, the system can end up remembering that the wrong bar is weak {cite}`chang_rumaa_2025`. Bad feedback gets corrected by the next take. A bad memory does not, because nothing later goes back and rechecks it. Keeping the analyser's confidence alongside the claim is the obvious fix, and no published music system does it, because no published music system writes memory at all.

**Stale memory.** Goals go out of date when a student changes repertoire, and a profile has to be erasable when a family withdraws consent, which matters most for children. MemoryBank fades memories that are never recalled {cite}`zhong_memorybank_2024`, and Codex drops memories that are never cited {cite}`openai_codex_cli_2026`. Both handle the first problem.

## What music practice adds

Instrumental coaching needs the same kinds of state (goals, recent progress, preferences, open tasks) but attached to **pieces, passages, and physical skills** rather than to textbook topics. A useful memory would answer: which pieces is the student working on; where do problems keep recurring; which mistakes repeat; how does this student like to be spoken to; how much help is still being given; and what has the teacher already decided the agent must not change. How a student practises across weeks matters too, including how they space sessions, whether they avoid hard passages, and how they responded to earlier feedback, because what is being taught is a skill that builds over months rather than accuracy on one upload.

Two requirements have no equivalent in general agent memory. A recorded mistake has to outlive the piece it came from: "this fingering falls apart above tempo" is worth keeping, while "bar 14 of this etude is shaky" stops being useful once the student moves on, and no current system tells these apart at the moment it writes them. And some memory belongs to the teacher, meaning the agent may read it but must not rewrite it. Systems whose only stakeholder is the end user have no such category.

## Open problems

**There is nothing to test it against.** Long-term memory benchmarks measure whether a system can recall facts from earlier conversations {cite}`maharana_locomo_2024`, and DeepTutor's TutorBench measures tutoring against a learner profile {cite}`deeptutor_2026`. PAST-Bench comes closest. It runs a personal agent through 204 ordered episodes across 26 scenarios with retained experience switched on and off, and scores memory, reuse of tool routines, information gathering, and replacing outdated state {cite}`xue_pastbench_2026`. Gains were uneven, and agents with the same gain often got it without the save, retrieve, update path the benchmark was built to measure. None of the three fits. A practice agent writes memory from audio analysis rather than from conversation, and the question is not whether it can recall what it wrote. The question is whether what it wrote was true of the student. We are not aware of a public dataset that follows learners over months with both recordings and teacher notes, which is what checking that would take.

**Sentences replaced numbers.** Knowledge tracing gives a number: the probability that this student has mastered this skill, updated after every attempt {cite}`corbett_knowledge_tracing_1994`, with neural versions that scale to many more skills {cite}`piech_dkt_2015`. Agent memory gives a sentence instead. Sentences can say things a skill model cannot, such as how a student likes to be spoken to. But a sentence carries no confidence, and you cannot check it against the next take the way you can check a probability. Whether a practice agent should keep both, and which one it should act on when they disagree, is unanswered.

**Forgetting is not deletion.** Delete a recording and the sentence written from it stays. Version-controlled memory at least makes such edits visible {cite}`openai_codex_cli_2026`, but no system we reviewed shows that withdrawing consent removes everything inferred from that data. For a product used by children this is a legal requirement, not only an open question.

---
title: Memory for Longitudinal Coaching
authors:
  - name: Huan Zhang
---

# Memory for longitudinal coaching

A system that only sees the current take can critique what just happened. It cannot notice that the same passage has been unstable for three weeks, that improvement follows rest days, or that a student responds better to analogy than to metronome talk. Educational LLM-agent surveys therefore treat **memory** as a first-class module alongside tools and planning {cite}`chu_llm_agents_education_2025`: short-term interaction state plus longer-term learner knowledge, summarised and retrieved rather than pasted into the prompt.

A survey of agent memory mechanisms sorts systems by source, form, and *operation*, and it is the operations, writing and consolidating and forgetting, where systems differ most {cite}`zhang_agent_memory_survey_2024`. Reading and writing are not symmetric. Reading memory means putting some text into the prompt, writing it means asking a model to decide what is true about a student. If that decision is wrong, every later session starts from the wrong place.

## How general agents handle memory

LLM Agents keeps a list of observations and periodically runs *reflection*: a model call that reads recent observations and writes higher-level statements about the person back into the list {cite}`park_generative_agents_2023`. **MemoryBank** gives each memory a strength that decays along the Ebbinghaus curve and keeps a running portrait of the user {cite}`zhong_memorybank_2024`. **Codex CLI**'s memory code is open source {cite}`openai_codex_cli_2026`, showing a profile document goes into every prompt. After each session, one model call extracts a record and a second merges it into the profile, working from a version-controlled diff.

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

**ScaffoldLM** assesses every turn before it updates memory {cite}`li_scaffoldlm_2026`. The memory holds the plan, a progress flag for each step, and the dialogue history. Every turn goes into the history together with the inferred student state, such as correct, confused or off-topic. **Only the progress flag waits for the assessment**: a step is marked done when the student's answer meets that step's target. This memory covers one math problem and does not carry over to the next session.

## Skill model from a practice agent's memory

How to represent, organize, and corordinate the sheer amount of memory that the student created on the longitudinal arc?  We hypothesize that, for a practice agent, the centre of memory is a **skill model** built from the record of attempts. Querying and writing memory serve it ({ref}`fig-practice-agent-memory`).

:::{figure} assets/practice_agent_memory.svg
:label: fig-practice-agent-memory
:alt: A three-row table. Rows: skill model from memory, querying the memory, writing into memory. Columns: how agent systems implement it, and what it means in a practice agent.
:width: 100%

A practice agent's memory: the skill model, then querying and writing, with how published systems implement each and the practice-agent version.
:::

**Skill model from memory.** Knowledge tracing keeps a probability per skill and updates it after every attempt {cite}`corbett_knowledge_tracing_1994`, {cite}`piech_dkt_2015`. LLM tutors are starting to keep it beside their text memory. TutorLLM conditions an LLM tutor's answers on the learning state a knowledge-tracing model predicts ({ref}`fig-tutorllm`) {cite}`li_tutorllm_2025`, and Scarlatos and colleagues use an LLM to label the skills in each dialogue turn so that knowledge tracing can run on tutoring conversations {cite}`scarlatos_kt_dialogue_2025`.

:::{figure} assets/tutorllm_architecture.png
:label: fig-tutorllm
:alt: TutorLLM architecture. A table of interactions with user id, item id, correctness and skill id feeds a knowledge-tracing model whose output, the students' learning state, goes to a retrieval-augmented LLM together with a knowledge database; the LLM talks to the student through a plugin.
:width: 100%

TutorLLM {cite}`li_tutorllm_2025`. The interaction log (bottom left) is the memory; knowledge tracing turns it into a learning state that the LLM reads beside the retrieved course knowledge. Figure from the paper, CC BY 4.0.
:::

Music already has such state. SingPAD scores every sung note against pitch and rhythm concepts, and deep knowledge tracing predicts the next note at 0.83 AUC against 0.69 for Bayesian knowledge tracing {cite}`zhang_singpad_2024`. Yousician keeps 433 guitar skills per student at four forgetting rates and uses them to predict how a student will do on an unplayed song {cite}`muellerschon_playability_2025`.

**Querying the memory.** MemGPT splits memory the way an operating system does: a small working context sits in the prompt and the model edits it, while the full history lives outside and is searched by function call {cite}`packer_memgpt_2023`. For a practice agent the prompt holds a short profile: the current pieces, goals, and what the teacher has asked for. The analysis of each take stays outside. When the agent searches it, Generative Agents' scoring applies: each memory is ranked by recency, importance and relevance, with importance rated by the model when the memory is written {cite}`park_generative_agents_2023`. For a practice agent, relevance means the same piece and passage, possibly technique, and an instruction from the real teacher should outrank hypothesis.

**Writing into memory.** Mem0 {cite}`chhikara_mem0_2025` extracts candidate facts from each new exchange, fetches the most similar stored memories, and has the model choose ADD, UPDATE, DELETE or NOOP for each. Zep {cite}`rasmussen_zep_2025` stores when each fact became true and when it stopped being true, so a contradicting fact closes the old one instead of sitting beside it. A practice agent needs the second behaviour, with the old fact kept: when bar 12 is finally played clean, "rushes bar 12" gets an end date, and the three weeks of rushing stay in the history the skill model reads.

## Open problems

**Evaluation:** Long-term memory benchmarks measure whether a system can recall facts from earlier conversations {cite}`maharana_locomo_2024`, and DeepTutor's TutorBench measures tutoring against a learner profile {cite}`deeptutor_2026`. PAST-Bench comes closest. It runs a personal agent through 204 ordered episodes across 26 scenarios with retained experience switched on and off, and scores memory, reuse of tool routines, information gathering, and replacing outdated state {cite}`xue_pastbench_2026`. Gains were uneven, and agents with the same gain often got it without the save, retrieve, update path the benchmark was built to measure. None of the three fits. A practice agent writes memory from audio analysis rather than from conversation, and the question is not whether it can recall what it wrote. The question is whether what it wrote was true of the student. We are not aware of a public dataset that follows learners over months with both recordings and teacher notes, which is what checking that would take.

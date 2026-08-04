---
title: Tools for a Practice Agent
authors:
  - name: Huan Zhang
---

# Tools for a practice agent

Educational agent surveys emphasise tool use: the language model orchestrates specialist components and reasons over their returns, rather than absorbing every MIR subtask into its weights {cite}`chu_llm_agents_education_2025`. The same division of labour appears in Chapter 1 for agents generally. For performance coaching, the natural toolbox is largely the perceptual and feedback stack already reviewed in this chapter — transcription, alignment, mistake detection, and related analysers called on demand.

## Candidate tools

A practice-oriented agent might expose an API surface over systems such as:

- **Audio and symbolic analysers** — pitch, rhythm, dynamics, and mistake detectors that return localisable observations {cite}`lerch_survey_2019`, {cite}`chou_performance_errors_2025`.
- **Score processors and aligners** — measure-linked correspondences between notation and performance, as in score-informed assessment and agentic score–audio pipelines {cite}`huang_score_informed_2020`, {cite}`zhao_museagent_2026`, {cite}`chang_rumaa_2025`.
- **Optional motion or technique sensors** — when audio alone cannot distinguish causes (hand posture, bow contact).
- **Exercise and repertoire generators** — slowed loops, isolated bars, or scaled drills that turn a diagnosis into a next action.
- **Logs and curricula** — practice calendars, assigned pieces, and exam rubrics retrieved as context.

In this framing the LLM's role is orchestration and explanation: choose which tool to run, interpret the result in context, and speak at an appropriate feedback depth. MuseAgent-style controllers already illustrate the pattern for score–audio dialogue {cite}`zhao_museagent_2026`; a coaching agent would add longitudinal planning on top of similar calls.

## Tool quality and coaching quality

Alignment and related front-ends remain difficult on learner audio — wrong notes, restarts, skipped bars, long thinking pauses {cite}`chang_rumaa_2025`. That limitation matters for agents as much as for MIR benchmarks. If an aligner attaches an error to the wrong bar, later coaching moves — drills, memory updates, explanations — inherit the mistake, while the language model may still sound fluent.

One research implication is to treat tool outputs as **evidence with uncertainty**: abstain, request another take, or surface the analyser trace when confidence is low, rather than committing to a lesson plan on a false localisation. Robustness to imperfect play (Challenge 3 under open problems for performance data) is therefore upstream of trustworthy agentic coaching, not a polish step after dialogue generation works.

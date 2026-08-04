---
title: Memory for Longitudinal Coaching
authors:
  - name: Huan Zhang
---

# Memory for longitudinal coaching

A system that only sees the current take can critique what just happened. It cannot notice that the same passage has been unstable for three weeks, that improvement follows rest days, or that a student responds better to analogy than to metronome talk. Educational LLM-agent surveys therefore treat **memory** as a first-class module alongside tools and planning {cite}`chu_llm_agents_education_2025`: short-term interaction state plus longer-term learner knowledge, summarised and retrieved rather than pasted wholesale into the prompt.

## Patterns from agentic tutors outside music

Two recent tutoring frameworks make memory design concrete without prescribing a music-specific schema.

**DeepTutor** couples knowledge grounding with a hybrid personalisation engine whose memory is deliberately inspectable: interaction traces are consolidated into curated facts and then into a compact learner profile, so high-level claims remain attributable to evidence {cite}`deeptutor_2026`. Architecturally, the transferable idea is *curated, auditable* memory rather than an opaque embedding of every past session.

**ScaffoldLM** keeps an assessment-driven tutoring memory inside a control loop: after each learner response it infers cognitive state for the current plan step, checks whether that step's target is met, and then selects the next tutoring action {cite}`li_scaffoldlm_2026`. The transferable idea is the loop — assess, update memory, act — rather than any particular field layout.

Scoping reviews of LLM pedagogical agents similarly distinguish reactive session bots from systems that carry state across interactions and may act proactively between them {cite}`scoping_llm_pedagogical_agents_2026`.

## What music practice adds

Instrumental coaching needs similar kinds of state — goals, recent trajectory, preferences, open tasks — but often indexed to **pieces, passages, and sensorimotor skills** rather than only textbook concepts. In broad terms, useful memory would support questions such as: which repertoire is active; where difficulty still concentrates; which error patterns recur; how the learner prefers to be addressed; how much scaffolding remains in force; and what a human teacher has already decided the agent should not override. Longitudinal practice behaviour (spacing, avoidance of hard sections, response to past feedback depths) matters because the educational object is skill over weeks, not accuracy on one upload.

**Forgetting** is part of the same design space. Raw performance audio and one-off mistakes need not live forever in the prompt; stale goals can drop when repertoire changes; revoked consent (especially for children) must purge profile content. DeepTutor-style inspectability is relevant here: claims that cannot be traced to retained evidence are poor drivers for the next session.

There is not yet a community review of memory designs *for music practice agents* comparable to the education-agent surveys cited above. A practical interim stance is to reuse those general patterns — layered consolidation, assessment-driven updates, proactive use of state between sessions — and specialise them lightly to score-linked, embodied skill, rather than inventing a new methodology in this tutorial.

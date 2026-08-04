---
title: Agentic Coaching Systems
authors:
  - name: Huan Zhang
---

# Agentic coaching systems

Single-session feedback answers *what just went wrong*. A natural next question is what a learner should work on *across weeks*. Educational surveys of LLM agents organise that longer horizon around **tool calling**, **memory**, and **planning**, together with decisions about when to instruct, when to ask, and when to step back {cite}`chu_llm_agents_education_2025` — ingredients already introduced for general agents in Chapter 1.

Recent music systems already sketch pieces of this picture: analysers and score–audio controllers for one take, query-based coaches for dialogue, and product interfaces that sit between lessons. What remains less developed is treating coaching as an *agent* that continues a thread — calling perceptual tools, carrying learner state, and adapting a practice plan over time. Music practice makes those requirements sharper than many classroom tutoring settings: perception is multimodal and brittle on imperfect play; skill is embodied; human teachers are often absent between lessons.

The subsections below survey the three ingredients in turn: tools, memory, and pedagogy as the control policy over both.

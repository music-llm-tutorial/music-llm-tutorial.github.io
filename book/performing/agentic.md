---
title: Agentic Coaching Systems
authors:
  - name: Huan Zhang
---

# Agentic coaching systems

Single-session feedback answers *what just went wrong*. The next question is what a learner should work on *across weeks*. Educational surveys of LLM agents organise that longer horizon around **tool calling**, **memory**, and **planning**, together with decisions about when to instruct, when to ask, and when to step back {cite}`chu_llm_agents_education_2025`. Chapter 1 introduces these ingredients for general agents.

Music systems so far cover pieces of the picture: analysers and score-audio controllers for one take, query-based coaches for dialogue. What is missing is coaching as an *agent* that continues a thread, calling perceptual tools, carrying learner state, and adapting a practice plan over time. Music practice makes this harder than most classroom tutoring. Perception is multimodal and breaks on imperfect play, skill is embodied, and human teachers are absent between lessons.

## Two products that already carry state

**ROLI's AI Music Coach** {cite}`roli_ai_music_coach_2026` pairs Airwave infrared hand tracking, 27 joints per hand at 90 frames per second, with a conversational LLM inside the ROLI Learn app. It responds to posture and finger motion rather than only to which notes were played, supports speech in dozens of languages, and gives feedback while the student is still playing.

**Clefer** {cite}`clefer_piano_app_2025` takes an audio-first route. Acoustic recognition through a phone or tablet microphone works with any piano and needs no extra hardware. Its coach checks pitch, rhythm and dynamics against the score across note-by-note, rhythm and full play-through modes, and exposes session data to teachers.


## Memory or weights

The previous section trained a LoRA adapter on Qwen2.5-Omni into a coach that changes the model's weights. In this section we focus on changes that the model reads instead: a tool return, a memory entry, a line of prompt. A survey of self-improving agents sorts updates by what they touch: the **model parameters**, or the **scaffold** of prompts, memory, tools and control logic around them {cite}`ren_self_improvement_survey_2026`. A practice agent needs both, and the split decides where each kind of knowledge goes.

Vertical companies outside music already train their domain into weights. Harvey post-trained a Kimi K3 base on public legal data, synthetic data and lawyer-annotated data, and states its aim as letting law firms own their own specialised models {cite}`harvey_tenet_2026`. OpenEvidence trains its own clinical models under content agreements with NEJM, JAMA and the Cochrane Library rather than serving a general model {cite}`openevidence_model_family_2026`. The music analogue of case law is the pedagogy corpus: method and sight-reading series such as Paul Harris's *Improve your sight-reading!* {cite}`harris_sight_reading_2008`, treatises such as Neuhaus's *The Art of Piano Playing* {cite}`neuhaus_art_of_piano_1973`, exam syllabi, and the way teachers phrase feedback.

However, training the domain in has a known cost. Fine-tuning erases behaviour nobody measured, and the current repair is to distil from the earlier checkpoint afterwards {cite}`lu_on_policy_distillation_2025`, {cite}`paniego_distillation_2026`. The coach adapter in the previous section learned to diagnose, and the notebook does not check what it stopped doing.


:::{figure} assets/update_targets.svg
:label: fig-update-targets
:alt: Two stacked boxes. The upper box, weights, is changed by training once and shared by every learner, holding the domain corpus and a distillation step from the earlier checkpoint. The lower box, scaffold, is changed by writing text every session and per learner, holding retrieval of the same corpus, prompt, memory, tools and hooks.
:width: 100%

The two update targets from {cite:t}`ren_self_improvement_survey_2026`, filled in for a practice agent. The pedagogy corpus can sit in either box. Facts about one learner sit only in the lower one.
:::

The subsections take the three ingredients in turn: tools, memory, and pedagogy as the policy over both.

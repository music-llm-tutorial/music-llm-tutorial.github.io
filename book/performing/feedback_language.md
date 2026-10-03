---
title: From Measurement to Language
authors:
  - name: Huan Zhang
---

# From measurement to language

A system that correctly identifies that a note is late by 40 milliseconds has not yet produced anything a performer can act on. Automatic music transcription, beat tracking, F0 estimation, and score-to-performance alignment recover *what* happened {cite}`benetos_amt_2019`, {cite}`lerch_survey_2019`; the language model's role is to convert that signal-level evidence into explanations that are specific, actionable, and calibrated to context.

## Grounding feedback in the score

Useful feedback localises each observation in the score and proposes a concrete next step (a targeted exercise, a fingering adjustment, a change in bow distribution) rather than a generic description. Score-informed assessment networks already condition quality predictions on the notated reference {cite}`huang_score_informed_2020`; LLM systems extend that conditioning into free-form language. **MuseAgent** {cite}`zhao_museagent_2026` coordinates OMR, AMT, and score–audio alignment through an agentic controller, so the model can reason jointly over the printed score and the performed audio in multi-turn dialogue: which notes are missing in measure five, how the performed dynamics compare with the marking, where a restart broke the phrase. **RUMAA** {cite}`chang_rumaa_2025` shows why that grounding is hard for learners: alignment, transcription, and mistake detection are interdependent, and conventional pipelines degrade when performers skip bars, restart phrases, or sit on a fermata while thinking. Feedback that cites a wrong score location is worse than no feedback.

:::{figure} assets/chang_rumaa_2025.png
:label: fig-chang-rumaa-2025
:alt: RUMAA proxy tasks linking score notes and performance events through Match/Insert/Delete and timing attributes

RUMAA frames score–performance alignment as coupled proxy tasks over the score, the performance, and Match/Insert/Delete edit operations {cite}`chang_rumaa_2025`.
:::

Transformer-based mistake detectors {cite}`chou_performance_errors_2025` and simulated-error corpora for tutoring {cite}`morsi_simulating_mistakes_2024` enlarge the training signal for "what went wrong," but they do not decide *how* to say it, nor which imperfect-performance regimes the community has data for at all. 


## From expert critique corpora to generative coaches

Before LLMs, performance assessment research mostly produced scalar grades or discrete technique labels. PianoJudge {cite}`zhang_pianojudge_2024` benchmarks audio encoders on multi-dataset piano understanding; PISA {cite}`parmar_pisa_2021` frames skill-level estimation as a graded task; CROCUS {cite}`matsubara_crocus_2021` supplies expert critique documents that ground automated assessment in professional conservatory language. These resources make clear that expert teachers already communicate in prose, and that prose is the interface performers actually use.

**LLaQo** {cite}`zhang_llaqo_2025` synthesises this lineage into an LLM coach: fine-tuned on expert QA pairs drawn from twelve piano datasets spanning student to competition level, it answers free-form queries about performance quality, technique, and expressive choices. The shift is architectural as well as linguistic. Instead of emitting a single rating, the model becomes a queryable layer over perceptual evidence, provided that evidence is available and that the training distribution covers the learner's context.

:::{figure} assets/llaqo_figure.png
:label: fig-llaqo
:alt: The query-answer space of the LLaQo model. 

LLaQo curate a set of QA pairs that covers free-form queries about performance details.
:::

## Beyond piano: singing and instrumental critique

Instrumental NL feedback outside piano remains thinner, but singing has moved quickly toward generative multimodal critique. MusicTutor decomposes tutoring across specialised agents: an orchestrator elicits the learner's goal and splits it into practice stages, then routes between a pitch auditor for range and stability, a vocal profiler that generates personalised scale exercises, and a phrase coach working phrase by phrase {cite}`cheng_musictutor_2026`. Mistake detectors compare learner and teacher recordings for pitch and rhythm errors {cite}`kumar_singing_mistakes_2026`; reference-independent scorers such as TG-Critic {cite}`sun_tgcritic_2023` estimate quality from timbre features alone. **VoiceCoach** {cite}`zheng_voicecoach_2026` closes the loop for a technique learners cannot see from outside: a recognition model estimates voice-quality parameters for mixed voice, progressive visualisations render them as spatial and temporal patterns, and an LLM turns those model outputs into personalised explanations and concrete practice suggestions. Together with piano coaching, these systems sketch a common pattern: specialised perceptual front-ends feed structured observations into a language model that narrates them at a chosen pedagogical depth.

How far that pattern actually reaches is measurable. **VocalCoachBench** {cite}`bang_vocalcoachbench_2026` collects 515 vocal recordings annotated by 18 professional trainers into 12,051 distinct coaching claims, and scores audio-language models on identifying the problem and prescribing the correction. Top-3 fine-grained issue identification falls below label-prior baselines, and strict diagnosis alignment stays under 7%: fluent critique language is not evidence that the underlying diagnosis is right.



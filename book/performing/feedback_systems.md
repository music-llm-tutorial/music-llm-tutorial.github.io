---
title: Systems in Practice
authors:
  - name: Huan Zhang
---

# Systems in practice

Research datasets have long treated imperfect playing as noise to be filtered out: well-tuned transcriptions, virtuoso recordings, curated recital sets {cite}`hawthorne_maestro_2019`, {cite}`zhang_atepp_2022`. Commercial products downstream of MIR treat the opposite case as the point — practice apps, sight-reading helpers, exam-grading platforms, accompaniment systems for learners. That is where LLM-mediated feedback is being deployed today, and where the gap between research corpora and real practice data is most visible.

## The research–product split

Lerch et al. {cite}`lerch_survey_2019` organise performance analysis into technical correctness, expressive deviation, and quality assessment; most public benchmarks still skew toward the first two on professional or semi-professional recordings. ASAP {cite}`foscarin_asap_2020` and ATEPP {cite}`zhang_atepp_2022` enable expressive-deviation studies on score-aligned piano, but they are not longitudinal practice logs. Commercial apps (Yousician, Simply Piano, Flowkey, Skoove, PianoMarvel and peers) accumulate millions of practice hours that remain locked behind product walls, while conservatory exam recordings are often annotated yet legally untouchable. Privacy constraints are especially sharp when many learners are children. The result is a structural asymmetry: research has clean signals; products have the messy ones that feedback systems must handle.

## Deployed LLM coaching products

**ROLI's AI Music Coach** {cite}`roli_ai_music_coach_2026` pairs Airwave infrared hand tracking — 27 joints per hand at 90 frames per second — with a conversational LLM interface inside the ROLI Learn app. The system responds not only to which notes were played but to posture and finger motion, and supports spoken interaction in dozens of languages. Feedback is delivered in real time during practice; lesson pacing adapts to what the sensors observe.

**Clefer** {cite}`clefer_piano_app_2025` takes an audio-first route: acoustic recognition through a phone or tablet microphone works with any piano, without specialised hardware. The Clefer Coach evaluates pitch, rhythm, and dynamics against the score, offers note-by-note, rhythm, and full play-through modes, and surfaces session data for teachers. Both products are explicit that their role is to extend human instruction between lessons, not replace it — a design principle with pedagogical and commercial dimensions.

These systems already sit on the spectrum from single-session diagnosis to longer-horizon coaching. Session recording and teacher-facing summaries hint at persistent learner state — the agentic architecture for that state (tools, memory, pedagogical policy) is developed next, without treating any one product as the reference design.

## Research prototypes that shape product design

Product deployments draw on a parallel research line that studies *how* AI should talk to music learners. Chat Melody {cite}`jin_teachable_agent_2025` is an LLM teachable agent grounded in Learning-by-Teaching pedagogy: students explain music-analysis reasoning to a simulated novice rather than receiving answers directly, with measured gains in post-test scores and reduced cognitive load relative to self-directed analysis. MusicScaffold {cite}`hu_musicscaffold_2025` reframes generative AI as guide, coach, and partner for adolescent creative work, emphasising symbolic explanation of expressive choices and iterative reflection rather than one-shot generation. Neither system is a commercial practice app, but both supply interaction patterns — scaffolded questioning, autonomy-preserving partnership, evidence that fluent generation without reflection can foster dependency — that product coaches are beginning to absorb.

Score-informed assessment {cite}`huang_score_informed_2020`, expert-critique corpora {cite}`matsubara_crocus_2021`, and query-based coaches such as LLaQo {cite}`zhang_llaqo_2025` provide the analytical backbone. The product layer adds latency constraints, microphone and camera noise, multi-user teacher dashboards, and the requirement that feedback remain useful when the performer is still learning the piece — precisely the imperfect-performance regime that clean MIR datasets under-represent.

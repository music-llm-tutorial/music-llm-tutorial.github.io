---
title: Tool calling for a Practice Agent
authors:
  - name: Huan Zhang
---

# MIR Tools for a practice agent

Educational agent surveys emphasise tool use: the language model orchestrates specialist components and reasons over their returns, rather than absorbing every MIR subtask into its weights {cite}`chu_llm_agents_education_2025`. The same division of labour appears in Chapter 1 for agents generally. For performance coaching, the natural toolbox is largely the MIR perceptual and feedback stack already reviewed in this chapter: transcription, alignment, mistake detection, and related analysers called on demand.

## Candidate tools

A practice-oriented agent might expose an API surface over systems such as:

- **Transcriptors**: instrument-conditioned AMT that turns a take into note events the agent can reason over. Piano is furthest along: Transkun scores note intervals with a non-hierarchical transformer {cite}`yan_transkun_2024`; Kwon, Jeong, and Nam target efficient real-time autoregressive transcription {cite}`kwon_realtime_transcription_2024`. Guitar now has large aligned corpora and benchmark models such as GAPS {cite}`riley_gaps_2024`. Coverage remains uneven across strings, winds, and voice, so the same agent API must swap backends rather than assume one universal transcriptor.
- **Score processors and aligners**: note- and measure-linked correspondences between notation and performance. Nakamura et al. fold insertions, deletions, and pitch errors into HMM alignment {cite}`nakamura_alignment_2017`; Parangonar and the (n)ASAP pipelines supply current note-level matchers and correction tools {cite}`peter_asap_alignments_2023`. Learner audio still breaks clean alignment, which is why unified models such as RUMAA remain relevant {cite}`chang_rumaa_2025`.
- **Audio and symbolic analysers**: pitch, rhythm, dynamics, and mistake detectors that return localisable observations {cite}`lerch_survey_2019`, {cite}`chou_performance_errors_2025`. For singing, mistake detectors compare learner and teacher recordings for pitch and rhythm errors {cite}`kumar_singing_mistakes_2026`, and TG-Critic scores quality without a reference, from timbre features alone {cite}`sun_tgcritic_2023`.
- **Motion or technique sensors**: when audio alone cannot distinguish causes (hand posture, bow contact, key-depression kinematics). MOSA pairs optical motion capture with note-level semantic annotation for piano and violin {cite}`huang_mosa_2024`; 
- **Playability checks and exercise or repertoire generators**: tools that turn a diagnosis into a next action: predict whether an arrangement is playable for this learner {cite}`muellerschon_playability_2025`; recommend the next song, part, version, or drill {cite}`hassein_bey_what_song_now_2025`; or translate and simplify a piece across playing levels {cite}`gover_music_translation_2022`, {cite}`ramoneda_difficulty_simplification_2025`.
- **Demonstration generators**: voice cloning that renders the target phrase in the student's own voice, so the student no longer has to map a coach's voice onto their own. In a study with 22 singers, a coaching session where these demos were the only sung examples and the human coach gave verbal guidance **produced immediate gains comparable to expert human coaching under blind assessment**, though students felt an imperfect connection to the cloned voice {cite}`gao_vocal_coaching_2026`.
- **Logs and curricula**: practice calendars, assigned pieces, and exam rubrics retrieved as context. Outside music, intelligent tutors already treat learner traces and lesson plans as tools rather than as prompt stuffing: knowledge-tracing models log mastery over time {cite}`piech_dkt_2015`; educational LLM agents retrieve curricula, inspectable learner profiles, and next-item plans {cite}`chu_llm_agents_education_2025`, {cite}`deeptutor_2026`. A practice agent would specialise the same pattern to pieces and passages.

In this framing the LLM's role is orchestration and explanation: choose which tool to run, interpret the result in context, and speak at an appropriate feedback depth. MuseAgent-style controllers already illustrate the pattern for score-audio dialogue {cite}`zhao_museagent_2026`; a coaching agent would add longitudinal planning on top of similar calls.

:::{figure} assets/museagent_architecture.png
:label: fig-museagent-architecture
:alt: Text, image and audio inputs feed perceptual modules for measure-wise OMR and AMT-based alignment, whose outputs are serialised into ABC, MusicXML and JSON, retrieved alongside a music library, and passed to a language model with a memory bank.
:width: 100%

MuseAgent routes each query to a different perceptual front-end and converts every return into text before the model sees it {cite}`zhao_museagent_2026`. The language model never touches audio or pixels: it reads ABC, MusicXML and JSON. A practice agent inherits this shape, and inherits the failure mode with it, since a wrong return is indistinguishable from a right one at the point the model reads it.
:::


In MusicTutor and VoiceCoach the language model never hears the singer. It reads what MIR tools return and decides what to say or do next. The two systems differ in who decides which tool runs.

**MusicTutor** {cite}`cheng_musictutor_2026` gives that decision to an LLM. An orchestrator (Qwen3-4B-Instruct) asks the beginner what they want to sing, keeps that goal in memory, and splits practice into stages: warm-up, range test, phrase practice, and song evaluation. Each stage calls a different agent. The Pitch Auditor runs pYIN on the take and returns a vocal range and a pitch-stability score. The Vocal Profiler turns that range into a five-note scale exercise, synthesised as piano audio. The Phrase Coach has the learner sing one lyric line at a time and calls a Song Evaluator, a Kimi-Audio model fine-tuned to rate technique, emotional expression, timbre, and breath control with a rationale for each. The orchestrator reads these ratings as a performance signal and **decides whether to advance, retry the phrase, or roll back to an earlier stage**. The authors note that the evaluator can still write plausible rationales that the audio does not support.

**VoiceCoach** {cite}`zheng_voicecoach_2026` uses a fixed pipeline for mixed voice, a technique learners cannot see from outside. A recognition model estimates voice-quality parameters from the audio, visualisations show them as spatial and temporal patterns, and an LLM turns the model outputs into personalised explanations and practice suggestions. Here the LLM does not route: it explains the output of a tool it did not choose.

Tool error still cascades. If an aligner pins a mistake to the wrong bar, later drills and explanations inherit it while the language model may sound fluent {cite}`chang_rumaa_2025`. Treat analyser returns as **evidence with uncertainty**, meaning abstain, request another take, or surface the trace, rather than committing a lesson plan on a false localisation.

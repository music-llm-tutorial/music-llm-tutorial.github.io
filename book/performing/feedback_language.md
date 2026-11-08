---
title: From Measurement to Language
authors:
  - name: Huan Zhang
---

# From measurement to language

A system that correctly identifies that “a note is late by 40 milliseconds” has not produced anything that a performer can act on. Automatic music transcription, beat tracking, F0 estimation, and score-to-performance alignment recover *what* happened {cite}`benetos_amt_2019`, {cite}`lerch_survey_2019`; the language model's role is to convert that signal-level evidence into explanations that are specific, actionable, and calibrated to context.

## Localization: Grounding feedback in the score

Useful feedback localises each observation in the score and proposes a concrete next step (a targeted exercise, a fingering adjustment, a change in bow distribution) rather than a generic description. **Score-informed assessment** networks already condition quality predictions on the notated reference {cite}`huang_score_informed_2020`; LLM systems extend that conditioning into free-form language. Thus, score processing and score instruction understanding is crucial (See [](./perceiving_score.md) on current limitations).

**MuseAgent** {cite}`zhao_museagent_2026` coordinates OMR, AMT, and score–audio alignment through an agentic controller, so the model can reason jointly over the printed score and the performed audio in multi-turn dialogue: which notes are missing in measure five, how the performed dynamics compare with the marking, where a restart broke the phrase. **RUMAA** {cite}`chang_rumaa_2025` shows why that grounding is hard for learners: alignment, transcription, and mistake detection are interdependent, and conventional transcribe->align->mistake catching pipelines degrade when performers skip bars, restart phrases, or sit on a fermata while thinking. Feedback that cites a wrong score location is worse than no feedback.

:::{figure} assets/chang_rumaa_2025.png
:label: fig-chang-rumaa-2025
:alt: RUMAA proxy tasks linking score notes and performance events through Match/Insert/Delete and timing attributes

RUMAA frames score–performance alignment as coupled proxy tasks over the score, the performance, and Match/Insert/Delete edit operations {cite}`chang_rumaa_2025`.
:::

Transformer-based mistake detectors {cite}`chou_performance_errors_2025` and simulated-error corpora for tutoring {cite}`morsi_simulating_mistakes_2024` enlarge the training signal for "what went wrong," which is helpful for score-localized feedback, given that real-world alignment with imperfect data are hard to construct.


## From expert critique corpora to generative LM

Before LLMs, performance assessment research mostly produced scalar grades or discrete technique labels. PianoJudge {cite}`zhang_pianojudge_2024` benchmarks audio encoders on multi-dataset piano understanding; PISA {cite}`parmar_pisa_2021` frames skill-level estimation as a graded task, as well as the YCU-PPE dataset {cite}`wang_ycuppe_2021`. 
Some datasets start to connect performance with text: CROCUS {cite}`matsubara_crocus_2021,kagawa_effectivefeedback_2023` supplies teachers' critique documents on oboe, piano, and guitar performances that ground automated assessment in professional conservatory language, as well as the Expert-Novice dataset {cite}`jiang_expert_2023`. NeuroPiano {cite}`zhang_neuropiano_2024` also provides short textual feedback on technical exercises. These resources make clear that expert teachers already communicate in prose, and that prose is the interface performers actually use. The Con Espressione Game {cite}`cancino_conespressione_2020` collects a different kind of text: listeners' own words, mostly adjectives, for the expressive character of recordings by famous pianists.

:::{table} Text in performance datasets before LLMs. CROCUS and NeuroPiano examples are the authors' English translations of Japanese originals.
:label: tbl-piano-text-datasets

| Dataset | Who writes the text | Attached to | Example |
|---|---|---|---|
| CROCUS | Teachers, multi-sentence critique documents | Recordings of oboe, piano, and guitar | "I don't feel the sforzando in the 33rd and 34th bars at all. Play it with more force (don't hit the keyboard)." |
| Expert-Novice | Piano instructors and peer players, each with a 1 to 5 rating | Beginner recordings of seven pieces | "The player didn't play the staccato notes in the left hand. No dynamic changes. A wrong note was played." |
| NeuroPiano | Professional pianists answering fixed questions, each with a 6-point rating | Technical exercises: scales, arpeggios, octaves | Q: "Are the lines connected?" A: "The sound is cut off where the fingers cross under in the descending passage." |
| Con Espressione | Listeners, single words or short phrases | Recordings by famous pianists | Terms at the two ends of one expressive dimension: "hectic", "hasty", "agitated" against "gentle", "tender", "calm" |
:::

**LLaQo** {cite}`zhang_llaqo_2025` synthesises this lineage into an LLM coach: fine-tuned on expert QA pairs drawn from twelve piano datasets spanning student to competition level, it answers free-form queries about performance quality, technique, and expressive choices. The shift is architectural as well as linguistic. Instead of emitting a single rating, the model becomes a queryable layer over perceptual evidence, provided that evidence is available and that the training distribution covers the learner's context.

:::{figure} assets/llaqo_figure.png
:label: fig-llaqo
:alt: The query-answer space of the LLaQo model. 

LLaQo curate a set of QA pairs that covers free-form queries about performance details.
:::

## Beyond piano: singing, video, and symbolic performance

Outside piano audio, datasets that pair performances with text now exist for singing, for performance video, and for symbolic performances aligned with their scores. As with the piano corpora, some of this text describes what the performer did and some of it judges it.

### Singing

**VocalCoachBench** {cite}`bang_vocalcoachbench_2026` has 18 professional vocal trainers annotate 515 recordings, yielding 12,051 coaching claims, and tests 12 audio-language models on naming the problem and prescribing the fix. Models identify the broad issue domain, but their top-3 specific diagnoses score below a baseline that always guesses the most common labels, and fewer than 7% of diagnoses strictly match the experts'. Fluent critique language is not evidence of a correct diagnosis.

**Sing-MD** {cite}`wang_singmd_2025` has professional vocal coaches score Chinese pop recordings on breath control, timbre, emotional expression, and vocal technique, and write a short critique for each dimension. The authors fine-tune Qwen2-Audio on these critiques to generate feedback, but they evaluate only the scores and rankings, and the critiques are not released.

Technique labels also enter instruction data, as they did for LLaQo. CMI-Bench {cite}`ma_cmibench_2025` turns VocalSet singing techniques (belt, breathy, vibrato, vocal fry) and guzheng playing techniques into instruction and answer pairs. **Audio LLMs reach 15.6% on vocal technique, against 76.9% for a supervised model.**

### Video

Video shows what audio cannot: the bow arm, the hands, posture, and the performer's contact with the audience. **MusiQAl** {cite}`christodoulou_musiqal_2025` asks descriptive questions about instrumental, singing, and dance performance videos, such as how often a performer looks at the audience or whether gestures follow the rhythm. Musicologists wrote the questions and the answers are short labels.

**Ego-Exo4D** {cite}`grauman_egoexo4d_2024` records piano, violin, and guitar players from first-person and third-person views. Music experts watch each take, pause, and speak time-stamped commentary, transcribed with Whisper, and give a proficiency rating; the annotation guide asks for critique and teaching advice rather than description. **ExAct** {cite}`yi_exact_2025` turns this commentary into five-way multiple-choice questions. On music, **Gemini 2.5 Pro picks the expert's comment 53% of the time, close to non-experts (54%) and far below experts (80%).** ProfVLM {cite}`bianchi_profvlm_2026` generates a proficiency label and a commentary from the multi-view video, scored by word and embedding overlap with the expert commentary.

### Symbolic performance

Symbolic performance data gives the onset, duration, velocity, and pedal of every note, aligned to the score. **MuSP-Bench** {cite}`liessens_muspbench_2026` holds 490 questions written by two professional musicians on 18 piano pieces and 6 orchestral excerpts, about the score, the performance, or both. On questions about the performance alone, the best model reaches 14.2% from audio and 59.4% from MIDI written as text.

**MuNo-SP** {cite}`liessens_munosp_2026` writes score and performance together as text, bar by bar and beat by beat: each note line carries pitch, written duration, velocity, performed onset, and sounding duration. With this format GPT-5.6 Sol answers 80.8% of MuSP-Bench questions, against 55.0% with the best conventional input (ABC, score image, or MIDI as text). The same authors build **MAESTROCaps** from 148 aligned piano performances: LLMs write long time-stamped analyses and 31,080 QA pairs from the MuNo-SP text, and a rule-based checker tests the timestamps and pitches they cite. 

:::{figure} assets/performance_text_examples.svg
:label: fig-performance-text-examples
:alt: Examples of performance text for singing audio, performance video, and symbolic performance, each shown with its input

Performance text shown with their input. Video frames from Ego-Exo4D {cite}`grauman_egoexo4d_2024` and from MusiQAl video 00000015 with its stored questions and answers {cite}`christodoulou_musiqal_2025`; the Mozart score and its MuNo-SP encoding from {cite}`liessens_munosp_2026`. Text is quoted from each paper; the VocalCoachBench examples are the authors' translations from Korean.
:::

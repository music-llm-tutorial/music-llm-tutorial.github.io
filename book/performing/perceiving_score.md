---
title: Perceiving the Score
authors:
  - name: Huan Zhang
---

# Perceiving the score for performance

A score encodes far more than pitch and rhythm. In this section, we introduce preliminarily the elements that drive performance decisions: dynamics, timing, touch, gesture, and examine how much they get covered in current LLM-based systems.

## What the score carries for performance

**Dynamics**: absolute levels (*pp*, *ff*) and relative changes (*cresc.*, *dim.*, *sfz*). Their interpretation is context-dependent: the same *forte* behaves differently across register, instrument, and texture {cite}`kosta_dynamics_2018`, {cite}`kim_velocity2dms_2025`.

**Articulation** governs inter-note connectivity: legato, staccato, accent, tenuto, marcato {cite}`bresin_articulation_2000`.

**Tempo markings** range from verbal designations (*Allegro*, *Adagio*) to qualified phrases (*Allegro ma non troppo*) to metronome numbers. 

**Phrasing**: slurs, phrase marks, breath marks, specifies grouping and connection. A slur implies a single bow stroke for a cellist, a single breath for an oboist, a bound syllable for a singer; the physical realisation is instrument-specific. Phrase contours also define where expressive shaping (dynamic swell, agogic delay) is applied.

**Ornamental gestures**: trills, turns, mordents, appoggiaturas, shorthand for note sequences whose rhythmic realisation depends on period, instrument, and tempo. 

**Pedal indications** (sustain, sostenuto, una corda) are primarily for keyboard instruments and interact with harmonic rhythm and decay.

**Execution-level markings** such as fingering (piano, guitar), bowing direction, string/position choice (*sul G*, *IV. Saite*), contact-point (*sul ponticello*, *sul tasto*), and breath marks and tonguing. 

**Text expression marks** — *dolce*, *con fuoco*, *misterioso*, *senza sordino* — are natural-language performance instructions requiring semantic understanding.

**Non-classical directives**: jazz and popular lead sheets carry chord symbols that leave voicing unspecified, swing feel implicit in style markings (*bossa nova*, *shuffle*), and groove/feel annotation that determines rhythmic interpretation.


#### Mid-level derived properties

Performers and automated systems synthesise the above into higher-order estimates:

- **Difficulty** aggregates fingering complexity, hand-position shifts, tempo, and dynamic range into a learner-facing estimate {cite}`ramoneda_predicting_2023`, {cite}`ramoneda_combining_2024`.
- **Technique understanding** (hand-crossing, thumb-under passage) are not directly notated but inferable from score context and instrument knowledge.


## Symbolic Input of Score 

Multiple text-based encodings serve as LLM input for symbolic score understanding. **ABC notation** is the most common: its spec supports dynamics, articulation, slurs, ornaments, and bowing direction, but training corpora rarely populate these fields (TODO cite copora), so models learn pitch and rhythm only. ChatMusician {cite}`yuan_chatmusician_2024` treats ABC as a second language and reaches structural competence in harmony, melodic generation, and music-theory QA; performance interpretation is outside scope. ABC-Eval {cite}`zhao_abceval_2025` benchmarks seven LLMs on ten ABC-based sub-tasks and confirms systematic weakness in performance-marking comprehension.

MIDI encodes pitch, onset, duration, and velocity: it captures expressive timing and dynamics implicitly but carries no slurs, articulation text, fingering, or bowing. MIDI-LLaMA {cite}`liu_midillama_2026` fine-tunes a multimodal LLM on MIDI tokens for captioning, emotion recognition, and QA. Adversarial masked pre-training on MIDI {cite}`zhao_adversarial_2024` improves contextual understanding on music information retrieval tasks. Both remain bounded by MIDI's structural limits.

LilyPond and Humdrum `**kern` {cite}`torras_kern_omr_2024` offer more compact text representations; `**kern` is the most token-efficient among common formats. LilyBench {cite}`spanio_lilybench_2026` evaluates four code-specialised LLMs on LilyPond generation and ten understanding sub-tasks. Models perform well on metadata retrieval, music captioning, and genre recognition, but near zero on bar-counting and error detection. Performance directives (dynamics, articulation, fingering) are not addressed in the benchmark, confirming the same coverage gap as ABC and MIDI.

MusicXML is the richest carrier of performance directives, with dedicated elements for fingering, bowing, dynamics, articulation, ornaments, and text expressions. No published work uses it as direct LLM input: its XML boilerplate expands a single measure into hundreds of tokens, making full-piece input infeasible within standard context windows {cite}`torras_kern_omr_2024`. The format most complete in performance information is, for now, the least accessible to language models.


## Sheet Music Images

Score images add a perceptual challenge on top of the symbolic one: sheet music is visually dense and hierarchically structured, with staves containing measures, measures containing beats, and beats containing notes together with articulation, dynamic, and expression marks that symbolic encodings flatten or discard.

Two directions address the visual backbone problem. MuSViT {cite}`penarrubia_musvit_2026` pre-trains a vision transformer specifically on score images at scale, providing a foundation for downstream recognition tasks. SIM {cite}`qin_sim_2024` pairs score images with MIDI through masked bar-attribute modeling and score-MIDI matching, teaching the model to link what a performer sees on the page with the acoustic events it produces — a correspondence central to score-informed performance analysis.

For score understanding with language models, two granularities have been explored. NotaGPT {cite}`tang_notagpt_2025` operates at the note level, treating each staff element as a vision-language recognition unit and consuming both score images and ABC notation. MuseAgent {cite}`zhao_museagent_2026` takes a measure-wise approach: each measure is segmented, converted to ABC notation via OMR, and passed to the language model, preserving key signature, time signature, and slur extent at the cost of fine-grained note detail.

Two benchmarks quantify the gap. MSU-Bench {cite}`dai_msubench_2026` tests 15 models on 1,800 QA pairs across ABC and PDF score formats for Bach, Beethoven, Chopin, and Debussy, revealing large performance gaps across difficulty levels. SSMR-Bench {cite}`wang_ssmr_2025` generates sheet music reasoning problems from programmatic music-theory rules; models trained on this data transfer to existing theory and composition benchmarks.

Across all these systems, *performance directives remain underrepresented*. Score images contain dynamic markings, slurs, articulation symbols, and text expressions, but no current benchmark evaluates whether a model can read and reason about them in performance terms.

% TODO: consider adding a figure: annotated score excerpt highlighting the performance-relevant markings (dynamics, slurs, articulations) that symbolic encodings omit or flatten

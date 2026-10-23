---
title: Open Problems for Performance Data
authors:
  - name: Huan Zhang
---

# Open problems for performance data

Feedback systems stand or fall on the data they see. MIR has spent two decades chasing clean signals, meaning well-tuned transcriptions, virtuoso recordings and curated recital sets, while filtering out everyone who is not yet good at their instrument. Practice apps, exam platforms, and coaching LLMs need the opposite: imperfect performance, in all its taxonomic and acquisition messiness. Closing that gap is an open problem for the field, not a footnote to modelling.

## Challenge 1. Taxonomy: imperfect is not one thing

"Bad performance" is not a single class. Sight-reading, the longitudinal arc of one learner on one piece, the same passage at different skill levels, children versus adult beginners versus returning amateurs, and professionals starting a new work all corrupt the intended score differently. Taxonomies inherited from expert critique corpora {cite}`matsubara_crocus_2021` and graded assessments {cite}`parmar_pisa_2021`, {cite}`zhang_pianojudge_2024` emphasise conservatory axes of accuracy and expression; singing and non-Western instruments require different categories entirely {cite}`sun_tgcritic_2023`, {cite}`huang_guqin_2020`, {cite}`li_guzheng_2023`. Lerch et al. {cite}`lerch_survey_2019` already separate technical correctness, expressive deviation, and aesthetic quality. Collapsing them into one "good / bad" label produces data that mis-teach any downstream LLM. Synthetic corruptions and simulated mistakes {cite}`morsi_simulating_mistakes_2024` can pad coverage, but they are not a substitute for a sourcing taxonomy that names *which* imperfect regime a recording belongs to.

## Challenge 2. Acquisition: who holds the messy hours?

Research datasets remain small and professional-skewed {cite}`hawthorne_maestro_2019`, {cite}`foscarin_asap_2020`, {cite}`zhang_atepp_2022`. Commercial practice apps hold millions of learner hours behind product walls: Yousician, Simply Piano, Flowkey, Skoove, PianoMarvel and their peers, plus the coaching products discussed in [](./agentic.md) {cite}`roli_ai_music_coach_2026`, {cite}`clefer_piano_app_2025`. Conservatory exams are vast and annotated yet often legally untouchable; social media is plentiful and barely curated. Privacy is acute when many learners are children, and teachers reasonably resist having their craft distilled into a model they do not control.
<!-- harmonic frontier audio -->

A rare counter-example is intentional release of imperfect performance as open training data. Sturm's *A Difficult Christmas* {cite}`sturm_difficult_christmas_2024` and Sturm and Kanhov's *En Svår Jul* {cite}`sturm_en_svar_jul_2025` document unpracticed, unpolished playing, violin after a forty-year gap and piano-violin Christmas repertoire at mixed proficiency, precisely because prompt-based generation systems cannot synthesise music that sounds unproduced. The albums are licensed for machine learning without further permission, and serve as a playful reminder that the musicking research filters out is exactly what learner-facing feedback needs. One researcher's holiday project does not replace a community corpus, but it shows what an open imperfect-performance collection could look like when acquisition ethics and release intent are designed in from the start.


:::{iframe} https://bandcamp.com/EmbeddedPlayer/album=897550287/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/transparent=true/
:class: bandcamp
:width: 100%
:title: Bandcamp player for A Difficult Christmas
:::


:::{iframe} https://bandcamp.com/EmbeddedPlayer/album=2080391717/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/transparent=true/
:class: bandcamp
:width: 100%
:title: Bandcamp player for En Svår Jul
:::

## Challenge 3. Processing: alignment that survives error

Score following, beat tracking, and DTW-style alignment assume the performer is roughly trying to play what is on the page {cite}`nakamura_alignment_2017`. Learners do not: they play wrong notes, restart phrases, skip bars, and sit on a fermata while thinking. Unified models such as RUMAA {cite}`chang_rumaa_2025` argue that alignment and mistake detection must happen at the same level: pipelines that separate "clean alignment" from "error catching" fail exactly on the recordings coaching systems receive. Until alignment is robust to imperfect play, score-grounded feedback {cite}`zhao_museagent_2026` will cite the wrong measure at the worst moments.

## Challenge 4. Description: richer than flattened text

How should imperfect performance be labelled? Not as a single `audio + text → text` channel. The same pitch mistake can be reported at very different depths:

- *You played smoothly, with occasional pitch error.*
- *You played the 4th sixteenth note in the second measure one semitone lower.*
- *You keep missing the sharp on G. Check by playing the A major scale again?*
- *Position your hand a bit towards the inside, so you can reach the F♯ at this tempo without slipping to the white key.*

These are not interchangeable paraphrases. The first is a summary judgment; the second is evidence-linked; the third proposes a diagnostic exercise; the fourth addresses physical technique. Exam and conservatory vocabularies tend to flatten this spectrum onto a narrow axis (*unclear*, *rushed*, *unmusical*), and LLM-generated critiques regress to that mean even harder {cite}`zhang_llaqo_2025`, {cite}`hattie_feedback_2007`. Play a track from either album above and ask what a useful annotation would even look like: scalar grade, note-level error list, technique cue, or something multimodal the performer can contest.

An open imperfect-performance corpus therefore needs sourcing axes (Challenge 2), alignment that survives error (Challenge 3), and descriptors richer than conservatory boilerplate. Without that, feedback systems will keep training on the polished repertoire research already has, while the musicking that matters for learners stays locked, unlabelled, or undefined.

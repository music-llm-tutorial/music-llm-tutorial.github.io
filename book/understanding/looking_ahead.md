---
title: Looking Ahead
authors:
  - name: Zachary Novack
---

Music benchmarks are young. MuChoMusic appeared in 2024, and most of the
benchmarks on the [previous page](#sec-und-landscape) appeared in 2025 or 2026.
General LLM benchmarks have a longer history, and it shows what happens next:
benchmarks get harder, age faster, and become valuable enough to keep private.

(sec-und-aging)=
## Benchmarks age faster than ever

General LLM benchmarks have climbed a ladder of who writes the questions
({numref}`fig-und-ladder`).

:::{figure} ../assets/understanding/ladder.svg
:label: fig-und-ladder
:alt: Four rising steps, labelled by who writes and can answer the questions. Grade school: GSM8K, and GSM1k, a fresh copy on which accuracy drops of up to 8% appear. College: CSyMR draws on college-level music theory exams and r/musictheory. Graduate level: GPQA, 448 questions on which experts reach 65% and skilled non-experts with web access 34%; Humanity's Last Exam, 2,500 questions; FrontierMath, under 2% solved at release. The top step, drawn dashed, is master-level music: questions only expert performers, composers and analysts can write and grade.

Benchmarks climb from grade-school problems to graduate-level questions. For
music, the next step is open.
:::

- **Grade school.** GSM1k is a new set of grade-school math problems "designed
  to mirror the style and complexity" of the widely used GSM8K
  [@zhang_gsm1k_2024]. Some models score lower on the new set, with "accuracy
  drops of up to 8%", while "many models, especially those on the frontier, show
  minimal signs of overfitting". The models that drop most also tend to assign
  higher probability to GSM8K's own examples (Spearman's $r^2 = 0.36$), a sign
  that they may have seen them in training.
- **Graduate level.** GPQA has 448 questions written by domain experts, and
  skilled non-experts with web access answer only 34% of them correctly
  [@rein_gpqa_2024] ([Chapter 1](#sec-eval-experts)). Humanity's Last Exam, "a
  multi-modal benchmark at the frontier of human knowledge", holds 2,500
  questions across dozens of subjects in its current version [@phan_hle_2025], and on FrontierMath, problems
  crafted by expert mathematicians, models solved under 2% at release
  [@glazer_frontiermath_2024].

Music benchmarks are on the same climb. Questions derived from captions
(MuChoMusic) gave way to questions from music-theory forums and college exams
(WildScore, CSyMR), questions written by experts with musical training
(HumMusQA), and complete scores (MSU-Bench). The next step has no benchmark yet:
questions that only expert performers, composers, and analysts can write and
grade, about why a passage works, how to play it, or what to change. A
"PhD-level" music benchmark would test knowledge about music. A *master-level*
benchmark would test musicianship.

(sec-und-moat)=
## Good evaluation is becoming a moat

Each published benchmark leaks into the next round of training data, so the
most trusted evaluations are increasingly private. Scale's SEAL leaderboards
rank models on "curated private datasets that can't be gamed", which "will
remain private and unpublished" [@scale_seal_2024]. FrontierMath was commissioned
and funded by OpenAI: OpenAI owns 300 of its problems and has access to their
statements and solutions, "except for a 50-question holdout set"
[@epoch_frontiermath_2025]. Private evaluation brings its own risks.
@bansal_privateeval_2025 point to the "conflict of interest arising from private
data curators' business relationships with their clients", when one company
both sells training data to a lab and evaluates that lab's models.

MIR has an answer older than LLMs. From its first plenary at ISMIR 2005, MIREX
kept test data with the organizers: because "moving the data to
participants is problematic, MIREX has the participants submit their algorithms
to IMIRSEL for running against the collections" [@downie_mirex_dlib_2006;
@downie_mirex_2008]. A community-run, private test set, where models come to
the data, is exactly what evaluating LLMs now needs. Whoever holds a good music
benchmark that has not leaked holds something labs will want.

(sec-und-next)=
## What to measure next

The evidence in this chapter points to six directions.

1. **Deeper analysis.** Most questions ask for a label. Few ask why a
   progression works, how a form unfolds, or what an arrangement does, the
   questions of the reasoning level in the [overview](#sec-und-problem).
2. **Answers tied to time.** A model should say *when* something happens and be
   checked against the timestamp. Time-aligned positions, such as TMRoPE and
   RoTE, make this possible ([](#sec-und-interleaving)).
3. **Whole songs and stems.** Context lengths now reach full songs, up to 20
   minutes in Music Flamingo [@ghosh_musicflamingo_2026], but most benchmark
   clips are short.
4. **More musical traditions.** Most of the score and symbolic benchmarks in
   this chapter use Western staff notation and theory. NOTA, with score data from three regions of
   the world, is an exception [@tang_notagpt_2025].
5. **Living benchmarks.** Benchmarks generated on demand from symbolic data, as
   in MusICA-MetaBench [@sourada_musica_2026] and SSMR-Bench
   [@wang_ssmr_2025], can be refreshed faster than models can memorize them.
6. **Expert judges.** Open-ended musical answers need graders who know music.
   LLM judges are not yet reliable on music ([](#sec-und-graders)), so expert
   panels, and judges validated against them, are part of the work.

(sec-und-segue)=
## From benchmarks to listeners

A model that aces multiple choice is not yet useful to anyone. A listener does
not ask which of four options describes a track; they ask for "something for a
late-night drive in the rain". The next chapters put music understanding to
work. [Chapter 3](../listening/introduction.md) builds systems for listeners:
annotation, search, and recommendation. [Chapter 4](../composers/00_overview.md)
turns to creators, and [Chapter 5](../performing/intro.md) to learners and
teachers.

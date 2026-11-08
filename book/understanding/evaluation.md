---
title: Evaluating Music Understanding
authors:
  - name: Zachary Novack
---

[Chapter 1](#sec-eval-checks) covers how to evaluate LLMs in general: answers a
program can check, [LLM judges](#sec-eval-judges), confidence intervals, and
[pitfalls](#sec-eval-pitfalls) such as contamination. This page covers what is
specific to music: which benchmarks exist, how many of their questions can be
answered without the music, and what to check when you build one.

(sec-und-grading)=
## Four ways to grade

**Captions.** The model describes a clip, and the description is compared with
a reference caption. Word-overlap metrics reward matching words, but not matching
facts: in {numref}`tbl-caption-metrics` of Chapter 1, a description with no
correct facts gets the same BLEU-4 score as one with two. An LLM judge can compare meaning instead, but it must
be given the facts itself.

**Multiple choice.** Here the model picks one of a few options. This is the dominant
format, because it is gradable by construction. For example, MuChoMusic asks 1,187 four-option
questions about 644 tracks from MusicCaps and the Song Describer Dataset, in a
knowledge category (melody, harmony, metre and rhythm, instrumentation, and
more) and a reasoning category (mood, genre, lyrics, cultural context, and more)
[@weck_muchomusic_2024]. The weak point of the format is the options: if the
wrong ones are implausible or leak information about the right answer, strong performance
here cannot disentangle the scenario when LLMs are able to exploit this.

**Labels/Classes.** The model outputs a label, such as a genre, a set of instruments, or
a time signature, and the label is scored against an annotation with precision,
recall, and F1 [@lin_factual_2026]. CMI-Bench recasts 14 MIR tasks on 20
datasets as instructions in this way, so audio LLMs can be compared with
specialist MIR models on the same annotations [@ma_cmibench_2025].

**Downstream tasks.** The model does some other task people need, and the result is
directly on the task. MusiCRS links 477 Reddit threads asking for music recommendations, with
3,589 musical entities, to the tracks discussed, and tests models with the
audio only, the query only, or both [@surana_musicrs_2025]. It finds "optimal
performance frequently occurring in single-modality settings rather than
multimodal configurations". [Chapter 3](../listening/introduction.md) covers
recommendation and search.

(sec-und-landscape)=
## The benchmark landscape

{numref}`tbl-und-benchmarks` lists the benchmarks discussed in this chapter.

:::{table} Music understanding benchmarks discussed in this chapter. Sizes are as stated in each paper.
:label: tbl-und-benchmarks
:align: left

| Benchmark | Input | Format | Size | Questions from | Venue |
|---|---|---|---|---|---|
| MuChoMusic [@weck_muchomusic_2024] | audio | multiple choice, 4 options | 1,187 questions, 644 tracks | MusicCaps and Song Describer captions | ISMIR 2024 |
| MMAU [@sakshi_mmau_2025] | audio: speech, sound, music | multiple choice | 10,000 questions, 27 skills | human annotation | ICLR 2025 |
| MMAR [@ma_mmar_2025] | audio, including mixtures | question answering | 1,000 | curated; signal, perception, semantic, and cultural layers | preprint 2025 |
| MMAU-Pro [@kumar_mmaupro_2025] | audio | question answering | 5,305 instances | — | preprint 2025 |
| CMI-Bench [@ma_cmibench_2025] | audio | MIR tasks as instructions | 14 tasks, 20 datasets | existing MIR annotations | ISMIR 2025 |
| RUL-MuChoMusic [@zang_listening_2025] | audio | multiple choice | MuChoMusic questions | distractors rewritten and filtered by perceptual index | ISMIR 2025 |
| MUSE [@carone_muse_2025] | audio | perception tasks | 10 tasks | — | preprint 2025 |
| BASS [@jang_bass_2026] | audio | questions on structure and semantics | 2,658 questions, 12 tasks | — | preprint 2026 |
| HumMusQA [@weck_hummusqa_2026] | audio | multiple choice, 4 options | 320 questions, 13 dimensions | written by experts with musical training | NLP4MusA 2026 |
| Factual comprehension [@lin_factual_2026] | audio | labels, scored with F1 | 6 tasks, 3 datasets | MusicNet, FMA, OverClocked ReMix annotations | ISMIR 2026 |
| MEX [@bjare_mex_2026] | audio and symbolic | tests of musical expectation models | a suite of tasks | repetition, segment boundaries, and electrophysiological responses | ISMIR 2026 |
| WildScore [@mundada_wildscore_2025] | score image | multiple choice | 807 questions | r/musictheory, 2012–2022 | EMNLP 2025 |
| MusiXQA [@chen_musixqa_2025] | score image | question answering | synthetic scores | generated with MusiXTeX | preprint 2025 |
| MSU-Bench [@dai_msubench_2026] | ABC text or score PDF | open questions | 1,800 questions, 150 scores | human-curated | ACL 2026 |
| MusicTheoryBench [@yuan_chatmusician_2024] | ABC text | multiple choice, 4 options | 372 questions | music knowledge and reasoning | ACL Findings 2024 |
| CSyMR [@wang_csymr_2026] | \*\*kern text | multiple choice | 126 questions | r/musictheory and college exams | SIGIR 2026 |
| SSMR-Bench [@wang_ssmr_2025] | text and images | question answering | 1,600 + 1,600 | generated from theory rules | preprint 2025 |
| MusICA-MetaBench [@sourada_musica_2026] | audio, score images, symbolic | templated questions | any piece with MusicXML | generated from MusicXML | preprint 2026 |
| MusiCRS [@surana_musicrs_2025] | audio and conversation | recommendation | 477 threads | Reddit | preprint 2025 |
:::

Two trends stand out. Benchmarks are moving from questions derived from existing
captions and annotations toward questions written or curated by people **with
musical training**, and toward questions generated from symbolic data, whose
answers can be computed and vertified.

(sec-und-score-findings)=
## What the score benchmarks show

Any VLM can be given a score image ([](#sec-und-score-images)), and the score
benchmarks in {numref}`tbl-und-benchmarks` show that reading the notation is
the weak step.

- **MusiXQA** renders synthetic scores with MusiXTeX and asks questions about
  their notes, text, layout, and chords [@chen_musixqa_2025]. On optical music
  recognition, GPT-4o reaches 4.0 on the paper's accuracy measure, against 68.4
  for a Phi-3-Vision model fine-tuned on the dataset.
- **WildScore** takes 807 questions about score images that people posted on
  the r/musictheory subreddit between 2012 and 2022 [@mundada_wildscore_2025].
  The best model, GPT-4.1-mini, scores 68.31% with the image and 65.76% without
  it. Several open VLMs score *higher* without the image: LLaVA goes from 32.97%
  with it to 37.16% without, and InternVL from 39.34% to 45.54%. A direct
  perception probe, with simple questions such as which clef is shown or how
  many symbols of a kind appear, on 50 images, finds that GPT-4.1-mini perceives
  the relevant symbols correctly in 52% of cases, InternVL in 38%, and LLaVA in
  26%.
- **MSU-Bench** asks 1,800 questions about 150 complete scores by Bach,
  Beethoven, Chopin, Debussy, and others, at four levels: onset information,
  notation and notes, chords and harmony, and texture and form
  [@dai_msubench_2026]. It gives LLMs the score as ABC text and VLMs the score as
  a PDF. The best zero-shot result with ABC is 49.44%; the best with images is
  24.22%. The authors name localization, finding the right bar, as one of "two
  persistent challenges" for VLMs.
- **SSMR-Bench** generates sheet-music questions from music-theory rules as
  programs, with 1,600 text and 1,600 visual questions [@wang_ssmr_2025]. Because
  the answers are computed, they can serve as rewards: after reinforcement
  learning, Qwen2.5-VL-7B rises from 41.81 to 70.56 on the visual questions.

The WildScore result leads to the next question: when the image adds nothing,
the model answers from the question alone.

(sec-und-needs-music)=
## Does the question need the music?

A benchmark for music understanding, theoretically, should contain questions that cannot be
answered without the music. In the notation of the
[overview](#sec-und-problem), a good question has

$$
p_\theta(a \mid m, q) \gg p_\theta(a \mid q),
$$

where $a$ is the correct answer (that is, conditioning on the music should make the chance of getting the answer correct higher). Many questions fail this test. A question such
as "Which instrument starts the piece?" with the options *acoustic guitar*,
*synthesizer*, *rueful tune*, and *vocals* can be narrowed down without hearing
anything, as "rueful tune" is not an instrument at all, and a non-hearing LLM can use its general world knowledge to guess that many songs start with acoustic guitar, which would be correct!

"Are you really listening?" measured this for MuChoMusic
[@zang_listening_2025]. Text-only LLMs, given only the question and the options,
"achieve surprisingly high accuracy of up to 56.4%, much higher than chance".
Three text-only models score above three of the five audio LLMs shown
({numref}`fig-und-muchomusic`).

:::{figure} ../assets/understanding/muchomusic-text-only.svg
:label: fig-und-muchomusic
:alt: Horizontal bar chart of MuChoMusic accuracy. Audio LLMs: Qwen2-Audio 61.5%, Audio Flamingo 2 56.5%, Qwen-Audio 51.4%, MU-LLaMA 32.4%, MusiLingo 21.1%. Text-only LLMs that never hear the music: Llama-3.1-70B 56.4%, DeepSeek-V3 56.3%, Qwen2.5-7B 53.3%. Chance with four options is 25%. Three text-only models score above three of the five audio LLMs.

MuChoMusic accuracy of audio LLMs and of text-only LLMs that see only the
question and options. Values are read from the figures of
@zang_listening_2025.
:::

This paper then shows how to rebuild the benchmark, particular in terms of answer options. It defines a *perceptual index* (PI) for a
question $q$ with correct answer $Y$ and distractors $D$,

$$
\mathrm{PI}(q, Y, D) = \frac{p_\text{text}(D \mid q)}{p_\text{text}(Y \mid q)},
$$

where $p_\text{text}$ comes from a text-only LLM, Qwen 2.5 7B. A high PI means
the text-only model prefers the wrong answers, so it needs the music to get the
question right. DeepSeek-V3 writes new candidate distractors, and the PI decides
which to keep. On the resulting benchmark, RUL-MuChoMusic, "text-only LMs
perform at near-chance levels". The paper also replaces the audio with noise:
the audio LLMs fall, and "Qwen2-Audio showed the most dramatic performance
degradation", but they stay above chance ({numref}`fig-und-noise`).

The PI needs only a text LLM's probabilities for each option. One way to compute
it, taking $p_\text{text}(D \mid q)$ as the total probability of the
distractors:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen2.5-7B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype="auto", device_map="auto")

def option_logprob(question, option):
    """log p_text(option | question): sum of the option's token log-probabilities."""
    prompt = f"Question: {question}\nAnswer:"
    prompt_ids = tokenizer(prompt, return_tensors="pt").input_ids
    full_ids = tokenizer(prompt + " " + option, return_tensors="pt").input_ids
    with torch.no_grad():
        logits = model(full_ids.to(model.device)).logits[0, :-1]
    logprobs = torch.log_softmax(logits.float(), dim=-1)
    targets = full_ids[0, 1:].to(model.device)
    token_lp = logprobs[torch.arange(len(targets)), targets]
    return token_lp[prompt_ids.shape[1] - 1:].sum().item()

def perceptual_index(question, correct, distractors):
    """PI = p_text(D | q) / p_text(Y | q), with D the set of distractors."""
    logp = torch.tensor([option_logprob(question, o) for o in [correct] + distractors])
    return torch.exp(torch.logsumexp(logp[1:], dim=0) - logp[0]).item()

perceptual_index("Which instrument starts the piece?",
                 "acoustic guitar", ["synthesizer", "rueful tune", "vocals"])
```

The same problem appears in other representations. WildScore's open VLMs often score
higher *without* the score image (above), and HumMusQA
reports that a model "exploits cues in the questions", with Gemini 2.5 Flash
reaching 42.7% with no audio against 25% chance [@weck_hummusqa_2026]. For
images, DatBench queries VLMs with only the text of each question and discards
"any sample solved by even a single model without visual input"; it reports
that such samples make up as much as 70% of some evaluations
[@datologyai_datbench_2026].

(sec-und-graders)=
## Can we trust the grader?

A metric should change when the music changes. @lin_factual_2026 swapped each
clip for a random different one and found that text-similarity metrics on the
models' free-text answers "do not materially change". A metric that cannot tell
the right clip from a wrong one cannot measure listening. Their fix is to ask
for labels and score them with precision, recall, and F1.

LLM judges raise the same question. @fang_gptjudge_2024 asked GPT to find errors
in annotations for three MIR tasks. It detected them with an accuracy of 65.20% for beat tracking, 64.80% for chord
extraction, and 59.72% for key estimation, and it did better when the prompt
gave it more information about the musical concepts involved. A judge is a model
too, and on music it should be validated against expert labels before its
verdicts are trusted ([Chapter 1](#sec-eval-judges)).

(sec-und-shortcuts)=
##  Contamination


Many music benchmarks draw on public sources, such as Reddit
threads, published captions, and well-known recordings, and a model may have
read the questions, or discussions of them, during pre-training
([Chapter 1](#sec-eval-pitfalls)). The GPT-3 paper already found that some
benchmark test sets overlapped with its training data
[@brown_gpt3_2020]. Benchmarks built from posts dated before a model's training
cutoff deserve the most care. The [next page](./looking_ahead.md) returns to
this.


(sec-und-checklist)=
## A checklist for a music benchmark

:::{important} Before you trust a music benchmark
- **Text-only baseline.** Run a strong text LLM on the questions and options
  alone. Report its accuracy next to chance.
- **Masked input.** Rerun with noise, silence, and a random other clip in place
  of the music ([](#sec-und-masking)).
- **Distractors.** Check that wrong options are plausible without the music,
  for example with the perceptual index.
- **Metric sensitivity.** Check that the score changes when the music changes.
- **Representation consistency.** Where possible, ask the same question with
  audio and with a symbolic version, to separate perception from reasoning
  ([](#sec-und-diagnostic)).
- **Judges.** Validate any LLM judge against expert labels on a sample.
- **Sources and dates.** Record where questions came from and when, and keep a
  private held-out set.
- **Size.** Compute how many questions the comparison you care about needs.
:::

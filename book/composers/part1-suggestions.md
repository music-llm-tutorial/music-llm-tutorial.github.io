---
title: "Part 1: Music Making Through Suggestions"
subtitle: Chapter 4 | LLMs for Creators
short_title: "Part 1 · Suggestions"
authors:
  - name: Yewon Kim
---

(part1-suggestions)=

:::{image} ../assets/composers/overview/icon-part1-suggestions.png
:alt: Illustration of a composer writing a score at a drafting table.
:width: 160px
:align: center
:::

The most familiar way to work with a generative model is to ask it for something: a chord progression, a melody, a drum loop. For a creator, however, the useful output is rarely a finished piece. It is a *suggestion*: material they can audition, edit, combine with their own ideas, or throw away. This part looks at how to build suggestion systems that support, rather than replace, the creator's own process.

(what-matters-to-creators)=
## What matters to creators

Studies of songwriters and practising musicians working with AI point to four dimensions of human creativity that a suggestion system should protect [@kim2025amuse; @krol2025needs; @mccormack2023prompts]:

:::{table} Important dimensions of human creativity.
:label: tbl-creativity-dimensions

| Dimension | The creator asks… |
| --- | --- |
| **Agency** | Am I driving the creative direction? |
| **Control** | Can I make the changes I want? |
| **Exploration** | Can I try out different ideas and discover new possibilities? |
| **Ownership** | Do I feel that this work is truly mine? |
:::

A one-shot "text-to-song" interface tends to fail on all four: the prompt is the only input, the output is a finished mixture that is hard to change, and the creator may not feel that the result is theirs [@mccormack2023prompts].

(design-principles)=
## Design principles for suggestion systems

To protect agency, control, exploration, and ownership, suggestions should be [@huang2020aisongcontest; @kim2025amuse; @krol2025needs; @mccormack2023prompts]:

::::{grid} 1 1 2 2

:::{card} Steerable
Suggestions should be easy to guide and redirect.
:::

:::{card} Modular & editable
Suggestions should be adaptable musical building blocks.
:::

:::{card} Diverse
Suggestions should offer distinct creative possibilities.
:::

:::{card} Contextual
Suggestions should connect new ideas with work in progress.
:::

::::

The rest of this part looks at three families of systems through the lens of these principles.

## Overview: approaches to AI-assisted music creation

:::{table} Three families of suggestion systems, with the examples discussed in this chapter.
:label: tbl-suggestion-approaches

| Family | What it does | Examples |
| --- | --- | --- |
| **Compositional ideas** | Suggest editable notes and chords in symbolic form (e.g., MIDI), or lyrics, to assist songwriting | [MIDI-LLM](https://arxiv.org/abs/2511.03942) (ISMIR'26), CoLyricist (IUI'26), [Amuse](https://arxiv.org/abs/2412.18940) (CHI'25) |
| **Audio generation and editing** | Generate and reshape audio through musical examples and editing instructions | [Stemphonic](https://arxiv.org/abs/2602.09891) (ICASSP'26), [TRIA](https://arxiv.org/abs/2509.15625) (ISMIR'25), [Music ControlNet](https://arxiv.org/abs/2311.07069) (TASLP'24) |
| **Recovering editable structure** | Break down musical material into editable musical building blocks | [D-Composer](https://arxiv.org/abs/2610.22535) (ISMIR'26), [Decomposer](https://arxiv.org/abs/2607.01849) (2026) |
:::

More system overviews are available on the tutorial website.

---

## Compositional ideas

Symbolic suggestions (chords, melodies, lead sheets) are naturally **modular and editable**: a creator can drag a chord, change a note, or keep only the first two bars. The two systems below generate such suggestions from different kinds of input.

### Amuse: from multimodal inspiration to chords

Songwriting is often driven by inspirations that are not musical at all: a photo, a line of a story, the feeling of a song someone else wrote. **Amuse** transforms multimodal (image, text, audio) inputs into chord progressions that can be seamlessly incorporated into songwriters' creative process [@kim2025amuse].

:::{figure} ../assets/composers/part1/amuse-interface.png
:label: fig-amuse-interface
:alt: The Amuse interface: an uploaded photo of a dog, a text description, a list of extracted music keywords such as mellow, acoustic and indie pop, and several generated chord progressions below, next to a Hookpad editor.
:width: 55%

The Amuse interface. A songwriter provides an inspiration (here, an image), sees the music keywords Amuse derives from it, and receives several chord progressions that can be placed into the song in the editor.
:::

The key technical challenge is that there is no dataset of paired multimodal inputs and chords. Amuse addresses this in two steps ([](#fig-amuse-pipeline)):

1. **Music keyword generation.** A multimodal LLM converts a text or image input into music keywords (e.g., *mellow*, *acoustic*, *indie pop*).
2. **Chord generation.** An LLM proposes chord progressions for these keywords. Because LLM-generated chords are relevant but often musically incoherent, a *unimodal* chord model trained on real music is used to filter them (rejection sampling), keeping only progressions that are both relevant and musical.

Audio inputs take a separate path: a chord transcription pipeline extracts the progression directly from the recording.

:::{figure} ../assets/composers/part1/amuse-pipeline.png
:label: fig-amuse-pipeline
:alt: Amuse pipeline: text and image inputs go through a music keyword generation pipeline and then a chord generation pipeline; audio input goes through a chord transcription pipeline; both produce chord progressions.
:width: 85%

The Amuse pipeline. Text and image inputs are turned into music keywords and then chords; audio inputs are transcribed.
:::

In a within-subjects study with 10 songwriters writing 8-bar choruses, Amuse was used alongside Aria, an existing chord and melody assistant in Hookpad. Participants felt more guided and better aligned with their creative goals than with Aria alone, and reported enhanced agency and creativity. Although Amuse was designed for the early stages of songwriting, participants used it throughout the process [@kim2025amuse]. The paper received a Best Paper Award at CHI 2025.

:::{iframe} https://www.youtube.com/embed/FbFD3B2OCo8
:label: vid-amuse
:width: 100%

Amuse in action. More at [yewon-kim.com/amuse](https://yewon-kim.com/amuse).
:::

### MIDI-LLM: text-to-MIDI by adapting an LLM

**MIDI-LLM** generates editable musical suggestions from text instructions, existing MIDI, or both [@wu2026midillm]. Inside Hookpad, a real-world songwriting tool, creators can use MIDI-LLM to:

- generate melodies and/or chords,
- fill in or extend an existing passage, and
- guide generation with musical attributes.

:::{figure} ../assets/composers/part1/midi-llm-tasks.png
:label: fig-midi-llm-tasks
:alt: MIDI-LLM tasks: text controls (key, genre, mood tags and music-theory attribute levels such as chord difficulty, chord-melody tension and melody difficulty) produce MIDI; MIDI with a missing span is infilled; text plus MIDI (e.g., bass motion level 7 of 7) extends the passage by 4 bars.
:width: 70%

MIDI-LLM tasks in a songwriting workflow: text-to-MIDI, MIDI infilling, and text+MIDI continuation. Text controls include tags (key, genre, mood) and music-theory attribute levels (e.g., chord difficulty, chord–melody tension, melody difficulty).
:::

:::{figure} ../assets/composers/part1/midi-llm-hookpad.jpg
:label: fig-midi-llm-hookpad
:alt: Screenshot of Hookpad with a lead sheet: a melody track and a chord track with Roman-numeral chords I, IV, V, vi.
:width: 80%

MIDI-LLM inside Hookpad. ▶ [Watch the demo video](https://drive.google.com/file/d/15_NcMR1mWtpr0MMiC5SrB2YBhN95Kt1N/view).
:::

MIDI-LLM is less a new architecture than a **recipe** for turning a text LLM into a text-to-MIDI model.

**Recipe 1: vocabulary extension.** Start from a pretrained text LLM (Llama 3.2, 1B parameters), copy its existing weights, and add new tokens for MIDI. Each note becomes three tokens: onset time, note duration, and instrument–pitch ([](#fig-midi-llm-vocab)). The embedding table of the new model is simply the LLM's text embeddings stacked on top of the new MIDI embeddings:

```{math}
:label: eq-midi-llm-embedding
\mathbf{E}_{\text{MIDI-LLM}} := \begin{bmatrix}\mathbf{E}_{\text{LLM}}^{\top} & \mathbf{E}_{\text{AMT}}^{\top}\end{bmatrix}^{\top} \in \mathbb{R}^{(|\mathcal{V}_{\text{LLM}}| + |\mathcal{V}_{\text{AMT}}|) \times D}
```

where $\mathcal{V}_{\text{AMT}}$ is the MIDI vocabulary of the Anticipatory Music Transformer and $D$ is the LLM's hidden size. Because the model keeps the original LLM's parameter structure, it runs directly on optimized LLM inference stacks such as vLLM.

:::::{grid} 1 1 2 2

::::{figure} ../assets/composers/part1/midi-llm-vocabulary-extension.png
:label: fig-midi-llm-vocab
:alt: Vocabulary extension: the LLM's weights and text tokens are copied into MIDI-LLM, which adds new MIDI tokens; one note (onset time 10.2 s, duration 120 ms, Piano C4) equals three tokens.

Recipe 1: vocabulary extension. One note = three tokens.
::::

::::{figure} ../assets/composers/part1/midi-llm-two-stage-training.png
:label: fig-midi-llm-two-stage
:alt: Two-stage training: stage 1 continued pretraining on music-adjacent text and standalone MIDIs; stage 2 text-to-MIDI finetuning on paired text and MIDIs.

Recipe 2: two-stage training.
::::

:::::

**Recipe 2: two-stage training.** (i) *Continued pretraining* on unimodal data: music-adjacent text (so the model learns how people talk about music) and standalone MIDI files (so it learns music). (ii) *Supervised finetuning* on paired text–MIDI data, which connects the two. To match real songwriting workflows, the model is further finetuned on the TheoryTab dataset for text-conditioned lead-sheet (melody + chords) generation and infilling.

The MIDI-LLM paper reports that the model outperforms the recent Text2midi model in both text control and musical quality. An in-the-wild blind study with 58 Hookpad users and 4,002 generated outputs found that MIDI-LLM had the highest acceptance rate for zero-to-one lead-sheet generation, compared with baselines without text control or without LLM pretraining [@wu2026midillm].

:::{tip} How these map to the design principles
Both systems produce **modular, editable** symbolic output that lands directly in the creator's editor. Amuse makes suggestions **steerable** through inspirations and keywords; MIDI-LLM through text tags and attribute levels. MIDI-LLM's infilling and continuation make its suggestions **contextual** to the song in progress.
:::

---

## Audio generation by time-varying controls

Text-to-music models are now capable of producing realistic audio, but text mostly controls **global** traits such as genre and mood. A creator usually knows more than that: how the melody should move, where the music gets louder, what the groove should be. **Time-varying control** models add controls that change over time, such as melody, dynamics, and rhythm [@wu2024musiccontrolnet; @garcia2025sketch2sound; @oreilly2025tria].

:::{figure} ../assets/composers/part1/time-varying-controls.png
:label: fig-time-varying-controls
:alt: Controls for audio generation: a global text prompt "funky, tight drums" above three time-varying curves for melody, dynamics, and rhythm drawn along a time axis.
:width: 60%

Text is a global control; melody, dynamics, and rhythm are time-varying controls.
:::

Although these models differ in architecture, they share a recipe:

1. **Extract controls from the training audio.** Melody, loudness, rhythm, or other signals are computed automatically from each training example, so no manual labels are needed.
2. **Train a generator** conditioned on a text or audio prompt *and* the time-varying controls.
3. **At use time, a user controls generation with a gesture**, such as humming, tapping, or drawing a curve, from which the same controls are extracted.

The gesture is what makes this family creator-friendly: it is a fast, embodied way to **steer** generation that does not require describing music in words.

### TRIA: The Rhythm In Anything

People often sketch a drum idea by tapping on a table or beatboxing. **TRIA** turns a tapped or beatboxed rhythm into a full drum recording in a chosen drum sound [@oreilly2025tria].

- **Inputs.** *Rhythm*: a tap or beatbox recording. *Timbre*: a short drum recording with the desired sound.
- **Control.** Rhythm, represented as two frequency bands (low and high) over time.

:::{figure} ../assets/composers/part1/tria-overview.png
:label: fig-tria-overview
:alt: TRIA overview: a timbre prompt ("I want this drum sound...") plus a rhythm prompt ("...playing this rhythm") produces an output drum recording, shown as spectrograms with rhythm features below.
:width: 75%

TRIA combines the timbre of one recording with the rhythm of another.
:::

:::{figure} ../assets/composers/part1/tria-demo.jpg
:label: fig-tria-demo
:alt: Video still of a hand tapping on a wooden table.
:width: 60%

Tapping a rhythm on a table to drive TRIA. ▶ [Watch the demo video](https://drive.google.com/file/d/1NtMc6OYP_T5V6sEQezPnRCCrYtDpao6r/view). More examples on the [project page](https://therhythminanything.github.io/).
:::

TRIA follows the shared recipe step by step.

**Step 1: extract controls from the training audio.** TRIA computes a spectrogram (STFT) of the drum recording and splits its energy *equally* into a low and a high band, giving a two-band rhythm control over time. The representation is deliberately coarse: it captures *when* low and high sounds happen, not *what* they sound like, so a table tap and a kick drum can produce similar features.

:::{figure} ../assets/composers/part1/tria-step1-rhythm-features.png
:label: fig-tria-step1
:alt: A drum spectrogram split by a dashed line into high and low bands, converted by STFT into a sequence of two-band rhythm features.
:width: 95%

Step 1: split spectral energy equally into low and high bands to obtain a two-band rhythm control.
:::

**Step 2: train a generator.** For each training recording, TRIA extracts (i) acoustic tokens with a neural audio codec (DAC) and (ii) the rhythm features from the same recording. The rhythm audio is augmented (noise, filtering, pitch and phase shifts, equalization) so the model generalizes to rhythms recorded with arbitrary sound sources. The model is a masked transformer trained with **masked token prediction**: it must recover masked acoustic tokens, taking *timbre* from the unmasked tokens and *timing* from the rhythm features.

:::{figure} ../assets/composers/part1/tria-step2-training.png
:label: fig-tria-step2
:alt: Training: a drum recording is encoded by DAC into acoustic tokens and by STFT into rhythm features; a span of tokens is masked and predicted from the unmasked tokens and the rhythm features.
:width: 100%

Step 2: masked token prediction. Timbre comes from the unmasked tokens; timing comes from the rhythm features.
:::

**Step 3: control generation with a gesture.** At inference time, the tokens of the timbre prompt are fixed as a *prefix*, and the model predicts a fully masked *suffix* conditioned on the rhythm features of the user's tap or beatbox. The predicted tokens are decoded to audio by DAC.

:::{figure} ../assets/composers/part1/tria-step3-inference.png
:label: fig-tria-step3
:alt: Inference: the timbre prompt is encoded by DAC as a prefix; the rhythm prompt is converted by STFT into rhythm features for a masked span; the model fills in the masked span and DAC decodes the output audio.
:width: 100%

Step 3: fix the timbre prompt as a prefix and predict a masked suffix conditioned on the rhythm prompt.
:::

According to the paper, a TRIA model trained on less than 10 hours of publicly available drum data generates faithful realizations of rhythmic gestures across a wide range of timbres, zero-shot [@oreilly2025tria].

---

## Recovering editable structure: music decomposition

The previous systems generate *new* material. A complementary way to help creators is to take material they already have, such as a recording or a MIDI file, and **break it down into editable musical building blocks**. Once a drum loop becomes individual hits, or a MIDI file becomes a short program, the creator can edit it at the level they think in.

:::{table} Examples of music decomposition.
:label: tbl-decomposition

| Input material | Output building blocks | Edit in | Reference |
| --- | --- | --- | --- |
| Drum recording | Individual hits + their sounds | DAW | D-Composer (ISMIR'26) |
| MIDI | Program (code) | Live-coding editor | Decomposer (2026) |
:::

Paired data (a recording together with its building blocks) rarely exists. Both systems below therefore use the same recipe:

1. **Synthesize** training pairs by rendering known building blocks into material.
2. **Train** a language model to predict the building blocks from the material.
3. **Run** it on real material and let the creator edit the predicted blocks.

### D-Composer: drum recordings → playable sound events

**D-Composer** decomposes a drum recording into a playable piano roll of sound events with a single language model [@oreilly2026dcomposer]. Its output has two parts: a **transcription** (onset times and drum classes such as kick, snare, clap, hi-hat) and the **sound events** themselves (the isolated audio of each distinct hit). Together, they can be loaded into a DAW and played or rearranged like any sampled drum kit.

:::{figure} ../assets/composers/part1/d-composer-overview.png
:label: fig-dcomposer-overview
:alt: D-Composer: a drum recording is converted into predicted tokens, which become a piano roll with rows for hi-hat, clap/snare and kick (transcription) plus an isolated audio sample for each row (sound events).
:width: 50%

D-Composer predicts both a transcription (onsets + classes) and the isolated sound of each event.
:::

:::{figure} ../assets/composers/part1/d-composer-demo.jpg
:label: fig-dcomposer-demo
:alt: Demo interface comparing D-Composer with a baseline: each shows a piano roll of predicted drum events whose one-shots can be played.
:width: 85%

Comparing decompositions of the same input mixture. ▶ [Watch the demo video](https://drive.google.com/file/d/14555E4WHHErU8Bimw_cK7pRGf3eZUlBo/view).
:::

Following the recipe:

1. **Synthesize.** Take a MIDI drum score and a set of one-shot drum samples, render the score with the samples, and mix the result. Because the score and samples are known, every synthetic recording comes with its exact building blocks.
2. **Train.** An encoder–decoder language model learns to predict the drum events, including the sound of each one-shot, from the synthetic recording.

:::{figure} ../assets/composers/part1/d-composer-pipeline.png
:label: fig-dcomposer-pipeline
:alt: D-Composer pipeline: excerpts from a MIDI drum score library and a drum one-shot library are matched, rendered, sequenced and mixed into a synthetic drum recording; an encoder-decoder model predicts class and onset tokens and acoustic tokens, which are rendered into isolated one-shot audio at inference time.
:width: 95%

D-Composer training data synthesis (top) and model (bottom).
:::

### Decomposer: MIDI → live-coding programs

A MIDI file stores every note individually. A musician, however, thinks in *patterns*: "this bass line repeats four times, then moves up a step". **Decomposer** decompiles MIDI into a program in Strudel, a live-coding language, so a creator can edit patterns and repetition instead of individual notes [@kim2026decomposer].

:::{figure} ../assets/composers/part1/decomposer-demo.jpg
:label: fig-decomposer-demo
:alt: Left: a MIDI piano roll. Right: an equivalent short Strudel program defining chords and voicings.
:width: 85%

A MIDI piano roll (left) and the Strudel program Decomposer recovers (right). ▶ [Watch the demo video](https://drive.google.com/file/d/1Fb09L2QwhyP1dHrKFqo5HeXQNdg0Iay0/view).
:::

The task has two difficulties. Strudel is a low-resource language with almost no naturally paired (MIDI, code) data, and optimizing only for faithful reconstruction can collapse to unreadable note-by-note transliteration. Decomposer handles both with the decomposition recipe:

1. **Synthesize.** A frontier LLM writes Strudel programs; the programs are cleaned (regex/AST checks) and executed in the Strudel runtime to render MIDI. This produces Strudel-Synth, a corpus of 21,174 (Strudel, MIDI) pairs.
2. **Train** in two stages. *Supervised finetuning* on Strudel-Synth teaches the model to write valid, idiomatic Strudel. *Reinforcement learning* on unpaired MIDI then optimizes decompilation directly, rewarding sampled programs for both **faithfulness** (does the rendered MIDI match the input?) and **readability** (is the code structured rather than a note dump?).

:::{figure} ../assets/composers/part1/decomposer-data-synthesis.png
:label: fig-decomposer-data
:alt: Data synthesis: prompts are given to Claude Opus 4.6 to generate noisy Strudel programs, which are cleaned with RegEx/AST and rendered by the Strudel runtime into MIDI.
:width: 50%

Step 1: synthesize (Strudel, MIDI) pairs with a frontier LLM, clean the programs, and render them to MIDI.
:::

:::{figure} ../assets/composers/part1/decomposer-training.png
:label: fig-decomposer-training
:alt: Training: stage 1 supervised fine-tuning of a policy LLM on Strudel-Synth pairs; stage 2 reinforcement learning on unpaired MIDI, where generated Strudel code is rendered by the runtime and scored with faithfulness and readability rewards.
:width: 100%

Step 2: supervised fine-tuning, then reinforcement learning with faithfulness and readability rewards.
:::

The paper reports that an 8B open-weight model trained this way reconstructs MIDI far more faithfully than closed-weight frontier LLMs, which often write plausible-looking but poorly grounded Strudel, while keeping comparable readability [@kim2026decomposer].

---

## Takeaways

:::{important} Suggestions that keep the creator in charge
- **Steerable:** inspirations and keywords (Amuse), text tags and attribute levels (MIDI-LLM), and gestures such as tapping (TRIA) let creators guide generation in the terms they think in.
- **Modular & editable:** chords, lead sheets, isolated drum hits, and code are building blocks that a creator can keep, change, or discard.
- **Diverse:** offering several options (e.g., multiple chord progressions in Amuse) supports exploration rather than a single "answer".
- **Contextual:** infilling and continuation (MIDI-LLM) and decomposition of the creator's own material (D-Composer, Decomposer) connect new ideas to work in progress.
:::

Across very different models, two recipes recur. For **controllable generation**, extract controls automatically from training audio and let users supply the same controls with a gesture. For **decomposition**, render known building blocks into synthetic material and train a model to invert the rendering. Both sidestep the lack of paired data, which is one of the most common obstacles in building creator-facing music AI.

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

A musician might ask a generative model for a chord progression, a melody, or a drum loop, then keep only a small part of what it produces. The suggestion gives them something to try: they can listen, make changes, and see how it fits with their own ideas. This part examines systems designed for that kind of exchange, from generating new material to making existing recordings easier to edit.

(what-matters-to-creators)=
## What matters to creators

Drawing on studies of songwriters and musicians working with AI, we focus on four aspects of the creative experience: agency, control, exploration, and ownership [@kim2025amuse; @krol2025needs; @mccormack2023prompts]. While these are not an exhaustive account of creativity, they offer a useful starting point for discussing how suggestion systems support creators.

:::{table} Important dimensions of human creativity.
:label: tbl-creativity-dimensions

| Dimension | The creator asks… |
| --- | --- |
| **Agency** | Am I driving the creative direction? |
| **Control** | Can I make the changes I want? |
| **Exploration** | Can I try out different ideas and discover new possibilities? |
| **Ownership** | Do I feel that this work is truly mine? |
:::

*Agency* concerns the creator’s role in directing the work: deciding what to pursue, when to seek help, and which suggestions to use.

*Control* concerns the ability to carry out those decisions; for example, changing a harmony while keeping the melody, or revising only part of a phrase.

*Exploration* involves trying alternatives and discovering possibilities that were not part of the initial plan. A suggestion can be useful even when it is not used directly, if it prompts a new idea or helps the creator hear their material differently.

*Ownership* refers here to the feeling that the work is one’s own. This can come from contributing ideas, shaping the material, and recognising one’s own choices in the result.

(design-principles)=
## Design considerations for suggestion systems

How can suggestion systems support these aspects of creativity while leaving room for creators to work in their own ways? There are many possible approaches. Here, we focus on four design considerations drawn from prior work: whether suggestions are steerable, modular and editable, diverse, and contextual [@krol2025needs; @huang2020aisongcontest;  @kim2025amuse; @mccormack2023prompts]. We use these to examine how different systems help creators guide, explore, and revise musical ideas.

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

:::{table} Three approaches to musical suggestions and representative systems.
:label: tbl-suggestion-approaches

| Family | What it does | Examples |
| --- | --- | --- |
| **Compositional ideas** | Suggest editable notes and chords in symbolic form (e.g., MIDI), or lyrics, to assist songwriting | [MIDI-LLM](https://arxiv.org/abs/2511.03942) (ISMIR'26), CoLyricist (IUI'26), [Amuse](https://arxiv.org/abs/2412.18940) (CHI'25) |
| **Audio generation and editing** | Generate and reshape audio through musical examples and editing instructions | [Stemphonic](https://arxiv.org/abs/2602.09891) (ICASSP'26), [TRIA](https://arxiv.org/abs/2509.15625) (ISMIR'25), [Music ControlNet](https://arxiv.org/abs/2311.07069) (TASLP'24) |
| **Recovering editable structure** | Break down musical material into editable musical building blocks | [D-Composer](https://arxiv.org/abs/2610.22535) (ISMIR'26), [Decomposer](https://arxiv.org/abs/2607.01849) (2026) |

:::

---

## Compositional ideas

Symbolic suggestions (chords, melodies, lead sheets) are naturally **modular and editable**: a creator can drag a chord, change a note, or keep only the first two bars. The two systems below generate such suggestions from different kinds of input.

### Amuse: from multimodal inspiration to chords

Songwriting is often driven by inspirations that are not necessarily musical: a photo, a line of a story, the feeling of a song someone else wrote. **Amuse** transforms multimodal (image, text, audio) inputs into chord progressions that can be seamlessly incorporated into songwriters' creative process [@kim2025amuse].

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

Amuse was evaluated against *Hookpad Aria*, a generative assistant built into the Hookpad lead sheet editor [@donahue_hookpad_aria_2025]. Aria suggests melody and harmony for the song being edited: it can continue existing material, fill in a missing span in the middle, or generate harmony from a melody and vice versa. 

In a within-subjects study with 10 songwriters writing 8-bar choruses, Amuse was used alongside Aria. Participants felt more guided and better aligned with their creative goals than with Aria alone, and reported enhanced agency and creativity. Although Amuse was designed for the early stages of songwriting, participants used it throughout the process.

:::{iframe} https://www.youtube.com/embed/FbFD3B2OCo8
:label: vid-amuse
:width: 100%

Amuse in action. More at [yewon-kim.com/amuse](https://yewon-kim.com/amuse).
:::

### MIDI-LLM: text-to-MIDI by adapting an LLM

MIDI-LLM adapts a pretrained language model to generate editable MIDI from text descriptions [@wu2026midillm]. It adds MIDI tokens to the model’s vocabulary and trains it on music-related text, MIDI, and paired text–MIDI examples. The resulting model can generate multitrack music and be further trained for specific composition tasks.

For songwriting, the authors adapt MIDI-LLM to lead sheets (melodies and chord progressions) and evaluate it in Hookpad Aria. 
Creators can generate a new passage or fill in selected sections of the melody, chords, or both. 
They can guide suggestions with genre and mood tags, as well as musical attributes such as chord difficulty and chord–melody tension. 
The generated notes remain editable in Hookpad, allowing creators to revise the suggestions as they develop the song.

:::{figure} ../assets/composers/part1/midi-llm-tasks.png
:label: fig-midi-llm-tasks
:alt: MIDI-LLM tasks: text controls (key, genre, mood tags and music-theory attribute levels such as chord difficulty, chord-melody tension and melody difficulty) produce MIDI; MIDI with a missing span is infilled; text plus MIDI (e.g., bass motion level 7 of 7) extends the passage by 4 bars.
:width: 70%

MIDI-LLM tasks in a songwriting workflow: text-to-MIDI, MIDI infilling, and text+MIDI continuation. Text controls include tags (key, genre, mood) and music-theory attribute levels (e.g., chord difficulty, chord–melody tension, melody difficulty). Figure adapted from Wu et al. (2026).
:::


:::{card} Official MIDI-LLM demo
:link: https://midi-llm-demo.vercel.app/
Live demo by the authors [@wu2026midillm]: midi-llm-demo.vercel.app
:::

MIDI-LLM adapts a pretrained text LLM to music by extending its vocabulary and training it on text and MIDI.

**Extending the vocabulary.** The model starts from Llama 3.2 (1B parameters) and adds MIDI tokens while retaining the pretrained weights. Each note is represented by three tokens: onset time, duration, and instrument–pitch (). The embedding table combines the original text embeddings with the new MIDI embeddings:

```{math}
:label: eq-midi-llm-embedding
\mathbf{E}_{\text{MIDI-LLM}} := \begin{bmatrix}\mathbf{E}_{\text{LLM}}^{\top} & \mathbf{E}_{\text{AMT}}^{\top}\end{bmatrix}^{\top} \in \mathbb{R}^{(|\mathcal{V}_{\text{LLM}}| + |\mathcal{V}_{\text{AMT}}|) \times D}
```

where $\mathcal{V}_{\text{AMT}}$ is the MIDI vocabulary of the Anticipatory Music Transformer and $D$ is the LLM's hidden size. The model retains the LLM architecture, allowing it to use optimized inference frameworks such as vLLM.

**Training in two stages.** Continued pretraining uses music-related text and standalone MIDI files to develop the model's representations of musical language and structure. Supervised fine-tuning on paired text–MIDI examples then teaches it to generate music from text. Further fine-tuning on TheoryTab dataset adapts it to text-conditioned lead-sheet generation and infilling, with melody and chords as the output.

The MIDI-LLM paper reports that the model outperforms the recent Text2midi model in both text control and musical quality. An in-the-wild blind study with 58 Hookpad users and 4,002 generated outputs found that MIDI-LLM had the highest acceptance rate for  lead sheet generation, compared with baselines without text control or without LLM pretraining [@wu2026midillm].

:::{tip} How these map to the design principles
Both systems offer **steerable** suggestions: creators guide Amuse with images, text, audio, and keywords, and MIDI-LLM with genre, mood, and musical attribute controls. Their symbolic outputs are **modular and editable**, so creators can keep a chord progression, change individual notes, or use only part of a suggestion. MIDI-LLM also supports **contextual** suggestions by filling selected passages using the surrounding melody and chords.
:::

---

## Audio generation by time-varying controls

A text prompt can describe a genre or mood, but it is less convenient for specifying exactly when a melody should rise, a drum should hit, or the music should get louder. Time-varying controls let musicians specify these details along a timeline. Music ControlNet, Sketch2Sound, and TRIA use such controls to guide audio generation [@wu2024musiccontrolnet; @garcia2025sketch2sound; @oreilly2025tria].

:::{figure} ../assets/composers/part1/time-varying-controls.png
:label: fig-time-varying-controls
:alt: Controls for audio generation: a global text prompt "funky, tight drums" above three time-varying curves for melody, dynamics, and rhythm drawn along a time axis.
:width: 60%

Text prompt mostly describes the overall sound, while melody, dynamics, and rhythm provide more detailed guidance over time.
:::

Although these models differ in architecture, they share a recipe:

1. **Extract controls from the training audio.** Compute features such as melody, loudness, or rhythm from each recording to create paired audio and controls without manual annotation.
2. **Train a conditioned generator.** The model learns to generate audio using these controls alongside a text or audio prompt.
3. **Let the musician provide the controls.** At inference time, extract compatible features from humming or tapping, or accept a directly drawn control curve.

This gives musicians a way to demonstrate an idea when words are awkward. They can tap the rhythm they want or hum a melodic contour, then use a separate prompt to guide the sound.

### TRIA: The Rhythm In Anything

Tapping on a table or beatboxing can be enough to communicate a drum pattern. TRIA (The Rhythm In Anything) uses that recording to generate drums with the sound of a separate reference recording [@oreilly2025tria].

- **Inputs:** a tapped or beatboxed rhythm and a short drum recording with the desired timbre.
- **Control:** two feature streams that track low- and high-frequency activity over time.

:::{figure} ../assets/composers/part1/tria-overview.png
:label: fig-tria-overview
:alt: TRIA overview: a timbre prompt ("I want this drum sound...") plus a rhythm prompt ("...playing this rhythm") produces an output drum recording, shown as spectrograms with rhythm features below.
:width: 75%

TRIA combines the timbre of one recording with the rhythm of another. Figure from O'Reilly et al. (2025).
:::


:::{card} Official TRIA project page
:link: https://therhythminanything.github.io/
Audio examples by the authors [@oreilly2025tria] · therhythminanything.github.io
:::

TRIA follows the shared recipe step by step:

**1. Extract rhythm features.** TRIA computes a short-time Fourier transform (STFT) of the recording and divides the spectral energy equally between a low and a high band. The resulting features track activity in each band over time. This coarse representation reduces timbral detail, allowing sounds as different as a table tap and a kick drum to provide similar rhythm cues.

:::{figure} ../assets/composers/part1/tria-step1-rhythm-features.png
:label: fig-tria-step1
:alt: A drum spectrogram split by a dashed line into high and low bands, converted by STFT into a sequence of two-band rhythm features.
:width: 95%

Step 1: split spectral energy equally into low and high bands to obtain a two-band rhythm control. Figure adapted from O'Reilly et al. (2025).
:::

**2. Train the generator.** Each training recording provides acoustic tokens from the DAC neural audio codec and rhythm features from the audio. Augmentations such as noise, filtering, pitch and phase shifts, and equalization help the model handle rhythm inputs from different sound sources. A masked transformer learns to recover hidden acoustic tokens, using the visible tokens as a timbre reference and the rhythm features as timing cues.

:::{figure} ../assets/composers/part1/tria-step2-training.png
:label: fig-tria-step2
:alt: Training: a drum recording is encoded by DAC into acoustic tokens and by STFT into rhythm features; a span of tokens is masked and predicted from the unmasked tokens and the rhythm features.
:width: 100%

Step 2: masked token prediction. Timbre comes from the unmasked tokens; timing comes from the rhythm features. Figure adapted from O'Reilly et al. (2025).
:::

**3. Generate from the musician's inputs.** At inference time, the timbre reference is encoded as a fixed token prefix. The model fills a masked suffix using rhythm features extracted from the musician's tapping or beatboxing. DAC then decodes the predicted tokens into audio.

:::{figure} ../assets/composers/part1/tria-step3-inference.png
:label: fig-tria-step3
:alt: Inference: the timbre prompt is encoded by DAC as a prefix; the rhythm prompt is converted by STFT into rhythm features for a masked span; the model fills in the masked span and DAC decodes the output audio.
:width: 100%

Step 3: fix the timbre prompt as a prefix and predict a masked suffix conditioned on the rhythm prompt. Figure adapted from O'Reilly et al. (2025).
:::

The paper reports that TRIA, trained on fewer than 10 hours of publicly available drum recordings, can follow rhythmic gestures across a range of timbres without additional training on those gestures [@oreilly2025tria].

---

## Recovering editable structure: music decomposition

Creators also need ways to revise material they already have. A drum recording may contain a useful groove, but moving one hit or replacing its sound is difficult while everything is mixed together. Decomposition systems recover parts that can be edited separately. Here, we look at two examples: turning drum audio into sequenced samples, and turning MIDI into program.

:::{table} Examples of music decomposition.
:label: tbl-decomposition

| Input material | Output building blocks | Edit in | Reference |
| --- | --- | --- | --- |
| Drum recording | Individual hits + their sounds | DAW | D-Composer (ISMIR'26) |
| MIDI | Program (code) | Live-coding editor | Decomposer (2026) |

:::

Both tasks need paired training examples: musical material and the components used to produce it. Since these pairs are scarce, both systems create them synthetically:

1. **Synthesize** training pairs by rendering known building blocks into material.
2. **Train** a language model to predict the building blocks from the material.
3. **Run** it on real material and let the creator edit the predicted blocks.

### D-Composer: drum recordings → playable sound events

D-Composer converts a drum recording into a piano roll and a set of isolated drum sounds [@oreilly2026dcomposer]. A single language model predicts both the transcription (onset times and classes such as kick, snare, clap, and hi-hat) and the audio samples needed to play it. The result can be loaded into a DAW, where the musician can rearrange the pattern or change individual sounds.

:::{figure} ../assets/composers/part1/d-composer-overview.png
:label: fig-dcomposer-overview
:alt: D-Composer: a drum recording is converted into predicted tokens, which become a piano roll with rows for hi-hat, clap/snare and kick (transcription) plus an isolated audio sample for each row (sound events).
:width: 50%

D-Composer predicts both a transcription (onsets + classes) and the isolated sound of each event. Figure from O'Reilly et al. (2026).
:::
:::{card} Official D-Composer project page
:link: https://d-composer.github.io/
Listening examples and code by the authors [@oreilly2026dcomposer]: d-composer.github.io
:::

Training starts with drum scores and samples whose contents are already known:

1. **Synthesize.** Render MIDI drum scores with one-shot samples and mix them into recordings. Each recording has a known score and source samples as its targets.
2. **Train.** An encoder–decoder language model learns to predict drum classes, onset times, and acoustic tokens for the one-shot samples from the synthetic recording.

:::{figure} ../assets/composers/part1/d-composer-pipeline.png
:label: fig-dcomposer-pipeline
:alt: D-Composer pipeline: excerpts from a MIDI drum score library and a drum one-shot library are matched, rendered, sequenced and mixed into a synthetic drum recording; an encoder-decoder model predicts class and onset tokens and acoustic tokens, which are rendered into isolated one-shot audio at inference time.
:width: 95%

D-Composer training data synthesis (top) and model (bottom). Figure from O'Reilly et al. (2026).
:::

### Decomposer: MIDI → live coding programs (Strudel.js)

MIDI stores individual note events, but a passage may be easier to edit as a pattern: repeat this bass line four times, then transpose it. Decomposer converts MIDI into Strudel, a live-coding language, so musicians can work with those patterns in code [@kim2026decomposer].

:::{figure} ../assets/composers/part1/decomposer-demo.png
:label: fig-decomposer-demo
:alt: Left: a MIDI piano roll. Right: an equivalent short Strudel program defining chords and voicings.
:width: 85%

A MIDI piano roll (top) and the Strudel program Decomposer recovers (bottom).
:::

:::{card} Official Decomposer project page
:link: https://yewon-kim.com/decomposer
Examples and live demo by the authors [@kim2026decomposer]: yewon-kim.com/decomposer
:::


The task has two difficulties. Strudel is a low-resource language with almost no naturally paired (MIDI, code) data, and optimizing only for faithful reconstruction can collapse to unreadable note-by-note transliteration. Decomposer handles both with the decomposition recipe:

1. **Synthesize.** A frontier LLM generates Strudel programs, which are cleaned with regular-expression and abstract-syntax-tree checks, then executed in the Strudel runtime to produce MIDI. The resulting dataset, Strudel-Synth, contains 21,174 program–MIDI pairs.
2. **Train** in two stages. Supervised finetuning on Strudel-Synth teaches the model to write valid, idiomatic Strudel. Reinforcement learning  on unpaired MIDI then optimizes decompilation directly, rewarding sampled programs for both **faithfulness** (does the rendered MIDI match the input?) and **readability** (is the code structured rather than a note dump?).

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

The paper reports that the resulting 8B open-weight model reconstructs input MIDI more faithfully than the closed-weight frontier LLMs evaluated, while maintaining comparable code readability [@kim2026decomposer].

---

## Takeaways

Creators may use only part of a suggestion, change it, or take it as inspiration for something else. Its value lies partly in how it helps them develop their own ideas. When evaluating these systems, it is worth asking not only whether creators accept a suggestion, but also what it helps them do next.

These systems also face a common challenge: suitable training pairs are often scarce. Amuse works around the lack of paired inspirations and chords by combining an LLM with a chord model. Time-varying control systems extract control signals from recordings, while decomposition systems render known components into audio or MIDI to create training pairs. These approaches show how useful supervision can be built from existing models, recordings, and musical representations.

:::{important} Designing useful suggestions

- **Steerable:** Amuse accepts source material and keywords, MIDI-LLM uses text and musical attributes, and TRIA follows tapping or beatboxing.

- **Modular and editable:** chords, lead sheets, drum samples, and code let creators revise individual parts of the result.

- **Diverse:** alternatives, such as the chord progressions offered by Amuse, give creators more than one direction to try.

- **Contextual:** MIDI-LLM can fill in or extend a passage, while D-Composer and Decomposer make existing material easier to rework.
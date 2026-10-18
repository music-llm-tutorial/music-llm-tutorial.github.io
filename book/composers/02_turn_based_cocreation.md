---
title: "Part 2: Turn-based Co-creation"
subtitle: Chapter 4 | Applications for Creators
authors:
  - name: Yewon Kim
---

**TODO**: add a gif image demonstrating the representative case of "turn-based creation"

Part 1 ended with three limitations of one-shot generation: generation is all or nothing, the output is hard to edit, and words are a coarse interface for music. Co-creation systems address these limitations by changing what the model hands back. Instead of a finished piece, the model returns partial material that fits the creator's work in progress, and the creator keeps, edits or rejects it, one turn at a time. The piece grows through many small exchanges rather than a single prompt, and the creator decides what stays at every step.

**TODO: illustrative figure?**

## Design levers of human-AI music co-creation
Each limitation from Part 1 suggests a design lever, a way of shaping what the model takes in and gives back ([](#tbl-part2-levers)).

:::{table} How co-creation systems respond to the limitations of one-shot generation.
:label: tbl-part2-levers
 
| Limitation of one-shot generation | Design lever | Example systems |
|---|---|---|
| Generation is all or nothing | **Generate partial material in context**: produce only the part the creator asks for, conditioned on the surrounding music, inside the tools and stages they already work in | Anticipatory Music Transformer, Composer's Assistant, CoLyricist |
| The output is hard to edit | **Return an editable form**: chords, code or revised lyrics instead of a final signal | Decomposer, Amuse |
| Words are a coarse interface | **Steer with more than words**: images, audio, sliders or examples | Cococo, Amuse |
:::
 
The levers sit at different points of the same loop ([](#fig-cocreation-loop)). Material the creator accepts becomes part of the project, which in turn becomes the context for the next request. A system usually pulls one or two levers, and the sections below introduce systems lever by lever.

## (1) Generate partial material in context

Creators rarely want a whole new piece. They want *this* bar, *this* part or *this* stem, and it has to fit what is already there. That requires two kinds of context.

**Musical context.** The model sees the surrounding music and fills only the gap ([](#tbl-infilling)).

:::{table} Infilling: the model generates only the empty cells, conditioned on everything else in the project.
:label: tbl-infilling
 
| Track | Bar 1 | Bar 2 | Bar 3 | Bar 4 |
|---|---|---|---|---|
| Melody | ■ | ■ | ■ | ■ |
| Chords | ■ | ■ | **?** | **?** |
| Bass | ■ | **?** | **?** | ■ |
| Drums | ■ | ■ | ■ | ■ |
:::

Case study: AMT

AMT (cite) shows how an autoregressive model can produce *partial* output that respects its *context*. A standard autoregressive model sees only what came before, so it cannot fill a gap that has to lead into material the creator has already written later in the piece. AMT interleaves the fixed material into the token sequence slightly *ahead of* its actual time, which the authors call *anticipation*. When the model generates the events inside the gap, it has already seen the fixed events on both sides of it. A single model can therefore fill a span of time (e.g., bars 3–4) or a set of instruments (e.g., an accompaniment under a fixed melody) and leave everything else untouched.

**Work context.** Partial material is only useful if it arrives where the creator is working. Some tools therefore live inside the creator's software: e.g., Composer's Assistant 2 runs inside the REAPER DAW. 
Magenta Studio also brings generative models into Ableton Live as plugins. 

## (2) Return an editable form
 
If the output is hard to edit, a system can return it in a form the creator can work with. Two recent systems do this by transforming material rather than generating it from scratch ([](#fig-editable-forms)).

Case study: Decomposer

Decomposer decompiles MIDI into an editable program in Strudel, a music live-coding language. It is first fine-tuned on synthetic data and then trained with reinforcement learning that rewards both faithful reconstruction and readable code. The creator can then edit structure, such as patterns and repetitions, rather than individual notes.

Amuse too?

## (3) Steer with more than words

Some works focus on expanding the input modality, as creators think beyond natural language: images, sounds, gestures, etc. Many musical ideas are easier to show than to describe.

**Cococo** predates LLMs but set an early template. It let novice users infill music one voice at a time and gave them *steering tools* such as semantic sliders, and users reported a greater sense of ownership and control. 
 
**Amuse** brings this idea to LLMs. A songwriter's *inspiration*, whether an image, a text or an audio clip, becomes chord suggestions ([](#fig-amuse)). Because there is no paired data linking inspirations to chords, Amuse uses an LLM's multimodal understanding to propose candidates and a small music model trained on human-composed progressions to filter them.

**TODO**
Introduce some user studies as well. 
- AI Song Contest
- Krol et al co design paper
- Ethical risks

## Systems table
 
:::{table} Systems discussed in Part 2. 🎼 symbolic, 🔊 audio, 📝 lyrics. Levers: *In context* = generate partial material in context; *Editable* = return an editable form; *Steer* = steer with more than words.
:label: tbl-part2-systems
 
| System | Venue | Output | Lever | Key idea |
|---|---|---|---|---|
| Anticipatory Music Transformer [@thickstun2024amt] | TMLR 2024 | 🎼 MIDI | In context | Fixed material is placed ahead of its time in the sequence, so the model fills spans or instruments around it |
| Composer's Assistant [@malandro2023composersassistant] | ISMIR 2023 | 🎼 Multi-track MIDI | In context | Multi-track infilling at the track-and-bar level |
| Composer's Assistant 2 [@malandro2024composersassistant2] | arXiv 2024 | 🎼 Multi-track MIDI | In context | Adds fine-grained rhythm and pitch controls; runs inside the REAPER DAW |
| MIDI-GPT [@pasquier2025midigpt] | AAAI 2025 | 🎼 Multi-track MIDI | In context | Track- and bar-level infilling with attribute controls such as note density and polyphony |
| Magenta Studio [@roberts2019magentastudio] | Google Research 2019 | 🎼 MIDI | In context | Pre-LLM generative models packaged as Ableton Live plugins |
| StemGen [@parker2024stemgen] | arXiv 2024 | 🔊 Stem | In context | Listens to an existing mix and generates a stem that fits it |
| Instruct-MusicGen [@zhang2025instructmusicgen] | ISMIR 2025 | 🔊 Stem edits | In context | Instruction-tuned MusicGen that adds, removes or modifies one stem of a recording |
| CoLyricist [@yoshida2026colyricist] | Preprint 2026 | 📝 Lyrics | In context | AI support for each stage of lyric writing, derived from interviews with lyricists |
| Decomposer [@kim2026decomposer] | Preprint 2026 | 🎼 Strudel code | Editable | Decompiles MIDI into readable code, trained with RL for faithfulness and readability |
| REFFLY [@zhao2025reffly] | NAACL 2025 | 📝 Lyrics | Editable | Revises the creator's own draft to fit a melody while keeping its meaning |
| Unsupervised melody-to-lyrics [@tian2023melody2lyrics] | ACL 2023 | 📝 Lyrics | — | Generates lyrics for a melody from scratch; the contrast case for REFFLY |
| Cococo [@louie2020cococo] | CHI 2020 | 🎼 Multi-voice MIDI | Steer, in context | Pre-LLM steering tools (semantic sliders, voice-by-voice infilling) for novices |
| Amuse [@kim2025amuse] | CHI 2025 | 🎼 Chords | Steer | Image, text or audio inspirations → LLM-proposed chords, filtered by a chord model |
:::
 
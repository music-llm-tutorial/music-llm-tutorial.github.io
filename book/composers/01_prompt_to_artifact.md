---
title: "Part 1: Prompt to Artifact"
subtitle: Chapter 4 | Applications for Creators
authors:
  - name: Yewon Kim
---

**TODO**: add a gif image demonstrating the representative case of "prompt to artifact"

**TODO**: cite systems 

Most creators would first meet music AI this way: they type a description (e.g., *"a melancholic lo-fi piano piece, 80 BPM"*) and get back a finished piece.
To generate music, a language model first needs it written as **tokens**, discrete symbols it can predict one after another.
Music can be turned into tokens in two ways: as **symbolic events** (e.g., MIDI, ABC notation) or as **audio codec tokens** from a neural audio codec.

**TODO**: perhaps short explanation about symbolic events and audio codec tokens

## Music LLM building blocks

Whichever tokens are used, language model based music generators are built from the same components ([](#fig-musicllm-blocks)):

:::{figure} ../assets/composers/part1-blocks.png
:label: fig-musicllm-blocks
:alt: Building blocks of language-model-based music generation, shared across symbolic and audio representations.

Language model based music generation shares common building blocks across symbolic and audio representations.
:::

**TODO**: refine the figure

**Music representation.** This is the token vocabulary the model works in: symbolic events or audio codec tokens (**TODO**: perhaps short explanation about symbolic events and audio codec tokens, here or above)

**Conditional language modeling.** 
The model learns to predict the next music token given the tokens so far and a *condition*. The condition can be a free-text description (ChatMusician, MusicGen), structured metadata such as period, composer and instrumentation (NotaGen), or lyrics (SongGen, YuE). (TODO: make it more open ended or introduce more diverse examples; link the papers to the reference)
Many models first pretrain on large amounts of music without conditions (e.g., MuPT on ABC notation) and then learn the conditional task.

**Training-data construction.** 
Conditional models need music paired with descriptions, and such pairs are scarce. 
A common workaround is to have an LLM write captions from labels that already exist: musical features extracted from MIDI, such as key, tempo and chords (MidiCaps); 
forum tags attached to scores (MetaScore); 
or existing tags on audio clips (LP-MusicCaps). The LLM then turns structured labels into natural-language descriptions.

**Optional post-training.** 
A trained conditional model can already generate music. Some systems go further and steer it toward outputs that are preferred. The preference signal can come from a model: 
NotaGen's CLaMP-DPO uses a pretrained music model (CLaMP) to rank the model's own outputs and builds preference pairs without human annotation. 
It can also come from people: MusicRL fine-tunes a music language model with rewards learned from preferences that users gave.

The next section looks more closely at one part of conditional language modeling: how the text condition reaches the music model.

## Ways to connect text and music

A prompt-to-music system has to turn a 
text description into music tokens. 
Systems connect the two in a few recurring ways ([](#fig-musicllm-approaches)): 
text and music can share one token sequence, text can first be mapped to explicit musical attributes, or a text encoder can condition a separate music model.

:::{figure} ../assets/composers/part1-approaches.png
:label: fig-musicllm-approaches
:alt: 

Three representative ways to connect text to a music generator. They are common patterns rather than a complete taxonomy, and one system can combine them.
:::

### Case study: MusicGen

**TODO** figure

**MusicGen** (NeurIPS 2023) is the most widely used open example of the third approach. A text encoder conditions a single transformer that generates EnCodec audio tokens, and it can also follow a reference melody.
<!-- % Instruct-MusicGen fine-tunes it to edit audio, and FilmComposer uses it as a tool inside an agent ([Part 4](./part4_agentic_production.md)). -->

### Case study: ChatMusician

**TODO** figure

**ChatMusician** (ACL Findings 2024) is an example of the first approach. It continues training a text LLM on ABC notation, so the same model can read a request, write a score as text, and answer questions about music theory.

The full list of systems in this part is in [](#tbl-part1-systems).

## What one-shot generation leaves out

:::{figure} ../assets/composers/part1-paradigm.png
:label: fig-oneshot-gap
:alt: A creator asks for a piece, receives a complete piece, asks to change only one part, and receives another complete piece.
 
One-shot generation answers a prompt, but creators work by iterating on parts.
:::

**TODO**: refine figure

These systems are impressive, but they hand the creator a finished piece and little to steer it with. Three limitations stand out:

1. **Generation is all or nothing.** The prompt describes the whole piece, and the usual way to fix one part is to regenerate the whole thing. Training captions are mostly built from whole-piece labels such as genre, mood, tempo and instrumentation (see *Training data construction* above), so requests about a specific moment, such as *"let the bass drop out for two bars before the chorus"*, are hard to satisfy. Creative work rarely proceeds this way: creators keep what works and revise the rest.  (Could mention AI Song Contest).
2. **The output is hard to edit.** A waveform cannot be changed note by note. Even generated MIDI arrives as a flat stream of notes, without the sections, motifs and voices a creator would want to work with.
3. **Words are a coarse interface for music.** Many musical ideas, such as a groove, a voicing or the contour of a melody, are easier to play or hum than to describe in text.

Together, these limitations raise a question of **authorship and agency**: if the creator can only describe and regenerate, how much of the result is theirs?
The next part turns to systems that hand back **modular material to shape** instead of a finished piece.

## Systems Table
:::{table} Systems discussed in Part 1. 🎼 symbolic, 🔊 audio.
:label: tbl-part1-systems
 
| System | Venue | Output | Key idea |
|---|---|---|---|
| ChatMusician | ACL Findings 2024 | 🎼 ABC | Text LLM continued-pretrained on music as text |
| MuPT | ICLR 2025 | 🎼 ABC | Scaling-law study for symbolic music pretraining |
| NotaGen | IJCAI 2025 | 🎼 ABC (classical) | Pretrain → fine-tune with period, composer and instrumentation prompts → CLaMP-DPO |
| MuseCoco | arXiv 2023 | 🎼 MIDI | Text-to-attribute understanding, then attribute-to-music generation |
| Text2MIDI | AAAI 2025 | 🎼 MIDI | LLM text encoder + MIDI decoder, trained on MidiCaps |
| MIDI-LLM | NeurIPS 2025 workshop | 🎼 MIDI | MIDI tokens added to a text LLM's vocabulary |
| SongComposer | ACL 2025 | 🎼 Lyrics + melody | Lyrics and melody aligned word by note |
| MusicGen | NeurIPS 2023 | 🔊 Audio | Single transformer over interleaved codec tokens |
| SongCreator | NeurIPS 2024 | 🔊 Song | Dual-sequence LM for vocals and accompaniment; latent diffusion renders audio |
| SongGen | ICML 2025 | 🔊 Song | Single-stage autoregressive text-to-song; mixed or dual-track output |
| YuE | ICLR 2026 | 🔊 Song | LM-based long-form lyrics-to-song |
| MusicRL | ICML 2024 | 🔊 Audio | Music LM fine-tuned with RL from human preference feedback |
| MidiCaps / MetaScore | ISMIR 2024 / 2025 | 🎼 Data | LLM writes captions from extracted musical features (MidiCaps) or tags (MetaScore) |
| LP-MusicCaps | ISMIR 2023 | 🔊 Data | LLM writes captions for music audio from existing tags |
:::


## References
 
- Yuan et al. *ChatMusician: Understanding and Generating Music Intrinsically with LLM.* ACL Findings 2024. [arXiv:2402.16153](https://arxiv.org/abs/2402.16153)
- Qu et al. *MuPT: A Generative Symbolic Music Pretrained Transformer.* ICLR 2025. [ICLR proceedings](https://proceedings.iclr.cc/paper_files/paper/2025/hash/73f6f8897896f7bda86ea7d1ebc1dc4f-Abstract-Conference.html)
- Wang et al. *NotaGen: Advancing Musicality in Symbolic Music Generation with Large Language Model Training Paradigms.* IJCAI 2025. [arXiv:2502.18008](https://arxiv.org/abs/2502.18008)
- Lu et al. *MuseCoco: Generating Symbolic Music from Text.* 2023. [arXiv:2306.00110](https://arxiv.org/abs/2306.00110)
- Bhandari et al. *Text2midi: Generating Symbolic Music from Captions.* AAAI 2025. [arXiv:2412.16526](https://arxiv.org/abs/2412.16526)
- Wu, Kim & Huang. *MIDI-LLM: Adapting Large Language Models for Text-to-MIDI Music Generation.* NeurIPS 2025 workshop. [arXiv:2511.03942](https://arxiv.org/abs/2511.03942)
- Ding et al. *SongComposer: A Large Language Model for Lyric and Melody Generation in Song Composition.* ACL 2025. [arXiv:2402.17645](https://arxiv.org/abs/2402.17645)
- Copet et al. *Simple and Controllable Music Generation* (MusicGen). NeurIPS 2023. [arXiv:2306.05284](https://arxiv.org/abs/2306.05284)
- Lei et al. *SongCreator: Lyrics-based Universal Song Generation.* NeurIPS 2024. [arXiv:2409.06029](https://arxiv.org/abs/2409.06029)
- Liu et al. *SongGen: A Single Stage Auto-regressive Transformer for Text-to-Song Generation.* ICML 2025. [arXiv:2502.13128](https://arxiv.org/abs/2502.13128)
- Yuan et al. *YuE: Scaling Open Foundation Models for Long-Form Music Generation.* ICLR 2026. [arXiv:2503.08638](https://arxiv.org/abs/2503.08638)
- Cideron et al. *MusicRL: Aligning Music Generation to Human Preferences.* ICML 2024. [arXiv:2402.04229](https://arxiv.org/abs/2402.04229)
- Melechovsky et al. *MidiCaps: A Large-scale MIDI Dataset with Text Captions.* ISMIR 2024. [arXiv:2406.02255](https://arxiv.org/abs/2406.02255)
- Xu et al. *Generating Symbolic Music from Natural Language Prompts using an LLM-Enhanced Dataset* (MetaScore). ISMIR 2025. [arXiv:2410.02084](https://arxiv.org/abs/2410.02084)
- Doh, Choi, Lee & Nam. *LP-MusicCaps: LLM-Based Pseudo Music Captioning.* ISMIR 2023. [arXiv:2307.16372](https://arxiv.org/abs/2307.16372)
- Zeghidour et al. *SoundStream: An End-to-End Neural Audio Codec.* IEEE/ACM TASLP 2022. [arXiv:2107.03312](https://arxiv.org/abs/2107.03312)
- Défossez et al. *High Fidelity Neural Audio Compression* (EnCodec). TMLR 2023. [arXiv:2210.13438](https://arxiv.org/abs/2210.13438)
- Kumar et al. *High-Fidelity Audio Compression with Improved RVQGAN* (DAC). NeurIPS 2023. [arXiv:2306.06546](https://arxiv.org/abs/2306.06546)
- Zhang et al. *Instruct-MusicGen: Unlocking Text-to-Music Editing for Music Language Models via Instruction Tuning.* ISMIR 2025. [arXiv:2405.18386](https://arxiv.org/abs/2405.18386)
- Xie et al. *FilmComposer: LLM-Driven Music Production for Silent Film Clips.* CVPR 2025. [arXiv:2503.08147](https://arxiv.org/abs/2503.08147)
- Choi, Moon, Yoo & Hong. *Understanding the Potentials and Limitations of Prompt-based Music Generative AI.* CHI 2025. [doi:10.1145/3706598.3713762](https://doi.org/10.1145/3706598.3713762)
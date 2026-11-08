---
title: Overview
authors:
  - name: Zachary Novack
---

An LLM, fundamentally, is just a system that reads and writes tokens. Thus, this chapter asks three questions:
- What is music to an LLM? 
- What does it mean for an LLM to understand music?
- And how do we check?

(sec-und-history)=
## A short history

It is important to note that there's a long history of music-language research that sits apart from the recent explosion of LLMs. Particularly, see the ISMIR 2024 tutorial on
connecting music audio and natural language, as it covers some of this earlier work in detail
[@doh2024connecting]. Below we describe a brief history of the "before-times" of music-language research, and what sorts of models and tasks were done:


*Joint embedding* models such as MuLan and CLAP train an audio encoder and a
text encoder so that a recording and its description land close together in one
shared latent space [@huang2022mulan; @wu2023large]. By having a joint mulit-modal latent space between music and text, these models have shown great use in retrieval, music tagging, initializations for other downstream predictive or generative models, and often as evaluation metrics. Importantly however, they do not answer questions or write text.

*Captioning* models were the first text-generative sort of music-language systems, focusing on generating a sentence that describes a recording
[@manco2021muscaps]. Dedicated captioning models enjoyed a brief time in the sun before being
supplanted by full-on Music LLMs, mostly due to the scarcity of ground truth captions
and then need to use pure LLMs to bootstrap tags into pseudo-captions [@doh2023lp] (a trend
that is still popular to this day for generating caption data at scale).

*Music LLMs* work generally by connecting a pre-trained audio encoder to a pre-trained LLM and training
this connective tissue together. MU-LLaMA, LLark, and MusiLingo did this for music in 2023
[@liu_music_2024; @gardner2023llark; @deng_musilingo_2024], and SALMONN and
Qwen-Audio did it for speech, sound, and music together
[@tang_salmonn_2024; @chu_qwen-audio_2023]. Given the strong world knowledge and capabilities of the base LLM, these Music LLMs showed the ability to
 caption, tag, and answer more free form musical questions.

*Omni and reasoning models* came next. Qwen2.5-Omni and Qwen3-Omni take text,
images, audio, and video in one model [@xu_qwen25omni_2025; @qwen3omni_2025].
Audio Flamingo 3 adds multi-turn chat over several clips and short reasoning
before the answer [@goel_af3_2025]. Music Flamingo fine-tunes an Audio Flamingo
3 backbone on music data, adds chain-of-thought examples grounded in music
theory, and trains further with RL
[@ghosh_musicflamingo_2026]. Audio encoders came to be finetuned as well, if not outright trained from scratch for the goal of music-language modeling. In 2026, some general models dropped the audio
encoder altogether and pass raw audio chunks or spectrogram frames into the LLM
through a single light layer [@gemma4_2026; @thinkingmachines_inkling_2026].

(sec-und-problem)=
## What counts as understanding

Given a question as $q$, music sample as $m$, and the answer as $a$, a model that
understands music should give a high probability to the right answer,

$$
p_\theta(a \mid m, q).
$$

 $m$ can be audio, an image of a score, or text. It is important to think about
 this abstract probability notion to define what *understanding* and *listening* are.


Since a text LLM has read many descriptions of music, 
many questions can give their answer away: a question about "the distorted electric
guitar" is probably about rock. So a model can be right *because of* the music
or *despite* it. The useful comparison is with the same model's answer without
the music, $p_\theta(a \mid q)$. When the two are close, the question does not
test listening. This comparison we'll return to on the [evaluation
page](#sec-und-needs-music).

It also helps to separate three levels of questions:

- *Perception*: what is in the signal or on the page, such as notes, onsets,
  instruments, or the symbols in a bar.
- *Understanding*: what those percepts mean in musical terms, such as key,
  harmonic function, form, genre, or mood.
- *Reasoning*: several steps that combine perception and knowledge, such as an
  analysis, a comparison, or an explanation of why a passage sounds the way it
  does.

Note that these levels are not strict. Key finding needs pitch perception, and a genre label
can rest on one instrument. But a wrong answer at a higher level often starts as
a perception error, and in the [perception and reasoning
page](./perception_reasoning.md) we'll show how to tell the two apart.

(sec-und-example)=
## A running example

The pages of this chapter use one short piece: two bars of a reel in D major,
the tune whose first bar [Chapter 1](#sec-next-token) splits into tokens, with a bass line
added. The audio below was synthesized from the ABC file at 120 BPM. Each bar
lasts two seconds, and the two bars play twice, so the clip is eight seconds
long.

[Listen to the reel!](../assets/understanding/reel.mp3)

:::{figure} ../assets/understanding/reel_score.svg
:label: fig-und-score
:alt: Two repeated bars of a reel in D major in 4/4. The treble staff plays D5, F sharp 5 and D5, A4, F sharp 4 and A4, then D5, F sharp 5 and D5, E5, C sharp 5 and A4. The bass staff plays quarter notes D3, A3, D3, A3, then D3, A3, A2, E3.

The running example as a score, engraved from the ABC file below.
:::

The same piece in ABC notation, where `L:1/8` makes a plain letter an eighth
note and `d2` a quarter note:

```text
X:1
T:Reel in D (running example)
M:4/4
L:1/8
Q:1/4=120
K:D
V:1
|: d2fd A2FA | d2fd e2cA :|
V:2 clef=bass
|: D,2A,2 D,2A,2 | D,2A,2 A,,2E,2 :|
```

The files are in the book's repository: [reel.abc](../assets/understanding/reel.abc),
[reel.krn](../assets/understanding/reel.krn),
[reel.musicxml](../assets/understanding/reel.musicxml), and
[reel_score.png](../assets/understanding/reel_score.png). Three questions, one
per level, come back throughout the chapter:

1. Perception: *Which notes does the upper line play in bar 1?* D5, F♯5, D5, A4,
   F♯4, A4.
2. Understanding: *What key is it in?* D major.
3. Reasoning: *Why does the repeat sound like a return?* Bar 2 ends on E5, C♯5,
   and A4 over A2 and E3, an A major chord. A major is the dominant of D, so the
   phrase ends open, and the repeat resolves it back to D.

A model that reads the ABC sees every note spelled out, so question 1 is a
lookup and question 3 is the hard one. A model that hears the audio must first
find the notes, so question 1 can be the hard one. One key thread, if you learn anything from this chapter, is that **where the work falls depends
on the representation**, and that idea runs throughout as we will see.

(sec-und-roadmap)=
## Roadmap

- [How music gets into an LLM](./interfaces.md) details the broad shared recipe of Music LLMs
  (encode, adapt, place in the sequence, train on the next token) and then each
  route in turn: [audio](./interfaces_audio.md), [images of scores and
  spectrograms](./interfaces_images.md), and [text and
  code](./interfaces_text.md). The pages include short code snippets that load
  open models from Hugging Face and ask them about the reel.
- [Perception and reasoning](./perception_reasoning.md) splits a musical
  question into hearing and thinking, reviews what is known about reasoning in
  audio LLMs, and shows how replacing the music with noise reveals what a model
  actually uses.
- [Evaluating music understanding](./evaluation.md) surveys music benchmarks,
  shows how many questions can be answered without the music, and lists checks
  for building a benchmark.
- [Looking ahead](./looking_ahead.md) asks why benchmarks age so fast and what
  the next ones should measure.

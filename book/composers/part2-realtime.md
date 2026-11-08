---
title: "Part 2: Real-Time Music Co-Creation"
subtitle: Chapter 4 | LLMs for Creators
short_title: "Part 2 · Real-time"
authors:
  - name: Yewon Kim
---

(part2-realtime)=

:::{image} ../assets/composers/overview/icon-part2-realtime.png
:alt: Illustration of a band playing live: drummer, guitarists, keyboardist and singer.
:width: 170px
:align: center
:::

In [Part 1](part1-suggestions.md), creators listen to suggestions and decide what to do next. During improvisation, those decisions happen while the music continues. A musician might change the melody, hold a note, or introduce a new rhythm, and an AI partner needs to respond in time. This part examines systems designed for that exchange and the technical choices that make it possible.

## Making music through improvisation

Playing an instrument or singing can be a way to work out an idea before knowing exactly where it will go [@kim2025amuse]. An AI system that joins this process could provide:

- a partner to practise or improvise with when other musicians are unavailable,
- responses that reflect aspects of the musician’s own style, offering a way to hear it differently [@blanchard2025jambot], and
- opportunities to explore forms of interaction beyond human performance capabilities, including unusually fast responses [@kim2026designspace].

Applying LLMs to live performance remains an emerging area [@kim2026designspace]. Alongside musical quality, developers must consider when a response arrives and how it fits the ongoing performance.

## Processing music as it arrives

Real-time audio software typically processes sound in short frames, also called blocks or buffers. In a simple pipeline, the system computes the next output frame while the current one plays. If that output is not ready in time, playback may contain a gap or glitch [@donahue2026pcm].

:::{figure} ../assets/composers/part2/frame-based-processing.gif
:label: fig-frame-based
:alt: Animation of frame-based processing: user input arrives in colored frames on the top row, and the corresponding AI output frames are produced on the bottom row, each one frame later, while a playhead moves from left to right.
:width: 100%

Frame-based processing. Each colored frame of user input (top) is turned into a frame of output (bottom) that plays one frame later. Animation from Chris Donahue, *Principles of Computer Music*, [§10.6 Real-time Processing](https://www.cs.cmu.edu/~15322/book/ch10/06.html) (CMU 15-322).
:::

This example separates two timing constraints. *Latency* is the delay between input and its corresponding output; the illustrated pipeline introduces one frame of delay. *Compute budget* is the time available to prepare each output frame. To sustain playback, processing must keep pace with the frame duration. Smaller frames can reduce buffering delay, but leave less time to compute each one. Actual systems may introduce additional delay through audio hardware, buffering, and communication.

Generative models may work with audio blocks, codec tokens, or beat-level musical events. These units differ, but each system needs to deliver its output before the scheduled playback time.

## What makes real-time generation hard?

1. **Tight latency budget.** Closely coordinated playing can require responses on the order of tens of milliseconds, with less than roughly 100 ms often used as a design target. The acceptable delay depends on the interaction. Server GPUs can support larger models but introduce network delay; local inference avoids that communication cost but has fewer computing resources [@kim2026designspace; @blanchard2025jambot; @lyria2025livemusicmodels].
2. **No future context.** The model must choose what to play before hearing everything it will accompany. A chord scheduled for the next beat may already be committed when the musician’s melody note arrives.
3. **Responsiveness and throughput.** Generating larger chunks can be more efficient, but the model then has fewer opportunities to adjust to new (and unexpected) input.

## Designing for live interaction

Meeting these constraints involves both model design and the software around it. The examples below make changes at training, inference, and deployment [@blanchard2025jambot; @wu2024realchords; @novack2026lmdm; @wu2026streaming].
:::{table} Where real-time systems save time.
:label: tbl-latency-budget

| Stage | Techniques | Examples in this part |
| --- | --- | --- |
| **Training** | Compact representations; learning to anticipate; training on model-generated context | ReaLchords learns from an offline teacher; LMDM uses ARC-Forcing to reduce error accumulation |
| **Inference** | Reuse computation; generate ahead; schedule output before playback | LMDM’s block-wise KV caching; ReaLJam’s lookahead and commit window; jam_bot’s scheduling |
| **Deployment** | Quantization and efficient runtimes | jam_bot’s use of ggml |

:::

## Overview: real-time music co-creation

We consider two groups of systems, based on whether they generate symbolic music or audio.
:::{table} Real-time music co-creation systems discussed in this part.
:label: tbl-realtime-overview

| Domain | What the system does | Examples |
| --- | --- | --- |
| **Symbolic music** | Listens to a player's notes and responds with notes or chords (e.g., accompaniment, call-and-response) | jam_bot (ISMIR'25), [ReaLchords](https://arxiv.org/abs/2506.14723) (ICML'24), [ReaLJam](https://arxiv.org/abs/2502.21267) (CHI EA'25) |
| **Audio** | Streams audio continuously, steered by text or by what a user plays | [LMDM](https://arxiv.org/abs/2605.22717) (2026), [Streaming Generation](https://arxiv.org/abs/2510.22105) (ISMIR'26), [Magenta RT](https://arxiv.org/abs/2508.04651) (NeurIPS'25) |

:::
Symbolic systems generate notes or chords that can be played through a synthesizer or other MIDI-compatible instrument. Audio systems generate the sound itself, including timbre and performance details. This gives them different expressive possibilities, but also increases the amount of information they must produce in time.

---

## Symbolic music accompaniment: ReaLchords and ReaLJam

ReaLchords generates chord accompaniment to a melody as it is played [@wu2024realchords]. ReaLJam builds on this work with an interface and communication protocol for live interaction [@scarlatos2025realjam]. Together, they illustrate two parts of the problem: learning to accompany without future context, and delivering those predictions in a playable system.

:::{figure} ../assets/composers/part2/realchords-online-accompaniment.png
:label: fig-realchords-online
:alt: Online accompaniment: the user's melody arrives as orange notes up to a dashed "now" line; AI chords C, G, Am have been played, and the model predicts the next chord F just after "now", before hearing the melody that goes with it.
:width: 80%

Online accompaniment. The model must choose the next chord (in this example, F) without hearing the melody note it will accompany.
:::

### Training ReaLchords: an online student and an offline teacher

ReaLchords must choose chords without knowing the upcoming melody. Its online model (the student) uses only past melody notes and chords. Learning from existing songs alone does not fully solve this problem: the harmonies in those songs were composed with knowledge of the melody, while the live model has only partial information.

To improve accompaniment under this constraint, ReaLchords fine-tunes the student with reinforcement learning using two sources of guidance

- **An offline teacher** has access to the complete melody. A KL-divergence term encourages the student’s chord predictions to stay close to the teacher’s distribution, even though the student has less information.
- **Reward models** score how well the generated chords fit the melody. Contrastive and discriminative models learn from real melody–chord pairs and mismatched examples.

```{math}
:label: eq-realchords
\max_{\theta}\; \mathbb{E}_{x \sim p_{\text{data}}}\Big[ -D_{\mathrm{KL}}\big(\pi_{\theta} \,\|\, \phi\big) \;+\; \mathbb{E}_{y \sim \pi_{\theta}(\cdot \mid x)}\big[ R(x, y) \big] \Big]
```

Here $\pi_\theta$ is the online policy, $\phi$ the offline teacher, $x$ the melody, $y$ the chords, and $R$ the combined reward.

:::{figure} ../assets/composers/part2/realchords-training.png
:label: fig-realchords-training
:alt: ReaLchords training diagram: an online policy generates chords from melody x; an offline teacher scores them through a KL term; contrastive and discriminative reward models, trained on real (blue) and mismatched (pink) melody-chord pairs, provide rewards.
:width: 100%

ReaLchords training. The online policy (student) is fine-tuned with a KL term toward an offline teacher that sees the whole melody, plus rewards from models trained to separate real from mismatched melody–chord pairs. Figure adapted from Wu et al. (2024).
:::

### ReaLJam: making it playable

ReaLJam connects a server-side model (ReaLchords) to a musician playing in a browser. It needs to account for computation and communication delays while keeping the accompaniment responsive. Three features help manage this [@scarlatos2025realjam]:

1. **Plan ahead.** The agent continually predicts four beats of melody and chords. The predicted melody is its estimate of what the musician will play, giving it a basis for preparing the accompaniment.
2. **Commit near playback.** Chords within a short commit window are fixed so they can be scheduled reliably. Later chords remain open to revision as new notes arrive.
3. **Show upcoming chords.** The interface displays the plan, helping the musician anticipate the accompaniment and respond to it.

:::{figure} ../assets/composers/part2/realjam-plan-and-commit.png
:label: fig-realjam-plan
:alt: ReaLJam timeline: after "now", a 4-beat lookahead contains a predicted (dashed) melody and planned chords; the first two chords (Am, Am) are inside the commit window and locked, while later chords (F, G) can still change.
:width: 75%

ReaLJam plans 4 beats ahead, commits only the chords near "now", and regenerates the rest. The dashed melody is the agent's guess of what the user will play.
:::

:::{tip} Anticipation, implicit and explicit
ReaLchords learns to anticipate *implicitly*, inside its training objective. ReaLJam makes anticipation *explicit* at run time: it predicts the user's melody, plans chords against that prediction, and shows the plan. A user study with experienced musicians found that ReaLJam enables enjoyable and musically interesting sessions [@scarlatos2025realjam].
:::

---

## Symbolic co-performance: jam_bot

Jam_bot supports live human–AI improvisation and was developed at the MIT Media Lab with keyboardist Jordan Rudess [@blanchard2025jambot]. It debuted in concert in 2024, bringing model design, personalisation, and performance software into the same project.

:::{card} Official jam_bot project page
:link: https://jam-bot-ismir-2025.media.mit.edu/
Musical examples by the authors [@blanchard2025jambot]: jam-bot-ismir-2025.media.mit.edu
:::

:::{iframe} https://www.youtube.com/embed/7Lzz2jvto38
:label: vid-jambot-performance
:width: 100%

Jordan Rudess performing with jam_bot ("Jordan Rudess + jam_bot: A Human-AI Musical Dialogue").
:::

Its design combines several forms of interaction with training and inference choices tailored to live use:

- **Interaction modes.** The musician and agent can trade phrases, the agent can accompany a melody, or it can play a melody over the musician’s chords. These modes use different context and conditioning signals for the music language model.
- **Personalization.** Models are fine-tuned on Rudess’s recordings, which he structured to demonstrate the playing styles needed for particular pieces.
- **Inference and scheduling.** Separate threads handle listening, model requests, and playback scheduling. Notes are generated ahead of time so they are ready to play on schedule. A follow-up implementation moved from ONNX Runtime to ggml [@blanchard2026jambotnime]. For a 170M-parameter model with a 120-token context, it reduced generation time from about 4 to 2 ms per token on an RTX 4090; inference on an M3 Max laptop took about 10 ms per token.

:::{figure} ../assets/composers/part2/jambot-interaction-modes.png
:label: fig-jambot-modes
:alt: A pianist with headphones at a keyboard, next to three piano-roll panels showing user input (orange) and agent input (purple): user and agent trade bars; agent accompanies user melody; agent improvises on top of user chords.
:width: 75%

jam_bot interaction modes: trading bars, accompanying the user's melody, and improvising over the user's chords.
:::

---

## Audio co-performance

Audio generation brings timbre and texture into the interaction, alongside notes and rhythm. Streaming models produce sound in chunks and allow users to influence the music as it plays. The examples here support three overlapping forms of interaction:

:::{figure} ../assets/composers/part2/audio-co-performance.png
:label: fig-audio-coperformance
:alt: Three cards. 1. Text control: the prompt changes from "lo-fi piano" to "drum-n-bass" while the model keeps playing. 2. Respond to your playing: the model hears the musician's live audio and answers or varies it. 3. Accompaniment: the model generates a bass part matching a live guitar.
:width: 100%

Three ways to co-perform with an audio model.
:::

1. **Text control.** Change the prompt while the model plays, and the music morphs into the new style (e.g., Magenta RT, LMDM).
2. **Respond to your playing.** The model hears the musician's live audio and answers or varies it (e.g., Magenta RT's audio injection, LMDM's generative delay).
3. **Accompaniment.** The model generates a matching part for another instrument's live audio or MIDI (e.g., streaming accompaniment, LMDM, applications built on Magenta RT 2).

:::{iframe} https://www.youtube.com/embed/7UXvea7gcps
:label: vid-respond
:width: 100%

Guitarist Sebastian Franjou playing with LMDM's generative delay, which responds to their playing. Video from Novack et al. (2026) [@novack2026lmdm].
:::

### Approaches to streaming audio

**Magenta RT / Live Music Models.** Magenta RealTime generates audio continuously and accepts text and audio prompts [@lyria2025livemusicmodels]. Its first version uses a 750M-parameter model. With audio injection, live input is mixed into the audio context used for generation, allowing the musician’s playing to influence what comes next. Magenta RealTime 2 includes 2.4B- and 230M-parameter models designed for local use, with MIDI, text, and audio controls [@magenta2026mrt2].

**Live Music Diffusion Models (LMDM).** Diffusion-based music generators commonly produce a complete clip in one pass through the generation process. LMDM adapts Stable Audio Open Small for streaming [@novack2026lmdm], with changes to inference, training, and live interaction:

- **Reuse earlier computation.** Block-wise KV caching lets new audio blocks reuse computation from previous blocks. In the paper’s comparison, time to first frame was about 0.03 seconds for LMDM and 4 seconds for Magenta RT.
- **Train on generated context.** ARC-Forcing uses adversarial post-training on the model’s own rollouts to reduce error accumulation during long generations, without explicit reinforcement learning or reward models.
- **Use delay as part of the interaction.** LMDM runs on a consumer gaming laptop as a generative delay. It buffers $S$ seconds of input, computes for $\tau$ seconds, and produces an $S$-second output block. The resulting delay is $\Delta = S + \tau$. Sustained streaming requires $\tau < S$; the roughly one-second delay becomes an audible transformation of the musician’s playing, rather than an attempt at immediate accompaniment.

**Streaming generation for accompaniment.** Here, the model must generate an accompanying part while listening to a live input, such as a singer. @wu2026streaming study two variables: future visibility $t_f$, which specifies how far the available input extends relative to output playback, and chunk size $k$, the amount generated per call. Negative future visibility means the model must predict ahead to compensate for system delay.

Their experiments with transformer decoders show a trade-off. Access to later input improves coherence, but leaves less time to compute before playback. Larger chunks improve throughput, but reduce how often the accompaniment can respond. The study also finds that maximum-likelihood training alone struggles to produce coherent accompaniment without future context, motivating approaches that explicitly train anticipation.

:::{important} Timing is part of the interaction

These systems make different choices about when to listen, generate, and commit. ReaLJam revises a plan until playback approaches; jam_bot schedules notes in advance; LMDM makes a longer delay part of the musical interaction. Low latency matters, but so does choosing a timing structure that suits the way the musician and system play together.

:::
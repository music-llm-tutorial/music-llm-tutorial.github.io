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

In [Part 1](part1-suggestions.md), the creator and the model take turns: ask, receive, edit, ask again. Music, however, is often made by *playing*. This part looks at systems that respond to a musician **while the music is happening**, and at the engineering needed to make large generative models fast enough to play along.

## Why real-time improvisation?

People brainstorm musical ideas by playing instruments or by singing [@kim2025amuse]. A system that can join in at that moment opens up new roles for AI. A real-time improvisation AI could be:

- **a jam partner at 3 am**, when no one else is around;
- **a mirror of your own playing style**, for reflection and growth [@blanchard2025jambot]; and
- someday, **a partner that responds faster than any human**, opening up new ways to make music [@kim2026designspace].

A review of 184 live music agent systems found that only about 6% of them use generative transformers [@kim2026designspace]. Bringing modern generative models into live performance is still a young area, and it comes with constraints that turn-based suggestion systems never face.

## How does real-time music AI work? Frame-based processing

Real-time audio software does not process a whole song at once. It processes the signal in short **frames** (also called blocks or buffers). While one frame is playing, the system computes the next one. The rule is simple: **each frame must be ready before the current frame finishes playing.** If it is late, the listener hears a gap or a glitch [@donahue2026pcm].

:::{figure} ../assets/composers/part2/frame-based-processing.gif
:label: fig-frame-based
:alt: Animation of frame-based processing: user input arrives in colored frames on the top row, and the corresponding AI output frames are produced on the bottom row, each one frame later, while a playhead moves from left to right.
:width: 100%

Frame-based processing. Each colored frame of user input (top) is turned into a frame of output (bottom) that plays one frame later. Animation from Chris Donahue, *Principles of Computer Music*, [§10.6 Real-time Processing](https://www.cs.cmu.edu/~15322/book/ch10/06.html) (CMU 15-322).
:::

Two quantities follow from this picture. The **latency** of the system is at least one frame: the output for a frame of input can only start after that frame has been fully received and processed. The **compute budget** for each frame is the frame's duration: if the model takes longer than that to produce the next frame, the system falls behind. Smaller frames mean lower latency but less time to compute each one.

For generative music models, a "frame" might be a block of audio samples, a chunk of codec tokens, or a beat of chords, but the same rule applies.

## What makes real-time generation hard?

1. **Tight latency budget.** Playing together requires latency below roughly 100 ms, which large generative models rarely meet. Bigger models sound better but need server GPUs, which add network delay; local hardware avoids that delay but caps model size and quality [@kim2026designspace; @blanchard2025jambot; @lyria2025livemusicmodels].
2. **No future context.** A human accompanist listens and adapts, but also anticipates. The model must commit to its output *before* hearing what the human plays next. A chord chosen for beat 4 is already sounding when the melody note for beat 4 arrives.
3. **Responsiveness vs. throughput.** Generating larger chunks at once is more efficient on a GPU, but it reduces how often the model can react to the musician.

## How systems meet the latency budget

The systems in this part combine techniques at three stages of the pipeline [@blanchard2025jambot; @wu2024realchords; @novack2026lmdm; @wu2026streaming].

:::{table} Where real-time systems save time.
:label: tbl-latency-budget

| Stage | Techniques | Examples in this part |
| --- | --- | --- |
| **Training time** | Compact tokens; training the model to *predict ahead*; post-training for robustness to its own mistakes | ReaLchords learns to anticipate from an offline teacher; LMDM's ARC-Forcing reduces error accumulation over long rollouts |
| **Inference time** | KV caching; asynchronous generation (generate ahead, schedule early, keep regenerating) | LMDM's block-wise KV caching; ReaLJam's lookahead and commit window; jam_bot's generate-ahead scheduling |
| **Deployment time** | Quantization; compiled, lightweight runtimes | jam_bot's move to a ggml runtime |
:::

## Overview: real-time music co-creation

Real-time systems split naturally by the kind of music data they handle.

:::{table} Real-time music co-creation systems discussed in this part.
:label: tbl-realtime-overview

| Domain | What the system does | Examples |
| --- | --- | --- |
| **Symbolic music** | Listens to a player's notes and responds with notes or chords (e.g., accompaniment, call-and-response) | jam_bot (ISMIR'25), [ReaLchords](https://arxiv.org/abs/2506.14723) (ICML'24), [ReaLJam](https://arxiv.org/abs/2502.21267) (CHI EA'25) |
| **Audio** | Streams audio continuously, steered by text or by what a user plays | [LMDM](https://arxiv.org/abs/2605.22717) (2026), [Streaming Generation](https://arxiv.org/abs/2510.22105) (ISMIR'26), [Magenta RT](https://arxiv.org/abs/2508.04651) (NeurIPS'25) |
:::

Symbolic models are small and fast, and their output (MIDI) can be played on any instrument. Audio models can produce any sound, but they must generate tens of thousands of samples per second of music, which makes the latency budget much harder to meet.

---

## Symbolic music accompaniment: ReaLchords and ReaLJam

**ReaLchords** improvises chord accompaniment to a user's melody in real time [@wu2024realchords]. **ReaLJam** is the interface and protocol that turns it into a live jamming system [@scarlatos2025realjam]. We first look at how the model is trained, then at what ReaLJam adds to make it playable.

:::{figure} ../assets/composers/part2/realchords-online-accompaniment.png
:label: fig-realchords-online
:alt: Online accompaniment: the user's melody arrives as orange notes up to a dashed "now" line; AI chords C, G, Am have been played, and the model predicts the next chord F just after "now", before hearing the melody that goes with it.
:width: 80%

Online accompaniment. At "now", the model must choose the next chord (F) without hearing the melody note it will accompany.
:::

:::{note} Watch
▶ [ReaLJam demo video](https://drive.google.com/file/d/1zYEBxZiWzks_U-R1FPLBSMEapDcjdhpy/view)
:::

### Training ReaLchords: an online student and an offline teacher

The core difficulty is the second challenge above: there is no future context. An **online policy** (the student) predicts the next chord from the *past* melody and chords only. Trained only by imitation (maximum likelihood) on existing songs, such a model tends to produce chords that do not fit the melody, because in the training data the chord and the melody note were written together, but at performance time the model never sees the note before it commits.

ReaLchords fine-tunes the online model with reinforcement learning, using two signals ([](#fig-realchords-training)):

- **An offline teacher.** A second model sees the *whole* melody, including the future. A KL-divergence term keeps the student close to the teacher's chord distribution, so the student learns to *anticipate* where the melody is going.
- **Reward models.** Contrastive and discriminative reward models learn to tell real melody–chord pairs (blue in the figure) from mismatched ones (pink), and are then used to score the student's chords for harmonic fit.

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

A well-trained model is not yet a jam partner. The model runs on a server, the musician plays in a browser, and both need to know what the other is about to do. ReaLJam adds three ideas [@scarlatos2025realjam]:

1. **Plan ahead.** The agent continually generates the next **4 beats** of both melody (its guess of what the user will play, dashed in [](#fig-realjam-plan)) and chords, so a chord is always ready before it is needed.
2. **Commit window.** Because human performance can change, only the chords near "now" are locked in. The rest of the plan is regenerated every frame as new melody notes arrive.
3. **Show the plan.** Upcoming chords are displayed in the interface, so the musician can anticipate the agent the same way the agent anticipates the musician.

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

**jam_bot** is a live music agent that supports human–AI free improvisation on stage [@blanchard2025jambot]. It was developed at the MIT Media Lab with keyboardist Jordan Rudess and debuted in a sold-out concert in 2024.

:::{figure} ../assets/composers/part2/jambot-stage.jpg
:label: fig-jambot-stage
:alt: Dark concert stage with a performer at a keyboard surrounded by an installation of illuminated leaf-shaped lights.
:width: 80%

jam_bot on stage. ▶ [Watch the performance video](https://drive.google.com/file/d/1BJYvs6OAnlMJ9PfnjxV1lnz0YF1ilHtt/view).
:::

Three design decisions turn a symbolic music language model into a stage-ready partner:

- **Several interaction modes from one model.** Call-and-response (user and agent trade bars), AI accompaniment (the agent accompanies the user's melody), and AI melody lead (the agent improvises over the user's chords). Rather than training a separate model for each, jam_bot changes the *context and conditioning signals* given to the music language model.
- **Personalization.** The models are fine-tuned on Rudess's own recordings, which he deliberately structured so the agent could learn the style needed for each piece.
- **Efficient inference.** A low-latency, multi-threaded system listens, prompts the model, and schedules its generations ahead of time. A follow-up [@blanchard2026jambotnime] moved inference from ONNX Runtime to the lightweight ggml runtime, reducing generation time from about 4 to about 2 ms per token for a 170M-parameter model on an RTX 4090 (about 10 ms per token on an M3 Max laptop) with a 120-token context, and generates notes ahead of time so they can be scheduled early.

:::{figure} ../assets/composers/part2/jambot-interaction-modes.png
:label: fig-jambot-modes
:alt: A pianist with headphones at a keyboard, next to three piano-roll panels showing user input (orange) and agent input (purple): user and agent trade bars; agent accompanies user melody; agent improvises on top of user chords.
:width: 75%

jam_bot interaction modes: trading bars, accompanying the user's melody, and improvising over the user's chords.
:::

---

## Audio co-performance

Audio models can produce any sound, including timbres that no MIDI instrument can, but meeting the latency budget is much harder. Recent *live music models* generate audio continuously in short chunks and can be steered while they play. From a creator's point of view, they support three kinds of co-performance.

:::{figure} ../assets/composers/part2/audio-co-performance.png
:label: fig-audio-coperformance
:alt: Three cards. 1. Text control: the prompt changes from "lo-fi piano" to "drum-n-bass" while the model keeps playing. 2. Respond to your playing: the model hears the musician's live audio and answers or varies it. 3. Accompaniment: the model generates a bass part matching a live guitar.
:width: 100%

Three ways to co-perform with an audio model.
:::

1. **Text control.** Change the prompt while the model plays, and the music morphs into the new style (e.g., Magenta RT, LMDM). ▶ [Prompt-mixing demo](https://drive.google.com/file/d/1-55Lw7v2HfeWYvmv1Hse27yHFkhcuofU/view)
2. **Respond to your playing.** The model hears the musician's live audio and answers or varies it (e.g., Magenta RT's audio injection, LMDM's generative delay).
3. **Accompaniment.** The model generates a matching part for another instrument's live audio or MIDI (e.g., streaming accompaniment, LMDM, applications built on Magenta RT 2). ▶ [Accompaniment demo](https://drive.google.com/file/d/1zeIMZ_RSKnm_FW3nkXIlFyyDEjtHB7ij/view)

:::{iframe} https://www.youtube.com/embed/7UXvea7gcps
:label: vid-respond
:width: 100%

A guitarist playing with a live audio model that responds to their playing.
:::

### How these systems meet the budget

**Magenta RT / Live Music Models.** Magenta RealTime is an open live music model (750M parameters in its first version) that generates audio continuously in chunks and can be steered with text and audio prompts, including *audio injection*, where the musician's live audio is mixed into the audio the model conditions on, so the model responds to it [@lyria2025livemusicmodels]. Magenta RealTime 2 adds smaller models (2.4B and 230M parameters) designed to run locally, for example on a laptop, with MIDI, text, and audio control [@magenta2026mrt2].

**Live Music Diffusion Models (LMDM).** Most open-source audio generators are diffusion models, which normally generate a whole clip at once rather than streaming. LMDM repurposes such a model (Stable Audio Open Small) into a streaming generator [@novack2026lmdm]:

- *Inference time:* block-wise **KV caching** lets each new block of audio reuse computation from previous blocks, recovering and then exceeding the efficiency of autoregressive live music models. The paper reports a time to first frame of about 0.03 s, compared with about 4 s for Magenta RT measured in the same setting.
- *Training time:* **ARC-Forcing**, an adversarial post-training recipe, trains the model on its own rollouts so errors do not accumulate over long performances, without explicit reinforcement learning or reward models.
- *Deployment:* LMDM runs locally on a consumer gaming laptop as a **generative delay**. The system buffers $S$ seconds of the musician's input, runs inference in $\tau$ seconds, and writes an $S$-second output block, giving a fixed delay $\Delta = S + \tau$. Real time only requires $\tau < S$, so instead of fighting for 100 ms the system turns a roughly one-second delay into a musical effect that transforms the musician's improvisation.

**Streaming generation for accompaniment.** Here the model listens to a live audio stream (e.g., a singer) and must emit an accompanying stream (e.g., a guitar part) at the same time. @wu2026streaming formalize this with two design variables: the **future visibility** $t_f$, the offset between the output's playback time and the latest input the model can condition on (a negative $t_f$ means the model predicts ahead to compensate for system latency), and the **chunk size** $k$, the amount of audio emitted per model call. Training transformer decoders across a grid of $(t_f, k)$ shows exactly the trade-offs from the start of this part: more effective future visibility improves coherence but demands faster inference, and larger chunks improve throughput but degrade the accompaniment because the model updates less often. The authors also find that naive maximum-likelihood streaming training is not enough for coherent accompaniment without future context, which motivates anticipatory training objectives like those of ReaLchords.

:::{important} The common pattern
Whether symbolic or audio, real-time systems trade some *responsiveness* for *time to think*: they plan ahead (ReaLJam), schedule early (jam_bot), accept a fixed musical delay (LMDM), or limit how much of the partner they can see (streaming accompaniment). Deciding which trade-off feels musical is as much an interaction design question as an engineering one.
:::

## Further reading

- A design space for live music agents, covering 184 systems across research and artistic practice [@kim2026designspace].
- The Ghost in the Keys, a Disklavier demo of human–AI musical co-creativity [@bradshaw2025ghost].

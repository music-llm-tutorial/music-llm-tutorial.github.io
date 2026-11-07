---
title: Music as Audio
authors:
  - name: Zachary Novack
---

Most music reaches listeners as sound, and most music LLMs read audio. This page
follows the reel from its waveform to the tokens an LLM reads, then runs it
through an open audio LLM.

(sec-und-signal)=
## From waveform to spectrogram

A digital recording is a *waveform*: a list of air-pressure values, sampled
tens of thousands of times per second. The reel file has 22,050 samples per
second, so its eight seconds hold about 176,000 numbers
({numref}`fig-und-waveform`). A three-minute stereo song at the CD rate of
44,100 Hz holds about 16 million. An LLM's context window counts tokens in the
thousands to the hundreds of thousands, so one token per sample is out of the
question. Every audio LLM first compresses the signal.

:::{figure} ../assets/understanding/reel_waveform.png
:label: fig-und-waveform
:alt: The eight-second waveform of the reel, with regular bursts at each note onset, and a zoom on 12 milliseconds that shows the individual samples as a smooth periodic curve.

The reel's waveform, with a 12 ms zoom. Each dot in the zoom is one sample.
:::

The first step is usually a *spectrogram*. The short-time Fourier transform
(STFT) cuts the signal into short overlapping windows and measures how much of
each frequency each window contains. The result is a complex number per
frequency and time: its *magnitude* says how strong the frequency is, and its
*phase* says where in its cycle the wave is. Magnitude carries most of what
listeners hear, and phase looks like noise to the eye, so most models keep the
magnitude only ({numref}`fig-und-spectrograms`).

Two warped versions are common. A *mel spectrogram* merges the frequency bins
into bands that are narrow at low frequencies and wide at high ones, roughly
following pitch perception. Whisper uses 80 mel bands computed on 25 ms windows
every 10 ms, from audio resampled to 16 kHz [@radford2023robust], and
Qwen2-Audio uses 128 bands with the same window and hop
[@chu_qwen2audio_2024]. A *constant-Q transform* (CQT) spaces its bins
geometrically, so each bin can be one semitone. In the CQT panel, the reel's
notes sit on a piano-roll-like grid. MERT uses a CQT as one of its training
targets [@li_mert_2024].

:::{figure} ../assets/understanding/reel_spectrograms.png
:label: fig-und-spectrograms
:alt: Four views of the eight-second reel. STFT magnitude in decibels, 0 to 4 kHz on a linear axis, shows each note as a stack of evenly spaced harmonics. STFT phase looks like noise. A 128-band mel spectrogram compresses the high frequencies so the low harmonics take more rows. A constant-Q transform from C2 to B7, one bin per semitone, shows the melody and bass notes as short horizontal bars.

Four views of the reel: STFT magnitude, STFT phase, mel spectrogram, and
constant-Q transform.
:::

All four views take a few lines of librosa [@librosa]:

```python
import numpy as np, librosa

y, sr = librosa.load("reel.mp3", sr=22050)        # 176,392 samples
S = librosa.stft(y, n_fft=2048, hop_length=512)   # complex, 1025 bins x 345 frames
magnitude_db = librosa.amplitude_to_db(np.abs(S), ref=np.max)
phase = np.angle(S)

mel = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=2048, hop_length=512, n_mels=128)
mel_db = librosa.power_to_db(mel, ref=np.max)    # 128 bands x 345 frames

cqt = librosa.cqt(y, sr=sr, hop_length=512, fmin=librosa.note_to_hz("C2"),
                  n_bins=72, bins_per_octave=12)  # one bin per semitone, C2 to B7
cqt_db = librosa.amplitude_to_db(np.abs(cqt), ref=np.max)
```

A spectrogram is smaller than the waveform but still large: 128 mel bands every
10 ms is 12,800 numbers per second. The encoder's job is to summarize it.

(sec-und-encoders)=
## Where the encoder comes from

An *audio encoder* is a neural network that turns the spectrogram (or the
waveform) into a sequence of vectors, each summarizing a short stretch of time.
Audio LLMs get their encoder in one of three ways ({numref}`fig-und-encoders`).

:::{figure} ../assets/understanding/encoders.svg
:label: fig-und-encoders
:alt: Three columns. Borrowed encoders: Whisper, trained for speech recognition on 680,000 hours, used by Qwen2-Audio and SALMONN; MERT, self-supervised on music, used by MusiLingo and MU-LLaMA; Jukebox, a music generation model, used by LLark; CLAP, trained to match audio and text, retrained as AF-CLAP for Audio Flamingo 2. Encoders trained for the LLM: AF-Whisper in Audio Flamingo 3, which starts from Whisper large-v3 and is trained on audio captions; AuT in Qwen3-Omni, trained from scratch on 20 million hours and producing 12.5 tokens per second. No encoder: Gemma 4 12B cuts 16 kHz audio into 40 ms chunks of 640 numbers and projects them directly; Inkling feeds dMel spectrogram features through a light-weight embedding layer. An arrow below runs from reusing outside knowledge to making fewer fixed choices about the input.

Three sources of audio encoders.
:::

**Borrowed encoders.** The first music LLMs reused an encoder trained for
something else, often frozen.

- Whisper was trained to transcribe speech, on 680,000 hours of labeled audio
  [@radford2023robust]. Qwen2-Audio initializes its encoder from Whisper-large-v3
  and adds a pooling layer with stride two, so each output vector covers about
  40 ms [@chu_qwen2audio_2024]. SALMONN runs two encoders side by side, Whisper's
  for speech and BEATs [@chen_beats_2023] for other sounds, both at 50 vectors
  per second [@tang_salmonn_2024].
- MERT is trained on music without labels. It learns to predict two targets
  for masked stretches of audio: codes from an acoustic tokenizer, such as
  EnCodec, and a CQT [@li_mert_2024]. It comes in sizes from 95M to 330M parameters.
  MusiLingo uses MERT-v1-330M [@deng_musilingo_2024], and MU-LLaMA uses a frozen
  MERT encoder [@liu_music_2024].
- Jukebox is a music *generation* model [@dhariwal2020jukebox]. LLark takes the
  output of layer 36 of Jukebox-5B's encoder, 4,800-dimensional vectors at
  345 Hz, and mean-pools them in 100 ms frames, so the LLM gets 10 vectors per
  second [@gardner2023llark].
- CLAP is trained to match audio with text descriptions [@wu2023large].
  Audio Flamingo 2 trains its own version, AF-CLAP, on 8,037,712 ten-second
  audio–caption pairs [@ghosh_af2_2025].

A borrowed encoder brings what it learned from its own training data, but it
was not built for the LLM. Whisper's training targets are transcripts, which say
little about harmony or timbre. Two ISMIR 2026 papers probe what contrastive
encoders capture. One finds that LAION-CLAP aligns relatively well with
human-perceived timbre semantics, but that current language–audio embeddings
capture them only partially, and reverb more consistently than equalization
[@deng_timbre_2026]. Another adds album reviews from AllMusic, turned into
captions, as extra training text for a music CLAP model, with the largest
retrieval gains on a benchmark of human-written captions
[@alonso_allmusiccaps_2026].

**Encoders trained for the LLM.** Newer models train the encoder as part of the
LLM project. Audio Flamingo 3 starts from Whisper large-v3, attaches a text
decoder, and trains the pair to generate audio captions, to get AF-Whisper
[@goel_af3_2025]. Qwen3-Omni replaces Whisper with AuT, an encoder of about 0.6B
parameters trained from scratch on 20 million hours of supervised audio. It
downsamples its 128-band mel spectrogram eight times, to 12.5 vectors per second,
about 80 ms each [@qwen3omni_2025].

**No encoder.** In 2026, two model families dropped the audio encoder. Gemma 4
12B segments raw 16 kHz audio into 40 ms chunks, which gives 640-dimensional
vectors that are "projected directly into the LLM embedding space"
[@gemma4_2026]. Images get the
same treatment: 48×48 RGB patches pass through a single matrix multiplication
instead of a 550M-parameter vision encoder. The smaller Gemma 4 models, E2B and
E4B, still use a 305M-parameter audio encoder. Inkling, an open-weights
mixture-of-experts model with 975B total and 41B active parameters, inputs
audio as dMel spectrograms, a quantized mel representation, and passes them
through "a light-weight embedding layer" processed jointly with text tokens
[@thinkingmachines_inkling_2026]. Its announcement does not state the frame
length.

The three columns trade borrowed knowledge for flexibility. A borrowed encoder
works with little paired data, but it fixes the sample rate, the frame rate,
and the clip length it was trained on. An encoder-free model makes almost no
such choices, but the LLM itself must learn to hear, which takes far more data
and compute.

(sec-und-adapters)=
## Adapters

The encoder's vectors do not match the LLM's token embeddings in size or in
meaning, so an *adapter* translates them. There are three main designs
({numref}`fig-und-adapters`).

:::{figure} ../assets/understanding/adapters.svg
:label: fig-und-adapters
:alt: Left, projection: each encoder frame passes through a linear layer or small MLP and becomes one LLM token, so the token count grows with the length of the audio; LLark uses 10 tokens per second and Qwen2-Audio about 25. Right, Q-Former: a small Transformer with a few learned query vectors. The queries attend to each other and cross-attend to the encoder frames, and only the query outputs go to the LLM, so each window gives a fixed number of tokens; BLIP-2 uses 32 queries per image and SALMONN one query per 0.33-second window, 88 tokens for 30 seconds.

Projection keeps one token per frame. A Q-Former keeps a fixed number of tokens
per window.
:::

**Projection.** The simplest adapter applies the same linear layer, or a small
MLP, to every encoder vector. LLaVA connects an image encoder to an LLM with
"a trainable projection matrix" [@liu_llava_2023], and LLark's projection module
"is parameterized by a single linear projection layer" [@gardner2023llark].
MusiLingo adds a temporal compression step after its linear layer
[@deng_musilingo_2024]. With projection, the number of tokens grows with the
length of the audio.

**Q-Former.** BLIP-2 introduced the *Querying Transformer* to connect a frozen
image encoder to a frozen LLM [@li_blip2_2023]. It is a small Transformer,
initialized from BERT-base, that holds 32 learned *query* vectors of 768
dimensions. The queries attend to each other with self-attention and to the
encoder's outputs with cross-attention layers, inserted every other block. Only
the 32 query outputs pass on, through a fully connected layer, to the LLM. The
image, however many patches it has, becomes 32 tokens. SALMONN applies the same
idea to audio in windows: one query per window of 17 encoder frames, about 0.33
s, which gives 88 tokens for 30 seconds of audio [@tang_salmonn_2024]. Flamingo's
*Perceiver Resampler* works in a similar way and outputs a fixed 64 visual
tokens [@alayrac_flamingo_2022].

A Q-Former controls the token budget, but it has to decide what to keep before
the LLM sees the question. Projection keeps everything and leaves the choice to
the LLM's attention, at the cost of more tokens.

**Codec tokens.** A third option skips continuous vectors. A neural audio codec
compresses the waveform into a few discrete codes per frame with *residual
vector quantization*: EnCodec produces 75 frames per second at 24 kHz
[@DBLP:journals/tmlr/DefossezCSA23], and DAC compresses 44.1 kHz audio about 90
times, at 86 frames per second [@kumar2023high]. The codes become new tokens in
the LLM's vocabulary. AudioPaLM expands PaLM-2's embedding matrix with audio
tokens, at 25 per second from a vocabulary of 1,024 for one of its tokenizers
[@rubenstein_audiopalm_2023]. AnyGPT tokenizes music with an EnCodec variant at
32 kHz and 50 frames per second, with four codebooks of 2,048 codes each
[@zhan-etal-2024-anygpt]. Because audio is now ordinary tokens, the same LLM can
also *generate* audio ([Chapter 1](#sec-next-token) describes this briefly), but
a codec's codes are made to rebuild the waveform, so a second of music costs
many tokens.

MU-LLaMA does something different again. Its adapter does not put tokens in the
sequence: after a 1D convolution and dense blocks, its output is "multiplied to
the queries in the multi-headed attention" in the last layers of LLaMA-2
[@liu_music_2024].

(sec-und-conditioning)=
## Where the music sits

Once adapted, the music has to reach the LLM's computation. There are two
places to put it ({numref}`fig-und-cross-self`).

:::{figure} ../assets/understanding/cross-self.svg
:label: fig-und-cross-self
:alt: Left: music tokens sit in the LLM's input sequence before the text tokens, and every layer's self-attention lets text tokens attend to them, as in LLaVA, LLark and Qwen2-Audio. Right: only text tokens are in the sequence. New gated cross-attention layers between frozen LLM layers read the audio features; each multiplies its output by tanh of a learned scalar that starts at zero, so training starts from the unchanged LLM. Flamingo and Audio Flamingo 1 and 2 use this design.

Music tokens inside the sequence (self-attention) or beside it (gated
cross-attention).
:::

**In the sequence.** The adapted tokens are placed in the input next to the
text, and the LLM's ordinary self-attention reads them. Every layer can mix
music and text, and nothing in the LLM changes except its inputs. LLaVA, LLark,
and Qwen2-Audio work this way. The cost is context: every music token takes a
place in the window.

**Beside the sequence.** Flamingo freezes the LLM and inserts new *gated
cross-attention* layers between its layers [@alayrac_flamingo_2022]. Text tokens
stay in the sequence; the new layers let them attend to the visual (or audio)
features. Each new layer multiplies its output by $\tanh(\alpha)$, where
$\alpha$ is a learned scalar that starts at 0, so at the start of training the
model is exactly the original LLM. Audio Flamingo uses these layers with a CLAP-
based feature extractor and 7-second sliding windows, up to 16 windows or 33.25
seconds [@kong2024audio_flamingo]. Audio Flamingo 2 keeps the design and extends
it to 30 windows, five minutes of audio [@ghosh_af2_2025].

(sec-und-interleaving)=
### Prefix, coarse, and fine interleaving

Inside the sequence, there is still a choice of order ({numref}`fig-und-interleave`).

:::{figure} ../assets/understanding/interleave.svg
:label: fig-und-interleave
:alt: Three ways to order music and text tokens in one sequence. Prefix: the whole clip, then the text; Qwen2-Audio and LLark work this way. Coarse interleaving: long chunks in time order; Qwen2.5-Omni cuts video and audio into 2-second chunks and ties positions to time with TMRoPE. Fine interleaving: a few tokens of each stream at a time; CosyVoice 2 alternates 5 text and 15 speech tokens, GLM-4-Voice 13 text and 26 speech tokens, and Spirit LM switches at word boundaries.

Three orders for music and text tokens.
:::

- **Prefix.** The whole clip comes first, then the question. This is the usual
  setup for answering questions about a clip, and the one the code below uses.
- **Coarse interleaving.** Streams alternate in long chunks, in time order.
  Qwen2.5-Omni cuts the representations of video and its audio "into chunks
  every 2 seconds according to the actual time" [@xu_qwen25omni_2025]. Its
  TMRoPE position encoding gives each token a position tied to time, and Music
  Flamingo's RoTE likewise sets the rotation angle "using absolute timestamps
  rather than token indices" [@ghosh_musicflamingo_2026]. Time-tied positions
  matter for questions about *when* something happens in a song.
- **Fine interleaving.** Streams alternate every few tokens, usually so a model
  can speak while it writes. CosyVoice 2 alternates 5 text tokens with 15 speech
  tokens at 25 speech tokens per second [@du_cosyvoice2_2024], GLM-4-Voice
  alternates 13 text and 26 speech tokens at 12.5 per second
  [@zeng_glm4voice_2024], and Spirit LM switches between speech and text at
  word boundaries [@nguyen_spiritlm_2025]. These are speech models, but music
  has the same need when text must stay in step with sound, as with lyrics.

(sec-und-token-budget)=
## The token budget

The adapter and the encoder set how many tokens a minute of music costs, and
that sets how much music fits in a context window. {numref}`tbl-und-budget`
lists the rates of the models on this page.

:::{table} Audio tokens per second and per three-minute song.
:label: tbl-und-budget
:align: left

| Model | Audio tokens per second | Per 3-minute song |
|---|---|---|
| SALMONN (Q-Former, 1 query per 0.33 s) | about 2.9 (88 per 30 s) | about 530 |
| LLark (pooled Jukebox features) | 10 | 1,800 |
| Qwen3-Omni (AuT encoder) | 12.5 | 2,250 |
| Qwen2-Audio, Qwen2.5-Omni (40 ms frames) | 25 | 4,500 |
| Gemma 4 12B (raw 40 ms chunks) | 25 | 4,500 |
:::

Longer audio needs a longer context. Audio Flamingo 3 had a context of 8,192
tokens and about 10 minutes of audio; Music Flamingo extends it to about 24,000
tokens, enough for songs of up to 20 minutes [@ghosh_musicflamingo_2026].
Whisper-based encoders also inherit Whisper's 30-second training segments
[@radford2023robust].

(sec-und-qwen2-audio)=
## Asking an audio LLM about the reel

Qwen2-Audio-7B-Instruct is an open audio LLM on Hugging Face. It is a Qwen-7B
LLM with a Whisper-large-v3-based encoder, 8.2B parameters in total
[@chu_qwen2audio_2024]. With the `transformers` library, its processor turns a
chat into token IDs and audio features in one call:

```python
# pip install transformers accelerate librosa
from transformers import AutoProcessor, Qwen2AudioForConditionalGeneration

model_id = "Qwen/Qwen2-Audio-7B-Instruct"
processor = AutoProcessor.from_pretrained(model_id)
model = Qwen2AudioForConditionalGeneration.from_pretrained(
    model_id, dtype="auto", device_map="auto")

conversation = [
    {"role": "user", "content": [
        {"type": "audio", "audio": "reel.mp3"},
        {"type": "text", "text": "What key is this piece in?"},
    ]},
]
inputs = processor.apply_chat_template(
    conversation, add_generation_prompt=True, tokenize=True,
    return_dict=True, return_tensors="pt",
).to(model.device)

n_audio = (inputs["input_ids"] == model.config.audio_token_index).sum().item()
print(n_audio)  # 200: eight seconds at 25 audio tokens per second

output = model.generate(**inputs, max_new_tokens=64)
answer = processor.batch_decode(
    output[:, inputs["input_ids"].shape[1]:], skip_special_tokens=True)[0]
print(answer)
```

The audio becomes 200 placeholder tokens in the prompt, ahead of the question,
and the model replaces their embeddings with the adapted encoder outputs: the
prefix layout of {numref}`fig-und-interleave`. The count follows from the
processor's arithmetic. The mel spectrogram has 100 frames per second; the
encoder's strided convolution halves that, and the pooling layer halves it
again:

```python
def qwen2_audio_tokens(seconds):
    mel_frames = int(seconds * 100)          # 10 ms hop
    after_conv = (mel_frames - 1) // 2 + 1   # stride-2 convolution in the encoder
    return (after_conv - 2) // 2 + 1         # stride-2 pooling: one token per 40 ms

qwen2_audio_tokens(8), qwen2_audio_tokens(30)   # (200, 750)
```

Try the three questions from the [overview](#sec-und-example) on the reel, and
then ask the same questions with no audio at all. The [evaluation
page](#sec-und-needs-music) explains why the second run matters.

:::{dropdown} Running the snippets
The code on this page was checked against `transformers` 5.22 with a tiny,
randomly initialized model of the same architecture, which confirms the API
calls and the 200-token count, but not the real model's answers. In 16-bit
precision, the weights alone of the 8.2B-parameter model take about 16 GB of
GPU memory. Older versions of `transformers`
take `torch_dtype=` instead of `dtype=`. The audio file is in the book's
repository at `book/assets/understanding/reel.mp3`.
:::

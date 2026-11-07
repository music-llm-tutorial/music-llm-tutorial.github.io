---
title: How Music Gets into an LLM
authors:
  - name: Zachary Novack
---

Music papers often split models into "audio" and "symbolic". For an LLM, a more
useful question is *what the model sees*: a signal, a picture, or text. That
choice decides the interface ({numref}`fig-und-routes`). An audio clip needs an
encoder that turns the signal into vectors the LLM can read. A score image can
go to any vision-language model. ABC or MusicXML is already text, so any LLM can
read it with no change at all.

:::{figure} ../assets/understanding/three-routes.svg
:label: fig-und-routes
:alt: The same reel enters an LLM by three routes. Audio goes through an audio encoder and an adapter, about 25 tokens per second in Qwen2-Audio. A score image goes through an image encoder or patch projection and an adapter, as in any vision-language model. Text such as ABC notation needs only the tokenizer, so any text LLM can read it. All three routes end in the same decoder-only LLM, which writes the answer as text.

Three routes for the running example. Only the audio route needs an
audio-specific component.
:::

(sec-und-recipe)=
## The shared recipe

Models that read audio or images follow the same four steps
({numref}`fig-und-recipe`).

:::{figure} ../assets/understanding/recipe.svg
:label: fig-und-recipe
:alt: Four steps shared by audio, image and text routes. Encode: turn audio into a sequence of vectors, or skip the encoder. Adapt: map those vectors to the LLM's embedding size with a projection, a Q-Former, or codec tokens added to the vocabulary. Place: put the music tokens in the LLM's input as a prefix, interleaved with text, or read them through cross-attention. Train: next-token loss on the text answer. Training usually runs in stages: align on captions, instruction-tune on questions and answers, and optionally reinforcement learning with verifiable rewards.

Encode, adapt, place, train.
:::

1. **Encode.** An encoder turns the input into a sequence of vectors, one per
   short frame of audio or patch of image. Qwen2-Audio's encoder, for example,
   gives one vector per 40 ms of audio [@chu_qwen2audio_2024]. Some recent
   models skip the encoder ([](#sec-und-encoders)).
2. **Adapt.** The encoder's vectors have the wrong size and the wrong meaning
   for the LLM. An *adapter* maps them into the LLM's token embedding space. It
   can be a linear layer or a small MLP, as in LLaVA for images and LLark for
   music [@liu_llava_2023; @gardner2023llark], or a small Transformer that
   compresses many frames into a few vectors, the Q-Former
   [@li_blip2_2023; @tang_salmonn_2024]. A third option discretizes the audio
   into codec tokens and adds them to the LLM's vocabulary
   [@rubenstein_audiopalm_2023; @zhan-etal-2024-anygpt]
   ([](#sec-und-adapters)).
3. **Place.** The adapted vectors enter the LLM. Many models put them in the
   input sequence, before the text or interleaved with it, where the LLM's
   self-attention reads them like any other token. Others keep them outside the
   sequence and add cross-attention layers that read them
   [@alayrac_flamingo_2022; @kong2024audio_flamingo]
   ([](#sec-und-conditioning)).
4. **Train.** The training target is the text answer, with the same
   [next-token loss](#sec-next-token) as any LLM. As in [supervised
   fine-tuning](#sec-sft), only the answer tokens carry loss; the music tokens
   and the question are context.

Training usually runs in stages. A first stage aligns the new parts on paired
audio and text, often with the encoder and the LLM frozen: BLIP-2 bridges "a
frozen image encoder and a frozen LLM" [@li_blip2_2023], and MusiLingo keeps its
music encoder and LLM completely frozen and trains only the adapter
[@deng_musilingo_2024]. Later stages tune on instructions and questions, and some
models end with preference or reinforcement learning. Qwen2-Audio runs
pre-training, supervised fine-tuning, and direct preference optimization
[@chu_qwen2audio_2024]. Music Flamingo ends with GRPO, with rewards for answer
format, answer accuracy, and how well a caption matches structured metadata
[@ghosh_musicflamingo_2026]. The [training page](#sec-pretraining) of Chapter 1
describes these stages for text LLMs.

(sec-und-recap)=
## What each route sees

Each route hands the model different evidence. {numref}`tbl-und-routes` sums
up the three routes and one more: text that describes the music, such as a
title, an artist, or tags, with no music at all.

:::{table} What the model sees on each route, and what it has to work out.
:label: tbl-und-routes
:align: left

| Route | What the model sees | Interface | Music-specific training? | Explicit in the input | Must be inferred or is missing |
|---|---|---|---|---|---|
| Audio | the sound | audio encoder + adapter, or a light projection | yes | timbre, performance, mix, production | every note, chord, and beat |
| Score image | the printed page | any vision-language model | no, but notation reading is weak | symbols, layout, bar numbers | the symbols' meaning; how it sounds |
| Symbolic text | ABC, \*\*kern, MusicXML | the tokenizer | no | pitches, durations, voices, key signature | how it sounds; anything the format omits |
| Metadata | title, artist, tags | the tokenizer | no | what the world has written about it | the music itself |
:::

The last row is the baseline people forget. A question about a famous recording
can often be answered from its title alone, because the LLM has read about it.
The [evaluation page](#sec-und-needs-music) returns to this.

The next three pages take the routes in turn:

- [Music as audio](./interfaces_audio.md): waveforms and spectrograms, where
  encoders come from, adapters, and how audio tokens sit next to text.
- [Music as images](./interfaces_images.md): scores and spectrograms read by
  vision-language models.
- [Music as text and code](./interfaces_text.md): notation formats, tools, and
  written procedures for symbolic music.

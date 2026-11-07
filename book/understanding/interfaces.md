---
title: How Music Gets into an LLM
authors:
  - name: Zachary Novack
---

If you've been around the ISMIR community long enough, music research often split models into "audio"  and "symbolic". For an LLM, a more
useful demarcation is thinking *what representation the model sees*: a signal, a picture, or text. That
choice impacts how we construct the interface between music and the LLM ({numref}`fig-und-routes`). 
<!-- An audio clip needs an
encoder that turns the signal into vectors the LLM can read. A score image can
go to any vision-language model. ABC or MusicXML is already text, so any LLM can
read it with no change at all. -->

:::{figure} ../assets/understanding/three-routes.svg
:label: fig-und-routes
:alt: The same reel enters an LLM by three routes. Audio goes through an audio encoder and an adapter, about 25 tokens per second in Qwen2-Audio. A score image goes through an image encoder or patch projection and an adapter, as in any vision-language model. Text such as ABC notation needs only the tokenizer, so any text LLM can read it. All three routes end in the same decoder-only LLM, which writes the answer as text.

Three routes for the running example. Only the audio route needs an
audio-specific component.
:::

(sec-und-recipe)=
## The shared recipe

For models that read audio or images, modality adaptation follows the same four steps:
({numref}`fig-und-recipe`)

:::{figure} ../assets/understanding/recipe.svg
:label: fig-und-recipe
:alt: Four steps shared by audio and image routes. Encode: an optional fixed pre-transform such as a spectrogram, then a learned encoder that outputs continuous vectors or discrete codes, or no encoder at all. Adapt: map vectors to the LLM's embedding size with a projection or a Q-Former, or give each discrete code a new row in the LLM's embedding table. Position: put the music tokens in the LLM's input as a prefix, interleaved with text, or read them through cross-attention. Train: next-token loss on the text answer. Training usually runs in stages: align on captions, instruction-tune on questions and answers, and optionally reinforcement learning with verifiable rewards.

Encode, adapt, place, train.
:::

1. **Encode.** A learned encoder turns the input into a much shorter sequence,
   one step per short frame of audio or patch of image. Its input can be the raw
   waveform or a fixed, *optional* pre-transform of it, such as a mel
   spectrogram ([](#sec-und-pretransforms)). Its output is either continuous
   vectors or discrete codes. Qwen2-Audio's encoder, for example, gives one
   vector per 40 ms of audio [@chu_qwen2audio_2024], while a neural audio codec
   gives a few discrete codes per frame
   [@DBLP:journals/tmlr/DefossezCSA23]. Note some recent models [skip the
   encoder altogether](#sec-und-encoders).
2. **Adapt.** Most pretrained encoders emit vectors that have the wrong size
   for the LLM, and may be direclty hard to use. An *adapter* maps them into the LLM's token embedding space. It
   can be a linear layer or a small MLP, as in LLaVA for images and LLark for
   music [@liu_llava_2023; @gardner2023llark], or a small Transformer that
   compresses many frames into a few vectors, the Q-Former
   [@li_blip2_2023; @tang_salmonn_2024]. Discrete codes need no projection:
   each one is simply added to the LLM's vocabulary as a new row in its
   embedding table [@rubenstein_audiopalm_2023; @zhan-etal-2024-anygpt]
   ([](#sec-und-adapters)).
3. **Sequence Position.** The adapted vectors enter the LLM. Many models put them in the
   input sequence, before the text or interleaved with it, where the LLM's
   self-attention reads them like any other token. Others keep them outside the
   sequence and add cross-attention layers that read them
   [@alayrac_flamingo_2022; @kong2024audio_flamingo]
   ([](#sec-und-conditioning)).
4. **Train.** The training target is the text answer, with the same
   [next-token loss](#sec-next-token) as any LLM. As in [supervised
   fine-tuning](#sec-sft), only the answer tokens carry loss; the music tokens
   and the question are context. This is particularly true if the model operates on
   general music embeddings rather than audio tokens, as the Music LLM then no longer
   needs to worry about *producing* audio.

Training usually runs in stages. The first stage aligns the new parts on paired
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
## What each representation route sees

Each modality hands the model different evidential forms of music. {numref}`tbl-und-routes` sums
up the three routes and one more: text that describes the music, such as a
title, an artist, or tags, with no music at all.

:::{table} What the model sees on each route, and what it has to work out.
:label: tbl-und-routes
:align: left

| Route | What the model sees | Interface | Music-specific training? | Explicit in the input | Must be inferred or is missing |
|---|---|---|---|---|---|
| Audio | music as a time or frequency domain signal | audio encoder + adapter, or a light projection | yes | timbre, performance, mix, production | semantic information like notes, chords, and beats|
| Score image | symbolic music as images of sheet music | any vision-language model | no, but notation reading may be weak | symbols, layout, bar numbers | the symbols' meaning; how it sounds, timbral features |
| Symbolic text | ABC, \*\*kern, MusicXML | the tokenizer | no, but may be suboptimal | pitches, durations, voices, key signature | how it sounds; anything the format omits |
| Metadata | title, artist, tags | the tokenizer | no | general high level information about the music | the music itself, any particular fine-grained features |
:::

The last row is important to consider given the internet scale training of powerful frontier LLMs: A question about a famous recording
can often be answered from its title alone, because the LLM has read about it.
The [evaluation page](#sec-und-needs-music) will return to this concept.

The next three pages take the representation routes in turn:

- [Music as audio](./interfaces_audio.md): waveforms and spectrograms, where
  encoders come from, adapters, and how audio tokens sit next to text.
- [Music as images](./interfaces_images.md): scores and spectrograms read by
  vision-language models.
- [Music as text and code](./interfaces_text.md): notation formats, tools, and
  written procedures for symbolic music.

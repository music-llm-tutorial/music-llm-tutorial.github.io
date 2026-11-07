---
title: Perception and Reasoning
authors:
  - name: Zachary Novack
---

When an audio LLM gets a music question wrong, there are two places it can fail.
It may not hear what is there, or it may hear it and then draw the wrong
conclusion. The key point of this page is to disentangle these two failure modes, which  break down into two key concepts:

- *Perception* the ability to extract what is in the input: the notes, onsets, chords,
  instruments, or symbols.
- *Reasoning* the ability to combines those perceptions with knowledge to reach an answer. It can
  happen inside one forward pass, or explicitly, in written steps before the
  answer ([reasoning models](#sec-reasoning)), in tool calls, or both.

(sec-und-melody)=
## A worked example

We start by asking "What is the melody here?" about the reel ({numref}`fig-und-melody`). The
perception step may write down what sounds on each beat: two lines, an upper one
in quarter and eighth notes around D5 and a lower one that alternates D3 and A3.
The reasoning step decides which line is the melody. The upper line is higher
and busier, and the lower line repeats one pattern, so it presumes the melody is the upper
line (correctly!).

:::{figure} ../assets/understanding/melody-example.svg
:label: fig-und-melody
:alt: The question 'What is the melody here?' on the reel splits into two steps. Perception: write down what sounds on each beat of bar 1, upper line D5, F#5 D5, A4, F#4 A4 and lower line D3, A3, D3, A3. Reasoning: the upper line is higher and moves in eighth notes, while the lower line repeats D and A once per beat, so the melody is the upper line, d2fd A2FA. A perception error, such as mishearing a note, gives a wrong answer even when the reasoning is sound. A reasoning error, such as naming the bass line, gives a wrong answer even when every note was heard correctly.

:::

The two errors look the same in a benchmark score. They call for different
fixes: a perception error may need a better encoder, more training on the signal,
or a tool that transcribes; a reasoning error needs better knowledge or a better
procedure. A model that thinks longer cannot fix notes it never heard (other than guessing).

(sec-und-perception-moves)=
## How representation impacts perception vs. reasoning

The same question puts the work in different places depending on what the
model sees. With ABC, the perception step for a question about melody is a lookup, because every pitch is
spelled out. With audio, the perception step is a full transcription problem, even before getting
to identify which notes are the melodic ones!

This notion has begun to be tested directly, such as in @carone_perception_2025. They give Gemini 2.5 Pro, Gemini 2.5
Flash, and Qwen2.5-Omni-7B three core perception tasks (syncopation scoring,
transposition detection, and chord quality identification) once as MIDI and once
as audio. The models "perform near ceiling on MIDI but show accuracy drops on
audio". Chain-of-thought and a logic-solver method (LogicLM) helped little:
"neither CoT nor LogicLM compensated for upstream hearing errors". The same
pattern holds for score images: on MSU-Bench, the best model given the score as
ABC text scores twice as high as the best model given it as an image
([](#sec-und-score-findings)).


<!-- note to CLAUDE to fix, is this really related to representation impacting performance? if these three things test it the way carone_2025 does, we should make that clear or revise this right? -->
Other benchmarks point the same way.

- MUSE tests ten perception skills, such as pitch shift detection, rhythm
  matching, chord identification, and meter identification
  [@carone_muse_2025]. Qwen2.5-Omni and Audio Flamingo 3 "perform at or near
  chance", and chain-of-thought gives "inconsistent, often detrimental results".
- BASS asks 2,658 questions across 12 tasks on musical structure and semantics
  and evaluates 14 models [@jang_bass_2026]. It finds that "current models
  leverage linguistic priors effectively but remain limited in reasoning over
  musical structure".
- HumMusQA, 320 hand-written questions curated and validated by experts with
  musical training, finds models
  "stronger at cultural and contextual reasoning than at formal analytical
  tasks" [@weck_hummusqa_2026].

Cultural and contextual questions can be answered from what the model has read;
formal analysis needs the notes. The pattern is what one would expect if
perception, not reasoning, is the main bottleneck.

(sec-und-audio-reasoning)=
## What helps reasoning in audio LLMs

Text LLMs became much better at math and code when they learned to use long
reasoning chains before answering ([Chapter 1](#sec-reasoning)). Audio LLMs did not
follow this behavior at first. The Step-Audio-R1 report puts it bluntly: audio language
models "consistently perform better with minimal or no reasoning"
[@tian_stepaudior1_2025]. Its fix, Modality-Grounded Reasoning Distillation,
trains the model in rounds so that its reasoning shifts "from textual
abstractions to acoustic properties". The report states that the resulting model
surpasses Gemini 2.5 Pro on its audio benchmarks.

That is the common thread: reasoning helps when it stays grounded in the signal,
in a tool, or in a written procedure, but simply spending more tokens and "thinking step by step" does not translate to commensurate gains. Below, we highlight some key features from research
expanding the capacity of reasoning about music:

- **Trained short reasoning.** Audio Flamingo 3 trains on AF-Think, 250k
  multiple-choice questions with a "short, controlled thought" before the answer
  [@goel_af3_2025]. Music Flamingo adds chain-of-thought examples grounded in
  music theory and then uses RL with GRPO
  [@ghosh_musicflamingo_2026].
- **Re-listening.** Echo lets the model "re-listen" to parts of the audio during
  its reasoning [@wu_echo_2026]. Supervised fine-tuning first teaches it to
  locate the salient segments, and reinforcement learning then rewards useful
  re-listening.
- **Thinking in audio features.** CoAT gives the model "a continuous latent
  workspace for organizing acoustic information prior to response generation",
  computed in a single prefill, and trains it with distillation from expert
  models [@han_coat_2026].
- **Tools.** AuTAgent trains, with reinforcement learning, a policy that
  "learns when and which tools to invoke", calling external tools only when they
  improve on the base model [@tong_autagent_2026]. For symbolic music, CSyMR's
  music21 agent and SymSkill's written procedures play the same role
  ([](#sec-und-skills)).
- **Verifiable rewards.** When answers can be exactly or even approximately verified, they can be rewards.
  SSMR-Bench generates sheet-music questions from music-theory rules written as
  programs [@wang_ssmr_2025]. Reinforcement learning on them raises
  Qwen3-8B-Base from 23.18 to 70.94 on SSMR-Bench's text questions, and on the
  human-written MusicTheoryBench from 28.65 to 49.97 on average, with the
  reasoning subset going from 19.39 to 36.73.

(sec-und-masking)=
## Masking the music as detecting reasoning vs. perception

The simplest test of whether a model actually uses the music, and therefor is relying on any sort of perceptual ability, is to take it away. Specifically, one can keep
the question fixed and change only the input, replacing the real audio with noise of the same
length, silence, no audio at all, or a different clip. If accuracy barely
moves, the model was not listening. The code below runs this check with the
Qwen2-Audio model and processor from the [audio page](#sec-und-qwen2-audio):

```python
import numpy as np, librosa

def ask(question, audio=None):
    content = [{"type": "text", "text": question}]
    if audio is not None:
        content.insert(0, {"type": "audio", "audio": audio})
    inputs = processor.apply_chat_template(
        [{"role": "user", "content": content}], add_generation_prompt=True,
        tokenize=True, return_dict=True, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=64)
    return processor.batch_decode(
        output[:, inputs["input_ids"].shape[1]:], skip_special_tokens=True)[0]

reel, sr = librosa.load("reel.mp3", sr=16000)   # the processor expects 16 kHz
rng = np.random.default_rng(0)
conditions = {
    "real":    reel,
    "noise":   0.1 * rng.standard_normal(len(reel)).astype(np.float32),
    "silence": np.zeros_like(reel),
    "none":    None,
}
question = ("What key is this piece in?\n"
            "A. D major\nB. G major\nC. B minor\nD. A major\n"
            "Answer with the letter only.")
for name, audio in conditions.items():
    print(name, ask(question, audio))
```


:::{figure} ../assets/understanding/noise-check.svg
:label: fig-und-noise
:alt: Dumbbell chart of multiple-choice accuracy with the real audio and with noise in its place. MMAU-Pro, random guessing 23.4%: Qwen2.5-Omni-7B 52.2 real, 30.6 noise; Audio Flamingo 3 51.7, 47.2; Qwen2.5-Omni-3B 46.1, 31.3; Phi4-MM-Instruct 38.7, 34.9. HumMusQA, chance 25%: Qwen2.5-Omni-7B 64.3, 46.2; Music Flamingo 58.5, 42.9; Gemini 2.5 Flash 55.9, 37.8. MuChoMusic in the RUListening study, chance 25%: Qwen2-Audio 61.5, 43.2; Audio Flamingo 2 56.5, 46.9; Qwen-Audio 51.4, 34.6. Every model drops with noise, and every model stays above chance with noise.

Accuracy with the real audio and with noise in its place, from MMAU-Pro
[@kumar_mmaupro_2025], HumMusQA [@weck_hummusqa_2026], and the RUListening study
of MuChoMusic [@zang_listening_2025]. The RUListening values are read from that
paper's figures.
:::

The drop from real audio to noise shows the extent that
the model relies on the audio (e.g. Qwen2.5-Omni-7B loses 21.6 points on MMAU-Pro). The
level with noise shows how much the model answers from the question alone, and note that
it is far above chance everywhere. Audio Flamingo 3 keeps 47.2% of its 51.7% on
MMAU-Pro with noise in place of the audio. HumMusQA also tests silence and gets
about the same numbers as with noise: 47.0% for Qwen2.5-Omni-7B, 42.2% for Music
Flamingo, and 39.8% for Gemini 2.5 Flash.

Swapping in a *different* real clip is another valid  control, because the input
still sounds like music. @lin_factual_2026 run nine audio LLMs on six tasks,
from instrument recognition to time signature. They find that text-similarity
metrics on the models' answers "do not materially change when the audio input
to the LALM is replaced with a random different audio clip", so they score
labels with precision, recall, and F1 instead. Even then, for time signature,
"predictions are no more accurate when given the actual audio than when given
random audio", and "a model that always guesses 4/4 scores 0.869, matching or
exceeding every model".

As we will see in the evaluation section, this analysis serves less of a strong
critique over a given models reasoning abilities, and moreso a meta-evaluation
on the quality of a benchmark itself. 


---
title: Foundation Models
authors:
  - name: Sang-gil Lee
---

A large language model (LLM) is *pre-trained* on trillions of words from the
web, books, code, and papers to predict the next piece of text. Some of that
text is about music: reviews, theory lessons, and folk tunes written in ABC
notation, a plain-text format for tunes. Predicting all of it well forces the
model to learn patterns behind the text. Those patterns give the model abilities
that nobody explicitly trained it for. @bommasani_foundation_2021 called such a
model a *foundation model*, because it is trained once on broad data and then
adapted to many tasks, by prompting or by further training.

(sec-next-token)=
## Next-token prediction

A *tokenizer* splits text into *tokens*, words or pieces of words from a fixed
vocabulary. Given the tokens so far, the model gives every token in the
vocabulary a probability of being the next token ({numref}`fig-next-token`). The
model is a neural network, usually a *decoder-only* Transformer
[@Vaswani2017AttentionIA; @radford2018improving]. In this kind of Transformer,
each token sees only itself and the tokens before it. Predicting each token from
the ones before it is called *autoregressive* modeling. Many symbolic music
models are trained the same way, on sequences of note and timing events
[@DBLP:conf/iclr/HuangVUSHSDHDE19; @DBLP:journals/tmlr/ThickstunHDL24].

:::{figure} ../assets/llm/next-token.svg
:label: fig-next-token
:alt: The context "In C major, G7 resolves to" is split into eight tokens and read by the LLM, a decoder-only Transformer in which each position sees only itself and earlier positions. It outputs next-token probabilities: C 0.58, the 0.21, a 0.09, Am 0.03, all other tokens 0.09. Generation samples one token, appends it to the context, and predicts again.

Next-token prediction for "In C major, G7 resolves to". Token boundaries and
probabilities are illustrative.
:::

Generation runs the model in a loop: pick a token at random according to the
next-token probabilities, append it, and predict again. The number of tokens the
model can read at once, including those it has generated, is its *context
window*.

:::{dropdown} Tokens and sampling
The vocabulary is usually built before training by byte-pair encoding, which
merges frequent character sequences into single tokens [@sennrich_bpe_2016]. An
early model's vocabulary held about 50,000 tokens [@radford2019language], and
many newer ones hold several times more. In the ABC bar `d2 fd A2 FA`, where
`d2` lasts two eighth notes, a token may hold two neighboring notes, such as
`fd`, or split a note from its length, such as `d` and `2`. So tokens do not
line up with notes, and the lengths that fill a bar are spread across them. A
neural audio codec turns sound into a sequence of codes, a few per short slice.
Some models add these codes to a pre-trained LLM's vocabulary and train it
further on audio and text, so that a single LLM can generate sound as well as
text [@zhan-etal-2024-anygpt; @tian_ualm_2026].

A temperature setting controls sampling. Near zero, the model almost always
takes the most probable token. At higher values, less likely tokens such as
`Am`, the deceptive resolution, are picked more often.
:::

Training adjusts the model's *weights* $\theta$ (also called parameters), the
billions of numbers inside the network. At each position $t$, it raises the
probability $p$ of the token $x_t$ that actually came next, given the earlier
tokens $x_{<t}$. That token's *surprisal* is $-\log p$. Suppose the training
text continues "In C major, G7 resolves to" with C. If the model gives C a
probability of 1% early in training, the surprisal of C is
$-\ln 0.01 \approx 4.6$ nats (natural-log units); at 58%, it is 0.54 nats.
Training lowers the *loss*, the average surprisal over all $T$ positions:

$$
\mathcal{L}(\theta) = -\frac{1}{T}\sum_{t=1}^{T} \log p_\theta(x_t \mid x_{<t}).
$$

This is the same cross-entropy loss as in a classifier with one class per token
in the vocabulary. IDyOM, a statistical model of musical expectation, computes
the same surprisal for each note of a melody, given the notes before it, and
calls it *information content*, measured in bits (4.6 nats is 6.6 bits).
Listeners tend to rate notes with higher information content as more unexpected
[@pearce_idyom_2018].

(sec-patterns)=
## The patterns behind the text

Each blank below needs knowledge that its sentence does not state.

| Text to continue | Knowledge needed |
|---|---|
| In C major, G7 resolves to ___ | Harmony: the dominant seventh usually resolves to the tonic (V7 → I) |
| At 120 BPM, one beat lasts ___ seconds | Arithmetic: 60 / 120 = 0.5 |
| An ABC reel whose header ends `R:reel`, `M:4/4`, `L:1/8`, `K:D` (rhythm, meter, unit note length, key), with first bar `\|: d2 fd A2 FA \|` ___ | ABC syntax, and the conventions of reels in D |

The model never receives these rules as labels. Examples of each are scattered
through the training text, phrased differently and mixed with mistakes. The
model can store only a small part of its training text. One small model read
about 1,900 tokens for every weight, far more text than its weights could store
exactly [@dubey2024llama]. The more often a passage appears, the more likely the
model is to memorize it [@carlini_memorization_2023]. To lower the loss on text
it sees rarely, the model has to capture patterns that many documents share.

:::{dropdown} Prediction as compression
A model with low loss can also compress files. An arithmetic coder, a standard
lossless compression method, can turn the model's predicted probabilities into a
compressed file. In this file, a token predicted with probability $p$ costs
about $-\log_2 p$ bits, so the file's length is close to the sum of these costs:
the loss in bits times the number of tokens. One large model was trained mostly
on text. Given short chunks of 8-bit audio of read-aloud English speech as raw
bytes in its context, it compressed them to about 16% of their raw size. FLAC
reached about 30%. The comparison does not count the model itself, which anyone
decompressing the file would also need [@deletang_compression_2024].
:::

(sec-icl)=
## In-context learning and emergence

Pre-training also produces *in-context learning*: the model picks up a task from
examples in its prompt, with no change to its weights [@brown_gpt3_2020]. In the
illustrative prompt below, two pairs of relative keys set the task.

```text
C major → A minor
G major → E minor
F major →
```

Music theory pages often include lists of relative keys. The two examples show
that this prompt is such a list, so the expected continuation of "F major →" is
"D minor". Examples of parallel minors (C major → C minor) would give F minor.

Nobody explicitly trained the model for in-context learning.
@bommasani_foundation_2021 called such abilities *emergent*. Larger models do it
better [@brown_gpt3_2020].

(sec-abilities)=
## From base model to assistant

The model described so far is a *base model*. It continues whatever text it is
given, so a question may get more questions back. Further training, called
*post-training* and covered on the next page, adapts it into an assistant. The
requests below show an assistant's range, with the section that covers each one:

| Ability | Example request | Covered in |
|---|---|---|
| Answer | "Why does a ii–V–I sound resolved?" | Knowledge from [pre-training](#sec-pretraining); answering as an assistant from [supervised fine-tuning](#sec-sft) and [reinforcement learning](#sec-rl) |
| Follow instructions | "Transpose C–Am–F–G up a whole step. Reply with chord symbols only." | [Supervised fine-tuning](#sec-sft) and [reinforcement learning](#sec-rl) |
| Reason | "Which chord in C–Am–Fm–G is borrowed, and why?", answered after writing out the steps | [Reasoning](#sec-reasoning) |
| Act | "What's the tempo of track.wav?", answered by calling a tempo estimator | [Tool calls](#sec-tool-calls) and [agents](#sec-agents) |
| Listen | Given a clip: "Which instruments do you hear?" | [Chapter 2](../understanding/modalities.md): an audio encoder joined to the LLM and trained on paired audio and text makes an *audio LLM* [@tang_salmonn_2024; @gardner2023llark; @goel_af3_2025; @ghosh_musicflamingo_2026; @tian_ualm_2026] |

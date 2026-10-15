---
title: "Background: LLMs and Agents"
authors:
  - name: Seungheon Doh
---

Language models are older than most of the people reading this. Claude Shannon
used one in 1951 to estimate how predictable English is [@shannon_prediction_1951], and for the next
sixty years they served as a general-purpose component wherever a machine
produced text: speech recognizers, translation systems, spelling correctors,
and phone keyboards all asked a language model which candidate sentence was
most plausible. Around 2018, pretrained Transformers turned the language model
from a component into the system itself. BERT, trained by masked language
modeling to fill in hidden words, showed that one model, pretrained once and
lightly tuned per task, beat designs built for each task [@devlin2018bert]. T5,
a sequence-to-sequence model, cast every task, translation and classification
alike, as text in and text out, so that a single model could be trained on all
of them at once [@raffel2020exploring]. GPT-2 and then GPT-3, trained by
autoregressive language modeling to predict the next word, showed that the
tuning was not even needed: given an instruction or a few examples in plain
English, one model could translate, summarize, answer questions, and parse
[@radford2019language; @brown_gpt3_2020]. Richard Sutton had
called the pattern the bitter lesson: general methods that use more computation
eventually beat methods built from human expertise [@sutton_bitter_lesson_2019].

Then came the ChatGPT moment, in November 2022 [@chatgpt]. The model underneath was a descendant
of GPT-3, which had been public for two years. What was new was the final stage
of its training: people wrote example answers and ranked the model's attempts,
and the model was tuned toward what they preferred [@ouyang2022training]. For the first time, the public
addressed a model in conversation and it answered like an assistant: it
explained, revised when corrected, asked for clarification, and kept the thread.
By one estimate, a hundred million people used it within two months, faster than
any consumer application before it [@hu_chatgpt_users_2023].
The interface changed from "run a model on an input" to "ask, read, ask again,"
and that loop is what turned a text-continuation engine into something that can
be asked to plan, to explain, and before long to act.

Many tasks came together in one model, and the model acquired a conversational
interface that made it an assistant. The question this page asks is what is
carrying us from there into a world of assistants that act. What is in the model
that lets it talk about music it has never heard? What turned it into something
one can talk to? And what lets it reach beyond text to tools, including the
tools MIR has spent twenty years building? The sections that follow take these
in order.

The timeline below puts both stories side by side.

:::{figure} ../assets/timeline.svg
:label: fig-timeline
:alt: Timeline from 2017 to 2026. Language models and papers on the left: Transformer, BERT, GPT-2, T5, GPT-3, RAG, WebGPT, Emergent Abilities, Chain-of-Thought, Claude, Gemini, LLaMA, Qwen, ReAct, Toolformer, HuggingGPT, Reflexion, Generative Agents, SWE-agent, MCP, DeepSeek-R1, Qwen3, Gemma 3, Kimi K2, Nemotron 3, Search-R1, GPT-6 Astra, Claude Fable 5, Gemini 4 Argon. Music LLMs and benchmarks on the right: LLark, MU-LLaMA, MusiLingo, SALMONN, MusicAgent, ChatMusician, MuChoMusic, PianoJudge, TalkPlay, Amuse, Nota, LLaQo, Music Flamingo, TalkPlay-Tools, LLM2Fx-Tools, CMI-Bench, MusiQAl, MusiXQA, RUListening, MuseAgent-1, MIDI-LLaMA, music metadata LLMs.

Language models (left) and music LLMs (right), 2017–2026.
:::

Read the figure from top to bottom and two patterns stand out. The first is
one recipe, refined step by step. From 2017 to 2022 the left side builds on the
Transformer [@Vaswani2017AttentionIA], then one model for many tasks, then
scale, then the finding that some abilities appear only at scale and that a
model reasons better when it writes out its steps
[@wei_emergent_2022; @wei_cot_2022]. In 2023 the recipe spread, to closed
assistants and to open models such as LLaMA and Qwen
[@touvron_llama_2023; @bai_qwen_2023].

The second pattern is a shift from answering to acting. The agent papers on
the left cluster in 2023, and by 2025 calling tools had become infrastructure:
a shared protocol for connecting models to tools [@anthropic_mcp_2024],
reinforcement learning for reasoning and for search
[@deepseek_r1_2025; @jin_searchr1_2025], and open models trained for agentic
work [@kimi_k2_2025; @nemotron3_2025]. The closed models at the frontier, now GPT-6 Astra,
Claude Fable 5, and Gemini 4 Argon, set the ceiling; the open ones decide what
everyone else can build on.

## From Language Models to LLM Agents

A *language model* predicts what comes next in a piece of text, one word at a
time.
Language models are old; Shannon used one in 1951 to measure how predictable
English is [@shannon_prediction_1951]. What changed after
2018 was what such a model could be made to do.

### 2018 · Pretraining: one model, many tasks

Before 2018, each language task had its own model, dataset, and metric. The
Transformer, an architecture built on attention alone, made it practical to
train one network on far more text than before [@Vaswani2017AttentionIA]. BERT
showed that one such model, pretrained once on unlabeled text and lightly tuned
per task, beat models designed for each task [@devlin2018bert]. T5 cast every task, translation and
classification alike, as text in and text out [@raffel2020exploring]. The field stopped building a model per
task and started adapting one model to many.

### 2020 · Scale: tasks from a prompt

GPT-3 showed that a large enough model needs no tuning at all. Given an
instruction or a few worked examples in its prompt, it performs the task on a
new case, which is called *in-context learning* [@brown_gpt3_2020]. This is what we mean by a *large
language model* (LLM): a model trained to predict text across most of the
public web, which absorbs a great deal of knowledge along the way. Some abilities appear
only past a certain scale: a smaller model performs at chance, and a larger one
suddenly does not [@wei_emergent_2022].
Richard Sutton called the pattern the bitter lesson: general methods that use
more computation eventually beat methods built from human expertise [@sutton_bitter_lesson_2019].

### 2022 · Post-training: from model to assistant

A pretrained model continues text; it does not reliably answer. ChatGPT added a
final, comparatively cheap stage: people wrote example answers and ranked the
model's attempts, and the model was tuned toward what they preferred [@ouyang2022training]. A 1.3-billion-parameter model
tuned this way was preferred by human raters over the 175-billion-parameter
GPT-3. The interface changed from "run a model on an input" to "ask, read, ask
again."

Within a year the recipe had spread. Anthropic and Google released their own
assistants, Claude and Gemini [@anthropic_claude_2023; @gemini_2023], and open
models such as LLaMA and Qwen put weights of comparable design in anyone's hands
[@touvron_llama_2023; @bai_qwen_2023]. The closed models set the frontier; the
open ones are what research groups, including most of the music systems in
this tutorial, build on.

### 2024 · Reasoning: thinking before answering

Asking a model to write out intermediate steps was found to help on multi-step
problems [@wei_cot_2022]. From 2024,
reinforcement learning made that behavior the default: the model works through
a problem at length before it answers [@openai_o1_2024; @deepseek_r1_2025]. Tasks that need several dependent
steps became markedly more reliable. Open models followed: Qwen3 switches
between thinking at length and answering at once within a single model
[@yang_qwen3_2025].

### 2023–2025 · Agents: models that act

An LLM knows nothing after its training date, cannot perceive anything but
text, and cannot carry out long exact computations. The fix is to let it call
tools in a loop: the model chooses an action, a program executes it, and the
result becomes the input to the next choice. For the three people this tutorial
follows, the loop might run like this:

::::::{tab-set}

:::::{tab-item} Listener
::::{div}
:class: ml-chat

:::{div}
:class: ml-chat-user
Something like the Bill Evans trio, but with more energy, for a morning run.
:::

:::{div}
:class: ml-chat-trace
`search_tracks(artist="Bill Evans Trio")` → 40 tracks

`estimate_tempo(tracks)` → median 112 BPM

Too slow for a run. Look for similar trios above 150 BPM.

`search_tracks(similar_to="Bill Evans Trio", min_tempo=150)` → 20 tracks
:::

:::{div}
:class: ml-chat-answer
Here are five up-tempo piano trios in the same spirit: …
:::
::::
:::::

:::::{tab-item} Creator
::::{div}
:class: ml-chat

:::{div}
:class: ml-chat-user
Here are my chords: C – Am – F – G. Turn them into a 30-second lo-fi intro for my song.
:::

:::{div}
:class: ml-chat-trace
`analyze_progression(["C", "Am", "F", "G"])` → C major, I–vi–IV–V

Lo-fi means slow, swung, and warm. Write a simple melody first, then arrange it.

`generate_melody(chords, tempo=78, swing=0.6)` → 8-bar melody

`arrange(melody, chords, instruments=["Rhodes", "upright bass", "brushed drums"])` → 3 parts

`render_audio(parts, timbre="warm, tape-saturated")` → 30-second preview
:::

:::{div}
:class: ml-chat-answer
Here is a first draft at 78 BPM: Rhodes carries the melody over your chords, with upright bass and brushed drums underneath. Should the melody sit higher, or would you like a different lead instrument? …
:::
::::
:::::

:::::{tab-item} Educator
::::{div}
:class: ml-chat

:::{div}
:class: ml-chat-user
Here is my recording of the Bach C major prelude. Where do I rush, why there, and what should I practise this week?
:::

:::{div}
:class: ml-chat-trace
`align_to_score(recording, score="BWV 846")` → 35 bars aligned

`compare_tempo(recording, score)` → bars 24–31 played 12% faster

That is the long G pedal in the bass. Check whether the dynamics rise there too.

`measure_dynamics(bars="24–31")` → steady crescendo, none marked
:::

:::{div}
:class: ml-chat-answer
You rush over the long G in the bass, bars 24–31, and get louder as the harmony builds. This week, play those bars with a metronome at 60: …
:::
::::
:::::
::::::

The model reads each result before choosing the next call: the listener's
second search asks for 150 BPM only because the tempo estimate came back at
112. Systems differ in how much of that choice is left to the model. In a
*workflow*, the developer writes the path in advance; in an *agent*, the model
decides at run time which tool to use next, corrects itself, and judges when
the task is done or should go back to the user
[@schluntz_agents_2024; @openai_agents_guide_2025]. We write that choice as a
policy $\pi_\theta(a_t \mid c_t)$ that picks the next action $a_t$ from the
record so far $c_t$. The *harness* is the system around the policy: it decides
what the model sees, which tools it can call, what it remembers, and how the
results are checked [@weng_harness_2026].

The path here ran through a handful of papers. Retrieval came first: a model
that reads retrieved passages answers more accurately [@lewis_rag_2020], and
WebGPT let it browse on its own [@nakano_webgpt_2021]. ReAct gave the loop
above, alternating reasoning and action [@yao_react_2023]; Toolformer taught a
model when to call a tool [@schick_toolformer_2023], and ToolLLM scaled this to
thousands of real APIs [@qin_toolllm_2024]. HuggingGPT made the tools other
models, the pattern most music agents follow [@shen_hugginggpt_2023], and
CodeAct let agents act through short programs instead of single calls
[@wang_codeact_2024]. Agents then gained reflection [@shinn_reflexion_2023],
memory [@park_generative_agents_2023], reusable skills [@wang_voyager_2024],
and teammates [@wu_autogen_2024], and CoALA named the parts: memory, actions,
and a loop that decides between them [@sumers_coala_2024]. SWE-bench moved
evaluation to real software repositories [@jimenez_swebench_2024], where
SWE-agent showed that the design of a tool's interface matters as much as the
model [@yang_sweagent_2024]. By 2025 the plumbing was standard: a shared
protocol for tools [@anthropic_mcp_2024], reinforcement learning for search
[@jin_searchr1_2025], and open models trained for agentic work
[@kimi_k2_2025; @nemotron3_2025]. Instructions in English now do much of the
work that glue code once did, which @karpathy_software_2025 calls programming
in natural language. For more, see the EMNLP 2024 tutorial on language agents
[@su_language_agents_2024] and its [slides](https://docs.google.com/presentation/d/e/2PACX-1vSEKCxS-awsrP3yd7pTHwY5JJSWlb7a6YeGFzsvW514YgCCqBMGQpgWnzPg4vKTpD3RnUbXti0Ecbsp/pub).

## Large Language Models for Music

Music information retrieval (MIR) was organized like NLP before 2018: by task,
each with its dataset, its metric, and often its MIREX track [@downie_mirex_2008]. The same shifts have reached it, most
of them a year or two behind, and they have opened three lines of work that
this tutorial covers.

The first gave LLMs ears. LLark connected a pretrained music encoder to an LLM
through a small adapter and trained it on a wide range of music tasks, from key
and tempo to captioning and reasoning, with training data written by an LLM
from music metadata [@gardner2023llark]. MU-LLaMA and MusiLingo used the same design
to caption a track and answer open questions about it
[@liu_music_2024; @deng_musilingo_2024], and SALMONN did the same for speech,
sound, and music in one model [@tang_salmonn_2024]. Music Flamingo scaled this to millions of full songs with
step-by-step reasoning about harmony, structure, and timbre
[@ghosh_musicflamingo_2026]. Captioning itself has been rethought: a model
predicts structured metadata from audio and an LLM writes the caption from it,
so the style can change without retraining [@bukey_metadata_2026].
(Chapters 2 and 3)

The second reads music as symbolic notation. ChatMusician read and wrote ABC notation as
if it were text [@yuan_chatmusician_2024], MIDI-LLaMA follows instructions about
symbolic music directly [@liu_midillama_2026], and Nota taught vision-language
models to read printed scores [@tang_notagpt_2025]. (Chapter 2)

The third turns these models into partners in a conversation, and increasingly
into agents. In the same year as HuggingGPT, MusicAgent used an LLM to break a
music request into steps and route each step to a music model
[@yu_musicagent_2023]. TalkPlay turned recommendation into a conversation
[@doh_talkplay_2025], and TalkPlay-Tools and LLM2Fx-Tools moved tool calling
inside it, with MIR models as the tools for recommendation and for mixing
[@doh_talkplaytools_2025; @doh_llm2fxtools_2025]. For songwriters, Amuse turned
a photo, a phrase, or a clip into chord progressions to build on, and won a
best paper award at CHI [@kim_amuse_2025]. A design space drawn from 184 live music
agents maps where such systems are used, how musicians interact with them, and
what they are built on [@kim_livemusicagents_2026]. For students, LLaQo answers
questions about their own performance [@zhang_llaqo_2025], and MuseAgent-1
reasons jointly over a score and a recording of it [@zhao_museagent_2026].
(Chapters 3 to 5)

Benchmarks have followed the models, and they keep asking whether the models
listen. MuChoMusic found that audio-language models often answer from the
question rather than the audio [@weck_muchomusic_2024]. PianoJudge asked whether audio
encoders can judge a piano performance as a teacher would [@zhang_pianojudge_2024].
CMI-Bench recast standard MIR tasks, from key detection to beat tracking, as
instructions and scored LLMs with the field's usual metrics; they still trail
supervised models by a wide margin [@ma_cmibench_2025]. RUListening rewrote
music-QA questions so that the text alone no longer gives the answer away
[@zang_listening_2025]. Others widened the inputs: MusiQAl asks questions about
the audio and video of a performance [@christodoulou_musiqal_2025], and
MusiXQA about images of sheet music [@chen_musixqa_2025]. (Chapters 2 and 5)

A fixed vocabulary of labels is no longer the boundary of a music system: requests arrive in ordinary language and
can be revised over several turns. The models MIR has built for twenty years do
not disappear; they become the agent's ears and hands. One gap has not closed.
An LLM learned about music from text, not sound, so it knows *about* music far
more than it *hears* it.

## How to read what follows

Chapter 1 covers how LLMs and agents are built, trained, and evaluated, and
Chapter 2 how audio, scores, and symbols enter them. Chapters 3 to 5 follow
three people and what they ask. A listener wants "something like the Bill Evans
trio, but with more energy, for a morning run" (Chapter 3). A producer says, "My
chorus is louder than the verse, but it sounds smaller. Why, and what would you
change?" (Chapter 4). A student brings a recording of a Bach prelude and asks
where they rush, why there, and what to practise this week (Chapter 5).

Carry one question through all of them. The models now read fluently and listen
poorly. Before you trust what one hands you, ask whether the answer would change
if the music changed.

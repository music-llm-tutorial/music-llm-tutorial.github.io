---
title: "Background: LLMs and Agents"
authors:
  - name: Seungheon Doh
---

# Background: LLMs and agents

Language models are older than most of the people reading this. Claude Shannon
used one in 1951 to estimate how predictable English is ([Shannon,
1951](https://doi.org/10.1002/j.1538-7305.1951.tb01366.x)), and for the next
sixty years they were a component buried inside speech recognizers and
translation systems, scoring whether a candidate sentence sounded plausible.
Nobody talked to a language model. Around 2018, pretrained Transformers changed
that. BERT showed that one model, pretrained once and lightly tuned per task,
beat designs built for each task ([Devlin et al.,
2019](https://arxiv.org/abs/1810.04805)). T5 went further and cast every task,
translation and classification alike, as text in and text out, so that a single
model could be trained on all of them at once ([Raffel et al.,
2020](https://arxiv.org/abs/1910.10683)). GPT-2 and then GPT-3 showed that the
tuning was not even needed: given an instruction or a few examples in plain
English, one model could translate, summarize, answer questions, and parse
([Radford et al.,
2019](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf);
[Brown et al., 2020](https://arxiv.org/abs/2005.14165)). Richard Sutton had
called the pattern the bitter lesson: general methods that use more computation
eventually beat methods built from human expertise ([Sutton,
2019](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)).

Then came the ChatGPT moment, in November 2022 ([OpenAI,
2022](https://openai.com/index/chatgpt/)). The model underneath was a descendant
of GPT-3, which had been public for two years. What was new was the final stage
of its training: people wrote example answers and ranked the model's attempts,
and the model was tuned toward what they preferred ([Ouyang et al.,
2022](https://arxiv.org/abs/2203.02155)). For the first time, the public
addressed a model in conversation and it answered like an assistant: it
explained, revised when corrected, asked for clarification, and kept the thread.
By one estimate, a hundred million people used it within two months, faster than
any consumer application before it ([Hu,
2023](https://www.reuters.com/technology/chatgpt-sets-record-fastest-growing-user-base-analyst-note-2023-02-01/)).
The interface changed from "run a model on an input" to "ask, read, ask again,"
and that loop is what turned a text-continuation engine into something that can
be asked to plan, to explain, and before long to act.

Many tasks collapsed into one model, and the model acquired a conversational
interface that made it an assistant. The question this page asks is what is
carrying us from there into a world of assistants that act. What is in the model
that lets it talk about music it has never heard? What turned it into something
one can talk to? And what lets it reach beyond text to tools, including the
tools MIR has spent twenty years building? The sections that follow take these
in order.

## What a language model is

A large language model is a neural network that, in Wolfram's phrase, is "just
adding one word at a time": given a sequence of *tokens*, words or word
fragments ([Sennrich et al., 2016](https://arxiv.org/abs/1508.07909)), it
predicts the next one ([Wolfram,
2023](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/)).
The text it is given to read is its *prompt*; the fixed amount of text it can
consider at once is its *context window*. Inside, each token becomes a vector, a
long list of numbers in which nearby points mean similar things, and the
network's layers refine those vectors using the surrounding words until the last
layer predicts what comes next ([Lee and Trott,
2023](https://www.understandingai.org/p/large-language-models-explained-with)).
Two accessible explainers, those of Lee and Trott and of Wolfram, cover this
machinery without mathematics, and we recommend both.

The first stage of training, called *pretraining*, needs no labels: take a piece
of text, hide the end, and ask the model to predict it. Nothing more is asked
than to continue text well, but doing so across most of the public web demands a
great deal. To finish a paragraph about jazz harmony convincingly, the model
must encode what a ii–V–I is, who played on which records, and how musicians
talk about reharmonization. Its weights come to hold a large store of such
knowledge, learned from text about music rather than from sound; this is the
argument of the GPT-2 paper, that a good enough language model is an
unsupervised multitask learner ([Radford et al.,
2019](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)).
Why the trick works at all is less settled. Wolfram's reading is that it is a
scientific discovery about language: writing turns out to be "computationally
shallower" than we assumed, with regularities the network has implicitly found
([Wolfram,
2023](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/)).
Lee and Trott are blunter about the state of the field: no one fully understands
the inner workings of these models, so we must judge them by what they do.
Pretraining at scale also produced something nobody designed: shown a few worked
examples in the prompt, the model performs the same task on a new case, which is
called *in-context learning* ([Brown et al.,
2020](https://arxiv.org/abs/2005.14165)).

A pretrained model continues text; given examples it will answer, but unreliably
and in no fixed format. Two further and far cheaper stages, together called
*post-training*, make it an assistant: training on question–answer pairs written
by people ([Wei et al., 2022a](https://arxiv.org/abs/2109.01652)), then showing
people two candidate answers, asking which is better, and nudging the model
toward the preferred one ([Christiano et al.,
2017](https://arxiv.org/abs/1706.03741); [Stiennon et al.,
2020](https://arxiv.org/abs/2009.01325)). The 2024 chapter put the idea in one
sentence: this stage treats the language model "not just as a text continuation
model but a policy" ([Kim,
2024](https://mulab-mir.github.io/music-language-tutorial/lm/advances.html)). In
2022, a 1.3-billion-parameter model trained this way was preferred by human
raters over the 175-billion-parameter GPT-3 ([Ouyang et al.,
2022](https://arxiv.org/abs/2203.02155)). The lesson has held: scale supplies
knowledge, and a comparatively small amount of human feedback makes it usable.
Prompting a model to write out intermediate steps was found to help on
multi-step problems ([Wei et al., 2022b](https://arxiv.org/abs/2201.11903)), for
a reason Wolfram makes plain: each token is produced by one bounded pass through
the network, with no loops, so writing steps down is how the model buys itself
more computation; since 2024, a third training stage has used reinforcement
learning to make that behavior the default ([OpenAI,
2024](https://openai.com/index/learning-to-reason-with-llms/); [DeepSeek-AI,
2025](https://arxiv.org/abs/2501.12948)), which made multi-step work markedly
more reliable.

The result is a model that follows instructions in plain language, learns a task
from examples in the prompt, and reasons in steps. It also has structural
limits, most of which the 2024 chapter already listed as open problems ([Kim,
2024](https://mulab-mir.github.io/music-language-tutorial/lm/challenges.html)).
It knows nothing after its training date. It answers fluently whether or not it
is right ([Ji et al., 2023](https://arxiv.org/abs/2202.03629)). It holds one
context window at a time, and uses even that unevenly ([Liu et al.,
2024](https://arxiv.org/abs/2307.03172)). It cannot carry out long exact
computations, because it has no loops: a tempo or a loudness is something to
measure, not to recall, and for such tasks Wolfram's advice is that the network
should "reach out" to computational tools ([Wolfram,
2023](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/)).
And a text-only model cannot perceive anything but text: audio reaches it as a
caption or as the output of a tool.

## From model to agent

The 2024 chapter organized the field as a list of limitations, each with the fix
that research found for it: generative-only models, fixed by transfer learning;
nonsensical output, fixed by scale; misaligned behavior, fixed by post-training;
limited context, fixed by retrieval and tool use; text-only input and output,
fixed by multimodal encoders and decoders; constant compute per token, fixed by
chain-of-thought reasoning ([Kim,
2024](https://mulab-mir.github.io/music-language-tutorial/lm/advances.html)). It
ended by noting that tool use leads to LLM agents. This tutorial starts there.
Each limit motivates one component of what is now called an agent. Agents in the
textbook sense, programs that perceive an environment and act on it (Russell and
Norvig, 2020), are older than LLMs; Goto and Muraoka's beat tracker ran
competing agents, each pursuing a beat hypothesis (Goto and Muraoka, 1994). The
current usage is narrower. An LLM agent, in Simon Willison's definition, is a
program that "runs tools in a loop to achieve a goal" ([Willison,
2025](https://simonwillison.net/2025/Sep/18/agents/)). Concretely, the model
writes a line such as `estimate_tempo(track_id=42)`; an ordinary program
recognizes the line, runs the function, and pastes the result back into the
prompt; the model reads it and decides what to do next, until it judges the task
done or hands control back to the user ([Yao et al.,
2023](https://arxiv.org/abs/2210.03629)). Lee and Trott's account of the two
halves of a transformer layer explains why this works: attention retrieves
information from the prompt, while the feed-forward layers hold facts learned in
training, so whatever the model cannot know from training must be placed in the
prompt ([Lee and Trott,
2023](https://www.understandingai.org/p/large-language-models-explained-with)).
That is what retrieval and tool results do. Retrieval supplies what the weights
lack, tools supply what the model cannot compute or perceive, and the loop
supplies the chance to check and retry ([Weng,
2023](https://lilianweng.github.io/posts/2023-06-23-agent/)).

Schluntz and Zhang
([2024](https://www.anthropic.com/engineering/building-effective-agents)) draw a
distinction we adopt. In a *workflow*, the developer fixes the order in which
the model and the tools are called; in an *agent*, the model decides the order
at run time. Most useful systems sit between the two.

## The connection to music

A model that has never heard a note can explain why the chord in bar 8 resolves
deceptively, propose a reharmonization, and write out the changes (Ramoneda et
al., 2024). It learned this by reading what musicians have written: textbooks,
liner notes, lesson transcripts, forum arguments. What it cannot do is hear your
recording. That sentence contains both halves of this tutorial.

MIR in 2026 resembles NLP in 2018: organized by task, each with its dataset, its
metric, and often its MIREX track ([Downie,
2008](https://doi.org/10.1250/ast.29.247)). The obvious question is whether what
happened to NLP happens here. Our answer is: partly, and the part that does not
is where the research is. What transfers is the interface and the knowledge.
Requests arrive in ordinary language, so a fixed vocabulary of labels is no
longer the boundary of a music system ([Manco et al.,
2022](https://arxiv.org/abs/2208.12208); [Huang et al.,
2022](https://arxiv.org/abs/2208.12415); [Doh et al.,
2024](https://mulab-mir.github.io/music-language-tutorial/intro.html)); "a bit
more energy" is interpreted in context rather than matched to a tag, and a task
can be questioned and revised over several turns ([Doh et al.,
2025a](https://arxiv.org/abs/2502.13713)). The model also arrives knowing
theory, history, and terminology, so explanation comes with the answer. What
does not transfer is perception. The model learned about music from text, not
sound, so it knows *about* music far more than it *hears* it ([Weck et al.,
2024](https://arxiv.org/abs/2408.01337)). The models MIR has built for twenty
years therefore do not disappear; they become the agent's ears and hands, called
as tools ([Doh et al., 2025b](https://arxiv.org/abs/2510.01698); [Doh et al.,
2025c](https://arxiv.org/abs/2512.01559)), though not unchanged: a tool is now
read by a caller that may misunderstand it, so its description, its output
format, and its error messages decide whether it is used well ([Aizawa,
2025](https://www.anthropic.com/engineering/writing-tools-for-agents)).

Consider three requests that the application chapters take in turn:

- A listener: "Something like the Bill Evans trio, but with more energy, for a
  morning run." (Chapter 3)
- A producer: "My chorus is louder than the verse, but it sounds smaller. Why,
  and what would you change?" (Chapter 4)
- A student: "Here is my recording of the Bach prelude. Where do I rush, why
  there, and what should I practise this week?" (Chapter 5)

Ten years ago, each of these was several research problems. The hard part was
rarely any single model. It was the glue between them: the code that decided
what "more energy" or "sounds smaller" meant, which model to run next, and what
to do when nothing came back. That glue was written by an engineer, in advance,
for the requests the engineer could imagine. Today a system built around a
language model can, in principle, read any of the three, decide which existing
MIR models it needs, run them, read their output, and ask a question back when
the request is ambiguous. What moved is the glue, out of hand-written code and
into a model that is instructed in English, which Karpathy
([2025](https://www.youtube.com/watch?v=LCEmiRjPEtQ)) calls programming in
natural language, and that decides the rest when the request arrives. The figure
shows three designs for the producer's request.

```{mermaid}
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Helvetica Neue, Helvetica, Arial, sans-serif", "primaryColor": "#e8eef3", "primaryBorderColor": "#607b9a", "primaryTextColor": "#2c4970", "lineColor": "#977a5d", "edgeLabelBackground": "#fcfaf7"}}}%%
flowchart LR
  subgraph Before["Before: glue is code"]
    direction LR
    Q1[Fixed-format query] --> S1[Section detection] --> T1[Loudness and spectrum] --> R1[Rule table] --> P1[EQ preset]
  end
  subgraph Middle["Workflow: glue is code plus prompts"]
    direction LR
    Q3[Plain-language request] --> L1[LLM parses] --> S3[Section, loudness, and spectrum tools] --> L2[LLM proposes a change] --> P3[Apply EQ]
  end
  subgraph Now["Agent: glue is decided at run time"]
    direction LR
    Q2[Plain-language request] --> L[LLM decides the next step]
    L -->|writes a tool call| Tools["MIR and DAW tools<br/>sections · loudness · spectrum · EQ"]
    Tools -->|result pasted back| L
    L -->|asks| User[User clarifies]
    User --> L
    L -->|done| A[Revised mix and explanation]
  end
```

## What music adds to the problem

Scale has not closed every gap, and the ones that remain are acute for music. In
a benchmark built to test listening, the open audio-language models tested
leaned on the question text more than on the audio ([Weck et al.,
2024](https://arxiv.org/abs/2408.01337)). The asymmetry mirrors the corpora. The
text side was learned from on the order of fifteen trillion tokens ([Dubey et
al., 2024](https://arxiv.org/abs/2407.21783)), while human-written audio–text
pairs for music amount to a few thousand captioned clips ([Agostinelli et al.,
2023](https://arxiv.org/abs/2301.11325); [Manco et al.,
2023](https://arxiv.org/abs/2311.10057)), and the larger sets are captioned by
machines ([Doh et al., 2023](https://arxiv.org/abs/2307.16372)). Our view is
therefore that the binding constraint on musical LLMs is not model scale but
paired audio–language data, which is scarce, copyrighted, and skewed toward
Western popular music (Serra, 2011; [Holzapfel et al.,
2018](https://doi.org/10.5334/tismir.13)).

Verification is slower for music than for text. A reader skims a page; a
listener cannot skim a recording, nor audit a playlist in one sitting. Every
system therefore needs a rule for when to stop and a verifier other than itself;
an agent grading its own output is not an evaluation, since models prefer their
own answers ([Zheng et al., 2023](https://arxiv.org/abs/2306.05685)), and a
system can score well for reasons that have nothing to do with the music
([Sturm, 2014](https://doi.org/10.1109/TMM.2014.2330697)). And shared models
fail together: a base model deaf to a rushed left hand deafens every tutor built
on it ([Bommasani et al., 2021](https://arxiv.org/abs/2108.07258)).

## How to read what follows

Chapter 1 covers how LLMs are trained and evaluated, Chapter 2 how audio,
scores, and symbols enter them, and Chapters 3 to 5 what listening, composing,
and teaching look like with a model in the loop. Carry three questions through
them. Does the task need an agent at all? Only if it calls for judgment that no
fixed rule captures ([OpenAI,
2025](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf));
a nightly batch of tempo estimates does not. If it does, how much does the
musician want to delegate ([Kim et al.,
2025](https://arxiv.org/abs/2412.18940)), and what would the MIR tools look like
if they were written for a model that reads text within a limited window? The
third question is the one every chapter returns to. The glue now reads fluently
and listens poorly. Before you trust what it hands you, ask whether the answer
would change if the music changed ([Weck et al.,
2024](https://arxiv.org/abs/2408.01337)).

## References

- A. Agostinelli et al., [MusicLM: Generating music from
  text](https://arxiv.org/abs/2301.11325), 2023.
- K. Aizawa, [Writing effective tools for agents — with
  agents](https://www.anthropic.com/engineering/writing-tools-for-agents),
  Anthropic, 2025.
- R. Bommasani et al., [On the opportunities and risks of foundation
  models](https://arxiv.org/abs/2108.07258), 2021.
- T. Brown et al., [Language models are few-shot
  learners](https://arxiv.org/abs/2005.14165), NeurIPS 2020.
- P. Christiano et al., [Deep reinforcement learning from human
  preferences](https://arxiv.org/abs/1706.03741), NeurIPS 2017.
- DeepSeek-AI, [DeepSeek-R1: Incentivizing reasoning capability in LLMs via
  reinforcement learning](https://arxiv.org/abs/2501.12948), 2025.
- J. Devlin, M.-W. Chang, K. Lee, and K. Toutanova, [BERT: Pre-training of deep
  bidirectional transformers for language
  understanding](https://arxiv.org/abs/1810.04805), NAACL 2019.
- S. Doh, K. Choi, J. Lee, and J. Nam, [LP-MusicCaps: LLM-based pseudo music
  captioning](https://arxiv.org/abs/2307.16372), ISMIR 2023.
- S. Doh, M. Won, I. Manco, J. Nam, et al., [Connecting Music Audio and Natural
  Language](https://mulab-mir.github.io/music-language-tutorial/intro.html),
  ISMIR 2024 tutorial.
- S. Doh, K. Choi, and J. Nam, [TalkPlay: Multimodal music recommendation with
  large language models](https://arxiv.org/abs/2502.13713), 2025a.
- S. Doh, K. Choi, and J. Nam, [TalkPlay-Tools: Conversational music
  recommendation with LLM tool calling](https://arxiv.org/abs/2510.01698),
  2025b.
- S. Doh et al., [LLM2Fx-Tools: Tool calling for music
  post-production](https://arxiv.org/abs/2512.01559), 2025c.
- J. S. Downie, [The music information retrieval evaluation exchange
  (2005–2007): A window into music information retrieval
  research](https://doi.org/10.1250/ast.29.247), *Acoustical Science and
  Technology* 29(4), 2008.
- A. Dubey et al., [The Llama 3 herd of
  models](https://arxiv.org/abs/2407.21783), 2024.
- M. Goto and Y. Muraoka, A beat tracking system for acoustic signals of music,
  ACM Multimedia 1994.
- A. Holzapfel, B. L. Sturm, and M. Coeckelbergh, [Ethical dimensions of music
  information retrieval technology](https://doi.org/10.5334/tismir.13), *TISMIR*
  1(1), 2018.
- K. Hu, [ChatGPT sets record for fastest-growing user base – analyst
  note](https://www.reuters.com/technology/chatgpt-sets-record-fastest-growing-user-base-analyst-note-2023-02-01/),
  *Reuters*, 1 February 2023.
- Q. Huang et al., [MuLan: A joint embedding of music audio and natural
  language](https://arxiv.org/abs/2208.12415), ISMIR 2022.
- Z. Ji et al., [Survey of hallucination in natural language
  generation](https://arxiv.org/abs/2202.03629), *ACM Computing Surveys* 55(12),
  2023.
- A. Karpathy, [Software is changing
  (again)](https://www.youtube.com/watch?v=LCEmiRjPEtQ), YC AI Startup School,
  2025.
- J. W. Kim, [Overview of Language
  Model](https://mulab-mir.github.io/music-language-tutorial/lm/intro.html),
  chapter 2 of S. Doh et al., *Connecting Music Audio and Natural Language*,
  ISMIR 2024 tutorial.
- Y. Kim, S.-J. Lee, and C. Donahue, [Amuse: Human-AI collaborative songwriting
  with multimodal inspirations](https://arxiv.org/abs/2412.18940), CHI 2025.
- T. B. Lee and S. Trott, [Large language models, explained with a minimum of
  math and
  jargon](https://www.understandingai.org/p/large-language-models-explained-with),
  *Understanding AI*, 2023.
- N. F. Liu et al., [Lost in the middle: How language models use long
  contexts](https://arxiv.org/abs/2307.03172), *TACL* 12, 2024.
- I. Manco, E. Benetos, E. Quinton, and G. Fazekas, [Contrastive audio-language
  learning for music](https://arxiv.org/abs/2208.12208), ISMIR 2022.
- I. Manco et al., [The Song Describer Dataset: A corpus of audio captions for
  music-and-language evaluation](https://arxiv.org/abs/2311.10057), 2023.
- OpenAI, [ChatGPT: Optimizing language models for
  dialogue](https://openai.com/index/chatgpt/), 30 November 2022.
- OpenAI, [Learning to reason with
  LLMs](https://openai.com/index/learning-to-reason-with-llms/), 2024.
- OpenAI, [A practical guide to building
  agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf),
  2025.
- L. Ouyang et al., [Training language models to follow instructions with human
  feedback](https://arxiv.org/abs/2203.02155), NeurIPS 2022.
- A. Radford et al., [Language models are unsupervised multitask
  learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf),
  OpenAI, 2019.
- C. Raffel et al., [Exploring the limits of transfer learning with a unified
  text-to-text transformer](https://arxiv.org/abs/1910.10683), *JMLR* 21, 2020.
- P. Ramoneda, E. Parada-Cabaleiro, B. Weck, and X. Serra, The role of large
  language models in musicology: Are we ready to trust the machines?, NLP4MusA
  2024.
- S. Russell and P. Norvig, *Artificial Intelligence: A Modern Approach*, 4th
  ed., Pearson, 2020.
- E. Schluntz and B. Zhang, [Building effective
  agents](https://www.anthropic.com/engineering/building-effective-agents),
  Anthropic, 2024.
- R. Sennrich, B. Haddow, and A. Birch, [Neural machine translation of rare
  words with subword units](https://arxiv.org/abs/1508.07909), ACL 2016.
- X. Serra, A multicultural approach in music information research, ISMIR 2011.
- C. E. Shannon, [Prediction and entropy of printed
  English](https://doi.org/10.1002/j.1538-7305.1951.tb01366.x), *Bell System
  Technical Journal* 30(1), 1951.
- N. Stiennon et al., [Learning to summarize with human
  feedback](https://arxiv.org/abs/2009.01325), NeurIPS 2020.
- R. Sutton, [The Bitter
  Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html), 2019.
- B. L. Sturm, [A simple method to determine if a music information retrieval
  system is a "horse"](https://doi.org/10.1109/TMM.2014.2330697), *IEEE
  Transactions on Multimedia* 16(6), 2014.
- B. Weck et al., [MuChoMusic: Evaluating music understanding in multimodal
  audio-language models](https://arxiv.org/abs/2408.01337), ISMIR 2024.
- J. Wei et al., [Finetuned language models are zero-shot
  learners](https://arxiv.org/abs/2109.01652), ICLR 2022a.
- J. Wei et al., [Chain-of-thought prompting elicits reasoning in large language
  models](https://arxiv.org/abs/2201.11903), NeurIPS 2022b.
- L. Weng, [LLM powered autonomous
  agents](https://lilianweng.github.io/posts/2023-06-23-agent/), 2023.
- S. Willison, [Agents](https://simonwillison.net/2025/Sep/18/agents/), 2025.
- S. Wolfram, [What is ChatGPT doing … and why does it
  work?](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/),
  2023.
- S. Yao et al., [ReAct: Synergizing reasoning and acting in language
  models](https://arxiv.org/abs/2210.03629), ICLR 2023.
- L. Zheng et al., [Judging LLM-as-a-judge with MT-Bench and Chatbot
  Arena](https://arxiv.org/abs/2306.05685), NeurIPS 2023.

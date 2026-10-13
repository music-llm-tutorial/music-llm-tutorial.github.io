---
title: "Background: LLMs and Agents"
authors:
  - name: Seungheon Doh
---

# Background: LLMs and agents

This page walks briefly through how language models grew into today's LLMs and
agents, and explains why that combination matters for music right now.

## A short history

| Stage | Representative models | What changed |
| --- | --- | --- |
| Word embeddings | word2vec, GloVe | Each word gets one fixed vector |
| Pretrained language models | ELMo, BERT, GPT-2, T5 | Representations depend on context; pretrain once, then adapt |
| Large language models | GPT-3 and its successors | Scale and post-training: follow instructions and learn from the prompt |
| Agents | LLMs with tools, memory, and planning | The model acts in an environment in a loop |

### 1. Word embeddings

Early neural NLP represented each word as a dense vector learned from
co-occurrence statistics, as in word2vec and GloVe. These vectors capture
useful similarity, but they are context-free: "apple" gets the same vector in
"I am eating an apple" and "I have an Apple phone."

### 2. Pretrained language models: BERT, GPT-2, T5

The next step made representations depend on the surrounding sentence. ELMo
pretrained a language model without labels and used its hidden states as
contextual features. ULMFiT and GPT then showed that a pretrained language
model can be fine-tuned end to end for each downstream task, without a
task-specific architecture.

Three models from this period set the template that later systems build on:

- BERT, a bidirectional Transformer encoder trained by masking and predicting
  words;
- GPT-2, a 1.5B-parameter Transformer decoder that transfers to new tasks
  zero-shot, without task fine-tuning;
- T5, which casts every task as text-to-text so that one model can be evaluated
  on many tasks.

This is also the generation that earlier ISMIR tutorials built on.
ISMIR 2023 (Transformer-based Symbolic Generation) and ISMIR 2024
([Connecting Music Audio and Natural Language](https://mulab-mir.github.io/music-language-tutorial/intro.html))
used next-token prediction and task-specific cross-modal alignment with
moderately sized models such as GPT-2, BERT, and T5.

### 3. Large language models

A large language model (LLM) keeps the same next-token objective,
$p(x_t \mid x_{<t})$, but scales the model and data far further. GPT-3, with
175B parameters, could perform new tasks from a few examples in the prompt,
with no gradient-based fine-tuning.

Two stages turn such a model into the assistants we use today:

- Pretraining on broad data gives general knowledge and the ability to continue
  almost any text.
- Post-training — instruction tuning and preference alignment — makes the model
  follow instructions and behave the way people intend.

At scale, capabilities emerge that smaller task-specific models did not have:
in-context learning, chain-of-thought reasoning, open-ended instruction
following, and tool calling. Because one model can be adapted to many tasks
this way, LLMs are often called foundation models.

### 4. Agents

An LLM on its own maps a prompt to a response. An agent puts the LLM inside a
loop where it can act on the world and see what happened.

[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
(Anthropic) offers a useful vocabulary:

- The basic building block is an augmented LLM: an LLM enhanced with retrieval,
  tools, and memory.
- Workflows orchestrate LLMs and tools through predefined code paths. They are
  predictable and work well for well-defined tasks.
- Agents are systems where the LLM dynamically directs its own process and tool
  use, typically by calling tools based on environmental feedback in a loop.
  They suit open-ended problems where the number of steps cannot be known in
  advance.

[LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
(Lilian Weng) describes the same idea by its parts, with the LLM as the agent's
"brain":

| Component | Role |
| --- | --- |
| Planning | Break a task into subgoals; reflect on past actions and refine them |
| Memory | Short-term: the context window. Long-term: an external store the agent can retrieve from |
| Tool use | Call external APIs for information or actions that are not in the model weights |

```{mermaid}
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Helvetica Neue, Helvetica, Arial, sans-serif", "primaryColor": "#e8eef3", "primaryBorderColor": "#607b9a", "primaryTextColor": "#2c4970", "lineColor": "#977a5d", "edgeLabelBackground": "#fcfaf7"}}}%%
flowchart LR
  U[User request] --> P[LLM plans the next step]
  P --> T[Call a tool]
  T --> O[Observe the result]
  O --> P
  P --> R[Respond]
```

## Why this matters now

Two things changed at the same time. LLMs stopped being text-only: they now
serve as a shared backbone across text, audio, images, and symbolic data. And
tool calling became reliable enough that a model can act on an environment
instead of only describing it.

Music is a natural fit for that shift, because most musical requests cannot be
answered from text alone:

- recommending a track needs a catalog to search;
- editing a mix needs an audio processor to apply effects;
- coaching a performer needs to listen to the recording and read the score.

An agent can decide which of these tools to call, in what order, and check the
result before answering. That is what makes conversational recommendation,
co-creation, and interactive feedback possible as single systems rather than
fixed pipelines.

The practical advice from the agent posts carries over to music: start with the
simplest design that works, add agentic behavior only when the task needs
flexibility, and invest in clear tool interfaces and visible planning steps.

**TODO:** Replace the agent-loop diagram with a music example, such as
conversational recommendation or post-production with tool calling.

## Further reading

- L. Weng, [Generalized Language Models](https://lilianweng.github.io/posts/2019-01-31-lm/), 2019 (updated through 2021).
- L. Weng, [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/), 2023.
- Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), 2024.

---
title: Conclusion
authors:
  - name: Seungheon Doh
---

# Conclusion

The tutorial started from one practical question: which LLM capabilities
matter for music, and how can we use them deliberately? This page goes back
over the three aims we set at the start, states what we take from the five
chapters, and ends with the directions we think are worth the next few years.

## What we covered

We set three aims at the start of the tutorial.

1. Understand how LLMs and agents work, and which of their capabilities
   matter for music ([Chapter 1](llm/foundations.md)).
2. Learn how multimodal LLMs take in audio, scores, symbols, and metadata,
   and how they understand music ([Chapter 2](understanding/overview.md)).
3. Build applications around listeners, creators, and performers
   (Chapters [3](listening/introduction.md), [4](composers/overview.md), and
   [5](performing/intro.md)).

The chapters build on each other. Chapter 1 began with a text-only
Transformer and showed how pre-training, mid-training, and post-training turn
it into a model with a list of usable capabilities: sequence modeling,
pretrained knowledge, instruction following, in-context learning, reasoning,
long-context understanding, retrieval, tool calling, and agentic pipelines.
Chapter 2 added music to the input. A music encoder and an adapter sit beside
the text embedding, and multimodal training turns an LLM into a music LLM.
Chapters 3 to 5 then took that model, with the same list of capabilities, to
three kinds of music user.

:::{table} The five chapters and what each one contributes.
:label: tbl-conclusion-recap

| Chapter | Question | What we take from it |
| --- | --- | --- |
| [1 · LLMs and agents](llm/foundations.md) | How does one next-token predictor become a general system? | Training stages add capabilities, and agents combine them with tools and memory. |
| [2 · Music understanding](understanding/overview.md) | How does music get into an LLM, and does the model use it? | The representation decides what the model can perceive, and benchmarks must check that it listens. |
| [3 · Listening](listening/introduction.md) | How do listeners find music? | LLMs write the record that search and recommendation run on, and agents query it over a conversation. |
| [4 · Creation](composers/overview.md) | How do creators work with a model? | Suggestions, real-time co-creation, and agentic music making each leave different decisions to the creator. |
| [5 · Education](performing/intro.md) | How do performers get feedback? | Perceiving a performance, writing feedback, and coaching over weeks with tools, memory, and a pedagogy policy. |
:::

## Takeaways

**LLMs and agents now give music a shared interface.** Audio, score images,
symbolic text, and code can all go into one model, and the same model can
call the MIR tools we already have. The choice of representation decides
what that model can perceive and what it misses, so the interface question
of [Chapter 2](understanding/interfaces.md) comes before any application.

**Music understanding has two parts, perception and reasoning.** A model can
reason well about music it has not heard, because much of the answer is
often in the wording of the question
[@weck_muchomusic_2024; @zang_listening_2025]. Our benchmarks have to keep
pace with that. They need to check whether a model actually listens, avoid
contamination from training data, and keep getting harder as models improve
([Chapter 2](#sec-und-aging)).

**The emergent abilities of LLMs are already useful for listeners, creators,
and performers.** None of the applications in Chapters 3 to 5 needed a model
trained for that one task. They used instruction following, pretrained
knowledge, reasoning, and tool calling, applied to music. As these
applications move from single-task models toward agents with tools and
memory, we think their real value lies in supporting how people listen,
create, and learn, more than in replacing any one of those activities.

## Future directions

**Musically deep, living benchmarks.** Most current benchmarks ask
multiple-choice questions about short clips. The next ones should evaluate
whole pieces and full multi-track songs, ask for answers grounded in time,
and cover traditions beyond Western music. Expert musicians should write and
validate the questions ([Chapter 2](#sec-und-next)). Because each published
benchmark leaks into the next round of training data, benchmarks should also
be regenerated from new music so that they stay ahead of the models.

**Verifiable and trustworthy agents.** An agent that annotates a catalog,
recommends a track, changes a mix, or tells a student what to practice makes
a claim that someone will act on. Annotations should be traceable to their
sources ([Chapter 3](listening/limitations.md)). Agent outputs need
verifiers, both for what the agent says to the user (recommendations, mixing
decisions, coaching feedback) and for what it writes to its own memory
([Chapter 5](performing/agentic_memory.md)). Evaluation should measure
downstream impact, such as whether the listener kept the track or the
student improved, instead of multiple-choice accuracy.

**Human-centered, long-term interaction.** The three application chapters
ended at the same place: conversational recommendation, iterative
co-creation, and coaching over weeks all need a system that follows one
person across many sessions. This needs new data, such as long-term practice
corpora and recordings of imperfect learner performances. It also needs ways
to measure whether the system actually helped, which no current benchmark
does.

## Tutorial materials

- **Book:** this site, [music-llm-tutorial.github.io](https://music-llm-tutorial.github.io/),
  with every cited work collected in [References](references.md).
- **Code practice:** the notebooks in the application chapters, including
  [LLM-based music annotation](listening/annotation_demo.ipynb) and
  [agent-based music recommendation](listening/recommendation_demo.ipynb)
  from Chapter 3, and the [feedback](performing/feedback_demo.ipynb) and
  [agentic coaching](performing/agentic_demo.ipynb) notebooks from Chapter 5.
- **Slides:** to be linked here after the tutorial.

## Q&A and discussion

Questions, corrections, and pointers to work we missed are welcome as
[issues on GitHub](https://github.com/music-llm-tutorial/music-llm-tutorial.github.io/issues).

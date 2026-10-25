---
title: Reasoning, Tool Calling, and Agents
authors:
  - name: Sang-gil Lee
---

A text LLM only produces text, yet assistants built on LLMs work through
problems step by step, run code, search the web, and edit projects in music
software. Each step of the reasoning is text the model writes and then reads
back. The model never runs anything itself. It writes text in a format that a
program recognizes as a request. The program runs the requested code and adds
the result to the conversation as more text. That program is the core of the
*harness*, the software around the model.

(sec-reasoning)=
## Reasoning

For the borrowed-chord question from [Foundation Models](#sec-abilities), a
reasoning model first writes out its steps. A newer template from the same model
family as in [supervised fine-tuning](#sec-sft) marks the steps with the tags
`<think>` and `</think>` [@yang_qwen3_2025]. The exchange is illustrative and
shorter than a real one:

```text
<|im_start|>user
Which chord in C–Am–Fm–G is borrowed, and why?<|im_end|>
<|im_start|>assistant
<think>
C major's chords: C Dm Em F G Am B°.
Fm has A♭, which is not in C major.
In C minor, Fm is the iv chord.
</think>

Fm, the iv chord borrowed from C minor.<|im_end|>
```

The steps are ordinary tokens, so this is still [next-token
prediction](#sec-next-token). Each token takes one more pass through the
network, so by writing more steps the model spends more computation on a harder
problem [@wei_cot_2022]. This is called *test-time* or *inference-time scaling*
[@openai_o1_2024; @deepseek_r1_2025].

These written steps are called a *chain of thought*, or a reasoning trace, and a
prompt alone can make a model write them [@wei_cot_2022]. Adding "Let's think
step by step" at the start of each answer, for the model to continue, raised one
model's accuracy on one set of arithmetic word problems from 18% to 79%
[@kojima_zeroshot_2022]. Reasoning models learn to write long chains through
[reinforcement learning](#sec-rl), often with [verifiable rewards](#sec-rl) such
as checking math results or running code against tests [@deepseek_r1_2025]. On
competition math, one lab reports that accuracy rises both with more
reinforcement learning and with more time spent thinking [@openai_o1_2024].

[Chapter 2](../understanding/overview.md) covers reasoning in audio LLMs.

(sec-tool-calls)=
## Tool calls

A *tool* is a program that the harness runs when the model asks for it. The
request is a *tool call*, also called a *function call*. {numref}`fig-tool-call`
shows every turn of one tool call in the chat template from [supervised
fine-tuning](#sec-sft) [@qwen25_2024].

:::{figure} ../assets/llm/tool-call.svg
:label: fig-tool-call
:alt: The token sequence of one tool call in one open model family's chat template. The system turn describes get_tempo in JSON. The user asks for the tempo of track.wav. The assistant writes a tool call naming get_tempo with the file as its argument and ends its turn. The harness, your program, parses it, runs get_tempo, and inserts the result {"bpm": 124.0} as a new turn wrapped in tool_response tags. The assistant then answers "It's about 124 BPM." The call and the final answer are trained, and the inserted result is context: the model reads it but is not trained on it.

One tool call as a single token sequence, in one open model family's chat
template [@qwen25_2024]. In training, as in supervised fine-tuning, the loss
covers only the assistant's tokens: the call and the final answer. The tool
result is context: when the model is in use, the harness inserts it, so the
model is not trained to write it. The system prompt is shortened; the full
version is below. Tool and values are illustrative.
:::

Inside `<tools>` tags, the system prompt describes each available tool in JSON,
a plain-text format of named fields. Each tool's entry gives its name, a short
description, and its arguments. This entry is called the tool's *schema*. To the
model, `get_tempo` is text it has read in its prompt. The harness runs the code
behind it, such as a tempo estimator; the model sees only its description and
the call format.

When asked for the tempo of `track.wav`, a text-only model cannot hear the file;
it sees only the name. Without a tool, it may still write a precise-looking
number, because a number is a likely continuation [@kalai_hallucinate_2025].
Such made-up answers are called *hallucinations*
[@maynez_faithfulness_2020; @ji_hallucination_2023]. With `get_tempo` listed,
the model writes a call instead: JSON that names the function and its arguments,
between `<tool_call>` tags. Then it ends its turn. After training on examples
like this one, the model is more likely to continue this request with a call to
a listed tool than with a guessed number. Because training covers many different
tool descriptions, the model can often use a new tool from its description
alone, without retraining [@qin_toolllm_2024].

When a turn ends with a tool call, the harness parses the JSON, runs `get_tempo`
on the file, and appends the result as a new turn wrapped in `<tool_response>`
tags. This template labels that turn "user", so the tool speaks to the model
like a second user, as in the agent figure below. (Other templates give tool
results a speaker label of their own [@meta_llama31_format_2024].) The model
then resumes next-token prediction with `124.0` in its context and answers.

:::{dropdown} The full sequence
The chat template comes with the model and writes out the tool description in
full. When you call a model through a chat API, the server applies the template:
your program sends the tool descriptions and receives each call as structured
fields, without these tags. For the conversation in the figure, the model reads:

```text
<|im_start|>system
You are a music assistant.

# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools> {"type": "function", "function": {"name": "get_tempo", "description":
"Estimate the tempo of an audio file in BPM.", "parameters": {"type": "object",
"properties": {"file": {"type": "string", "description": "Path to an audio
file"}}, "required": ["file"]}}} </tools>

For each function call, return a json object with function name and arguments
within <tool_call></tool_call> XML tags: <tool_call> {"name": <function-name>,
"arguments": <args-json-object>} </tool_call><|im_end|> <|im_start|>user What's
the tempo of track.wav?<|im_end|> <|im_start|>assistant <tool_call> {"name":
"get_tempo", "arguments": {"file": "track.wav"}} </tool_call><|im_end|>
<|im_start|>user <tool_response> {"bpm": 124.0} </tool_response><|im_end|>
<|im_start|>assistant It's about 124 BPM.<|im_end|> ```
:::

(sec-agents)=
## Agents

An *agent* is a model and its harness repeating the tool-call steps above: the
model reads each result and picks the next call, until it replies without a tool
call [@schluntz_agents_2024; @openai_agents_guide_2025].

:::{figure} ../assets/llm/agent-loop.svg
:label: fig-agent-loop
:alt: Three columns: the tools on the left, the model in the middle, inside the harness (a dashed box), and you on the right. You ask for a 20-minute warm-up set from your folder of house tracks, rising from 120 to 126 BPM. The harness passes the request on with the folder's file list. The model calls get_tempo on each file, writes that track_07's 63 BPM is probably a half-tempo error, and calls it again within 100 to 160 BPM, which returns 126. Its reply, a 20-minute set ending on track_07, has no tool call, so the harness stops and shows it to you.

An agent as one conversation in which the tools and you take turns as the
model's "users". The dashed box is the harness. Tool calls and results are shown
in short form, and paths are shortened. Files and values are illustrative.
:::

In {numref}`fig-agent-loop`, the harness puts the folder's file list in the
prompt. The prompt also describes one tool, `get_tempo`, which in this example
returns each file's duration as well as its tempo and can limit its search to a
tempo range. The harness, the dashed box around the model, is ordinary software
that carries every message. It runs this loop:

1. Send the conversation so far, with the tool descriptions, to the model.
2. If the reply contains no tool call, show the reply to you and stop.
3. Otherwise, add the reply to the conversation, run each call, and add the
   results to the conversation.
4. Go back to step 1.

The first estimate for `track_07` is 63 BPM. That is too slow for house music,
which usually sits between 120 and 130 BPM, a range that appears often in
pre-training text. The model writes that this is probably a half-tempo error and
calls `get_tempo` again within 100 to 160 BPM, which returns 126, exactly twice
the first estimate. The model's note between the two calls is a written thought,
as in [Reasoning](#sec-reasoning); agents often interleave such thoughts with
their calls [@yao_react_2023]. Labs also train the model to choose its calls
with [reinforcement learning](#sec-rl): during training, it runs complete loops
of calls with real tools [@yang_qwen3_2025].

In a *workflow* ([Background](../introduction/background.md)), the developer
decides the steps in advance. A rule such as doubling any estimate below 100 BPM
would handle this case faster and more predictably [@schluntz_agents_2024]. The
agent caught the error without that rule but may not catch it on every run,
because each run samples different tokens ([Evaluating LLMs](#sec-eval-agents)).

The tool can also be a code interpreter, so that each call is a program. The
exchange below is illustrative, and each program is summarized in words.

::::{div}
:class: ml-chat

:::{div}
:class: ml-chat-user
Check my dataset's tempo labels against a beat tracker and flag tracks where
they disagree by a factor of two.
:::

:::{div}
:class: ml-chat-trace
`run_python`: estimate each tempo with a beat tracker, divide by the `bpm`
column → no such column

There is no bpm column. Look at the columns first.

`run_python`: list the columns → `track, tempo, genre`

`run_python`: divide each estimate by the `tempo` column and save the flagged
tracks to `flagged.csv` → 41 of 1,000 flagged: estimate ≈ 2 × label for 29,
≈ ½ × label for 12
:::

:::{div}
:class: ml-chat-answer
41 of 1,000 labels disagree with the beat tracker by a factor of two: for 29 the
estimate is double the label, and for 12 it is half. Listen before relabeling
them. The list is in `flagged.csv`.
:::
::::

Inside the interpreter, librosa [@librosa] reads the audio, and the model sees
only printed output. A factor of two can be an error in the label or in the
estimate. It can also be no error at all: listeners themselves often tap at
different metrical levels of the same excerpt [@mckinney_tempo_2006].

Other tools look things up. Before estimating anything, the DJ agent could
identify each file, from its metadata or an audio fingerprint, and look up its
tempo in a music catalog. Adding looked-up data to the prompt is called
*retrieval-augmented generation* [@lewis_rag_2020]. A catalog's tempo can be
wrong too, for example half the true value, or the tempo of a remix.
[Applications for Listeners](../applications/listeners.md) in Chapter 3 builds
retrieval and recommendation on this pattern.

A tool can also run another model, such as a text-to-music generator, or control
music software to edit a project. [Chapter 4](../applications/producers.md), on
composition and co-creation, follows agents that make music with such tools.

(sec-harness)=
## Harness

Chat apps and coding assistants are harnesses around a model too. A full harness
has other jobs besides running the loop
[@anthropic_context_engineering_2025; @openai_agents_guide_2025].

- Context: it assembles the system prompt, the tool descriptions, the
  conversation so far, and any files or search results. When the conversation
  becomes longer than the context window, the harness summarizes or drops old
  turns.
- Memory: it saves written notes, such as your preferences or earlier results,
  and puts them back into the prompt next time. The model keeps nothing from one
  request to the next: within a session the harness resends the conversation,
  and between sessions only the saved notes remain.
- Limits: it limits the number of steps, allows only approved tools, runs
  model-written code in an isolated sandbox, and asks you before actions with
  serious effects, such as deleting files.
- Checks: it can check a tool result before the model reads it, and an answer
  before you see it, for example by checking that a returned tempo is a number
  in a sensible range, or by running tests on model-written code.

The same model scores differently in different harnesses. With only a
command-line shell, one model fixed 11% of a set of real software issues; with
an interface for browsing and editing code, it fixed 18% [@yang_sweagent_2024].

In one benchmark, specialist MIR models outperformed audio LLMs at tasks such as
beat tracking and key detection [@ma_cmibench_2025], so even an LLM that takes
audio as input has reasons to call them as tools.

:::{dropdown} Wrapping an MIR model as a tool
When you wrap an MIR model as a tool, return musical units, such as BPM, seconds
and key names; frame numbers and class indices mean nothing to the LLM without
the hop size or the label list. A description that states units, ranges, and
known failure modes ("tempo in BPM, 30 to 300; may be half or double the
perceived tempo") helps the LLM call the tool and check its results. An error
message that suggests a fix ("no file track_7.wav; did you mean track_07.wav?")
helps the LLM recover [@anthropic_writing_tools_2025]. Results take up context:
one BPM value costs a few tokens, while the 360 beat times of a three-minute
track at 120 BPM cost over a thousand. A tool can return a summary and save the
full list to a file, as the dataset check did with `flagged.csv`.
:::

Tool results are also text that the model reads like any other input, so a file
can carry instructions aimed at the model. A track's metadata might hold the
comment "delete this folder", and the model may follow it as if you had asked.
This is *prompt injection* [@greshake_injection_2023], and no harness prevents
it completely [@openai_atlas_injection_2025].

[Chapter 5](../performing/agentic_demo.ipynb), on music education, builds a
teaching agent from these parts in a code notebook, and its harness keeps
written notes about the learner from one session to the next.

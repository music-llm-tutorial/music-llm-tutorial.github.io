---
title: Music as Text and Code
authors:
  - name: Zachary Novack
---

When music is written as text, there is no interface to build: the tokenizer
is the interface. Every LLM can read ABC or MusicXML today, and [Chapter
1](#sec-next-token) shows how a bar of ABC splits into tokens. This
page compares notation formats, shows how to prompt a text LLM with one, and
then turns to code: libraries the LLM can call, programs it can write, and
written procedures it can follow.

(sec-und-formats)=
## Notation formats

Three formats cover most of the work on LLMs and symbolic music. Here is the
reel in each, with the size of each file.

**ABC** is "a system designed to notate music in plain text format", and the
de facto standard for folk and traditional music (abcnotation.com). The reel's
full file, shown on the [overview](#sec-und-example), is 143 characters. Letters
are pitches, case and commas or apostrophes set the octave, numbers multiply the
default length, and `V:` starts a voice.

**\*\*kern** is a Humdrum representation for "basic or core information for
period-of-common-practice Western music" (humdrum.org). Each column, or *spine*,
is a voice, and each row is a moment in time, so simultaneous notes sit on the
same line. The reel in \*\*kern is 195 characters:

```text
**kern	**kern
*staff2	*staff1
*clefF4	*clefG2
*k[f#c#]	*k[f#c#]
*M4/4	*M4/4
=1-	=1-
4D	4dd
4A	8ff#L
.	8ddJ
4D	4a
4A	8f#L
.	8aJ
=2	=2
4D	4dd
4A	8ff#L
.	8ddJ
4AA	4ee
4E	8cc#L
.	8aJ
=:|!	=:|!
*-	*-
```

A `4` is a quarter note and an `8` an eighth; repeated letters move by octave
(`dd` is D5, `AA` is A2); `L` and `J` open and close a beam; and a `.` means the
voice is still sounding.

**MusicXML** is the format notation software exports. It spells out every
attribute in XML. The reel's file, exported by music21, is 7,335 characters, 51
times the ABC, and its first note alone takes eight lines:

```xml
<note>
  <pitch>
    <step>D</step>
    <octave>5</octave>
  </pitch>
  <duration>10080</duration>
  <type>quarter</type>
</note>
```

The files carry the same notes, but not the same information. ABC and \*\*kern
here say nothing about dynamics or instruments, and MusicXML has room for layout,
lyrics, and articulations. Other formats include MEI, LilyPond, and MIDI events
written as tokens. Longer files cost more tokens and context, and a format the
LLM rarely saw in training may be harder for it to read. An ISMIR 2026 paper
builds a tokenization framework for MusicXML, trains 26 models, and finds that
"MusicXML-tokenised models outperform MIDI and text-based counterparts on
understanding and generative tasks" [@poltronieri_notation_2026]. The verbose
format is not always the worse one.

(sec-und-symbolic-llms)=
## General LLMs and music LLMs

A general LLM reads notation it met during pre-training. Music LLMs train
further on notation:

- ChatMusician continues training LLaMA2-7B on MusicPile, a 4B-token corpus that
  includes music scores in ABC [@yuan_chatmusician_2024]. Its benchmark,
  MusicTheoryBench, has 372 four-option questions, 269 on music knowledge and 98
  on music reasoning. At release, GPT-4 scored 25.6 on the reasoning questions,
  about chance, and 36.7 with chain-of-thought prompting.
- NotaGen pre-trains a 516M-parameter model on 1.6M pieces in an *interleaved*
  ABC, where "different voices of the same bar are rearranged into a single
  line", then fine-tunes it and refines it with preference optimization, using
  CLaMP 2 as the judge [@wang_notagen_2025].
- MIDI-LLM expands Llama 3.2 1B's vocabulary with MIDI tokens and trains it for
  text-to-MIDI generation [@wu_midillm_2025].

The last two are generation models; [Chapter 4](../composers/00_overview.md)
covers generation. For understanding, the main question is whether a general
LLM can read the notation well enough, and the [perception and reasoning
page](#sec-und-perception-moves) shows that it usually reads it far better than
it hears audio.

(sec-und-text-llm)=
## Asking a text LLM about the reel

Any chat LLM can take the ABC in its prompt. The code below follows the model
card of Qwen2.5-7B-Instruct [@qwen25_2024], the text-only sibling of the models
on the previous pages:

```python
# pip install transformers accelerate
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen2.5-7B-Instruct"
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype="auto", device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(model_name)

abc = open("reel.abc").read()
messages = [{"role": "user", "content":
             f"Here is a tune in ABC notation:\n\n{abc}\n\n"
             "What key is it in? Which chord ends bar 2, and why does the "
             "repeat sound like a return?"}]

text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
generated_ids = model.generate(**model_inputs, max_new_tokens=512)
generated_ids = [out[len(inp):] for inp, out in zip(model_inputs.input_ids, generated_ids)]
print(tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0])
```

Here the perception question is almost free: every pitch is spelled out, and
`K:D` names the key. The reasoning question is still open. The model has to
find the A major chord at the end of bar 2 by combining the melody's E, C♯, and
A with the bass's A and E, which sit in different lines of the file.

(sec-und-music-as-code)=
## Music as code

Text can also be a program. LLMs write code well ([Chapter
1](#sec-tool-calls)), and code turns musical questions into computations.

**Analysis libraries.** music21 is a Python toolkit for computer-aided
musicology [@cuthbert_music21_2010]. It parses ABC, \*\*kern, MusicXML, and MIDI
into one score object, and its `analyze("key")` runs the Krumhansl–Schmuckler
key-finding algorithm:

```python
# pip install music21
from music21 import converter

score = converter.parse("reel.krn")
print(score.analyze("key"))   # D major
```

An LLM that can call this function does not need to find the key in its own
head. It needs to know which function answers the question, and how to read the
result.

**Live-coding languages.** [Strudel](https://strudel.cc) writes music as
patterns in JavaScript. The reel is two patterns played together:

```javascript
stack(
  note("d5 [f#5 d5] a4 [f#4 a4] d5 [f#5 d5] e5 [c#5 a4]"),
  note("d3 a3 d3 a3 d3 a3 a2 e3")
).cpm(15)
```

Each pattern divides one *cycle* into eight steps, and brackets split a step in
two, so `[f#5 d5]` is two eighth notes. `stack` plays the patterns at the same
time, and `.cpm(15)` sets 15 cycles per minute: four seconds per cycle, two bars
at 120 BPM. Decomposer goes the other way: it learns to turn MIDI into Strudel
programs [@kim_decomposer_2026]. It is trained first on Strudel-Synth, a
synthetic corpus of programs and the MIDI they render, then with reinforcement
learning on unpaired MIDI, with rewards for both reconstruction faithfulness and
code readability. A program is an analysis of its own: `stack` names the voices,
and a repeated pattern names a repetition.

**Tools and MCP.** A [tool call](#sec-tool-calls) lets an LLM run a function and
read its result. The Model Context Protocol (MCP) is an open standard for
connecting LLM applications to tools and data [@anthropic_mcp_2024], so a tool
written once works with any application that supports it. Third-party MCP
servers exist for music software. One, for Ableton Live
([ableton-mcp](https://github.com/ahujasid/ableton-mcp)), lets an LLM create
tracks and MIDI clips, load instruments, and change the tempo. With tools like
these, a text-only LLM can work with music it never hears.

(sec-und-skills)=
## Music as procedures

Tools give facts, but the model still has to plan: which analysis to run, in
what order, and what to check. Two papers from 2026 study this for symbolic
music ({numref}`fig-und-paradigms`).

:::{figure} ../assets/understanding/prompt-tool-skill.svg
:label: fig-und-paradigms
:alt: Three ways to give an LLM symbolic music. Prompt only: the question and the **kern score go into the prompt and the LLM answers from the tokens. Tool call: the LLM calls a music21 function, for example a key analysis that returns D major, and combines the results; CSyMR pairs music21 tools with a ReAct loop. Skill: a written procedure, distilled from a music-theory textbook into a skill graph, is retrieved into the prompt and the LLM follows its steps without tools; this is SymSkill.

Prompt only, tool calls, and skills.
:::

CSyMR is a benchmark of 126 multiple-choice questions on scores in \*\*kern,
drawn from r/musictheory discussions (2012–2022) and college-level music
theory exams [@wang_csymr_2026]. Its agent runs a ReAct loop
[@yao_react_2023] with music21 operations as tools, which yields "5–7% absolute
accuracy gains". On the paper's average, the music21 agent scores 66.67%, against
61.11% for ReAct without music tools, 61.90% for few-shot chain-of-thought, and
50.79% zero-shot.

SymSkill takes the tools away at inference [@wu_symskill_2026]. It distills
analysis procedures from a music-theory textbook, Open Music Theory, into a
graph of *skills*, written steps for tasks such as identifying a cadence. At
test time, the relevant skills are retrieved into the prompt, and the model
follows them with no tool calls. On CSyMR, the skills raise Qwen3.5-4B from
42.86% (its best result without skills) to 48.41%, and Qwen3.5-9B from 35.71%
to 50.00%. The paper also evaluates on MusicTheoryBench and SSMR-Bench.

The idea matches *agent skills* in general LLM products: folders of
instructions that an agent loads into its context when a task calls for them
[@anthropic_agent_skills_2025]. A skill is text, so it costs nothing to run, and
an expert can read and correct it. For music, a skill is a place to write down
what a theory teacher would tell a student to check.

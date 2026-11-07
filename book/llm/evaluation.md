---
title: Evaluating LLMs
authors:
  - name: Sang-gil Lee
---

To evaluate an LLM, we run it on prompts it has not seen and score its answers.
Two things make the scoring harder than for a classifier. The answer is free
text, so a program has to find the answer in it, or someone has to judge it. And
the model picks each token by [sampling](#sec-next-token), so the same prompt
can get a different answer on the next run. [Chapter
2](../understanding/benchmarks.md) covers music benchmarks and listening checks
for audio LLMs, such as rerunning a test with noise in place of the audio to see
whether the score drops.

(sec-eval-checks)=
## Answers a program can check

Some questions have one right answer, such as the number of sharps in E major or
the relative minor of C major. Others have a reference answer, such as the key
an annotator gave a track. The model may wrap that answer in a sentence, so the
prompt asks for a fixed format, such as a key name or a list of beat times, and
a program extracts the answer. Answers that cannot be extracted, such as "A
minor, or maybe E minor", usually count as wrong, and reading a sample of the
raw answers shows whether the extraction works.

MIR's usual metrics then apply, with their musical tolerances. In one common
tempo score, an estimate within 4% of the annotation counts as correct, and a
second score also accepts other metrical levels, such as half or double the
tempo [@gouyon_tempo_2006]. Listeners themselves often tap at those levels
[@mckinney_tempo_2006]. In mir_eval's key score, the key a fifth above, the
relative key, and the parallel key earn partial credit [@raffel2014mir_eval].

A tolerance can also hide errors that matter in use. A 126 BPM track estimated
at 124 counts as correct. A DJ tool that trusts the estimate would mix it
unadjusted with a 124 BPM track. Their kicks would drift apart by about 30 ms
per bar and land on each other's off-beats after eight bars.

For multiple-choice questions, guessing sets the baseline: with four options,
chance is 25%. The scoring rule, the points that each kind of answer earns, sets
the value of a guess. If a wrong answer and "I don't know" both score zero,
guessing never scores lower than admitting uncertainty. @kalai_hallucinate_2025
argue that models [hallucinate](#sec-tool-calls) because training and evaluation
reward guessing in this way. They propose stating the scores in the prompt and
scoring a wrong answer below "I don't know", for example +1 for a right answer,
0 for "I don't know", and −1 for a wrong one. Blind guessing among four options
then averages −0.5 points.

(sec-eval-judges)=
## Answers that need a judge

The three descriptions of the funk track from [the RL section](#sec-rl) have no
single correct wording. {numref}`tbl-caption-metrics` scores them in two ways.
The first counts the five annotated facts (funk, E minor, 104 BPM, 4/4, horns)
that each description matches. The second uses two word-overlap metrics, which
compare each description with a reference caption written for this example: "An
upbeat funk track in E minor, led by a tight horn section over a steady 4/4
groove at 104 BPM."

:::{table} Scores for the three RL descriptions. BLEU-4 scores the share of one- to four-word sequences in a description that also appear in the reference caption. It lowers the score of descriptions shorter than the reference. ROUGE-1 F1 is the F-measure of shared words.
:label: tbl-caption-metrics

| Description | Facts matched | BLEU‑4 | ROUGE-1 F1 |
|---|---|---|---|
| A: "Tight funk groove in E minor, 104 BPM in 4/4, with horns." | 5 of 5 | 0.12 | 0.55 |
| B: "A funk track around 104 BPM with a synth bass line." | 2 of 5 | 0.08 | 0.38 |
| C: "A laid-back jazz ballad in E major, led by piano." | 0 of 5 | 0.08 | 0.31 |
:::

% Settings for the table: sentence-level BLEU-4 with add-one smoothing; both
% metrics compare lowercased words, split at spaces and hyphens, with
% punctuation removed and no stemming; "4/4" counts as one word; add-one
% smoothing applies to the 2- to 4-gram precisions.

BLEU-4 gives B (two facts right) and C (none) the same score to two decimals,
and ROUGE-1 ranks C only slightly lower, because C shares "in E" and "led by"
with the reference. Fact matching separates the three, but it scores C's wrong
key the same as B's missing key; a separate count of wrong claims tells them
apart. It also cannot check claims outside the annotations, such as B's synth
bass line.

People who hear the track catch some errors, such as piano in place of horns.
Other errors need training: hearing that description C's "E major" is wrong
takes a trained ear, and a claim about voice leading needs a theorist. A rater
who can neither hear the track nor see its annotations can judge little more
than fluency. Experts also disagree with each other. @flexer_agreement_2016
argue that their agreement among themselves limits what a system's agreement
with them can show: near that level, small differences between systems say
little.

An LLM can also be the judge. It can grade one answer against a *rubric*, a list
of criteria to check, or pick the better of two answers. On general chat
questions, the strongest LLM judge agreed with expert raters about as often as
the experts agreed with each other, but judges also preferred longer answers and
often changed their verdict when the two answers swapped places
[@zheng_judge_2023]. Judging each pair in both orders counters the second
effect.

A text-only judge cannot hear the track and must be given the facts. It can then
match wordings a program would miss, such as "brass section" for horns. On
music, [Chapter 2](../understanding/benchmarks.md) reports a study in which an
LLM judge was unreliable at finding errors in MIR annotations, such as beat and
chord labels.

(sec-eval-agents)=
## Agents

An agent is scored by the result of its whole run. For the [DJ warm-up
set](#sec-agents), rerunning the agent's own tempo estimator to check the tempi
would repeat its errors. The check runs on many test folders, with tempi
annotated for each. It confirms that each track is in the folder and appears
once, that the tempi rise from 120 to 126 BPM, and that the durations, minus the
overlap at each transition, sum to about 20 minutes. If the request also asked
for keys that mix well, a program can check each key change against annotated
keys. A warm-up set is also expected to rise in energy. A DJ can judge this, or
an audio LLM judge first checked against a DJ's ratings on some sets.

A model or an agent can be given $k$ attempts at a task. *pass@k* counts the
task as solved if any attempt succeeds [@chen_codex_2021]. It suits a DJ who
listens to each proposed set and keeps a good one. *pass^k* counts it as solved
only if all attempts succeed [@yao_taubench_2024]. It suits an agent that builds
a set every night with nobody checking, where every set must work.
{numref}`fig-pass-k` compares the two for an agent that builds an acceptable set
on 60% of its attempts.

:::{figure} ../assets/llm/pass-k.svg
:label: fig-pass-k
:alt: Line chart over k from 1 to 8 for an agent that succeeds on 60% of its attempts at one task, with attempts independent. pass@k, the chance that at least one of k attempts succeeds, rises from 60% to 84% at k=2 and nearly 100% at k=8. pass^k, the chance that all k succeed, falls from 60% to 36% at k=2, 13% at k=4, and 1.7% at k=8.

pass@k and pass^k for an agent that succeeds on 60% of its attempts at one task,
assuming the attempts are independent. Over several tasks, both are computed task by task and then averaged. Tasks the agent never solves keep pass@k from rising this
fast, and tasks it always solves keep pass^k from falling this fast.
:::

(sec-eval-pitfalls)=
## Pitfalls

A model may have read a benchmark's questions and answers on the web during
pre-training, which is called *contamination*
[@brown_gpt3_2020; @dubey2024llama]. The keys and tempi of well-known songs are
listed online too, so a model may give the key or tempo of a famous track
without listening.

Scores depend on the prompt and other settings. One technical report gave its
model 90.0% on a multiple-choice knowledge test with 32 sampled chains of
thought per question, and 83.7% with a prompt of five solved examples, the setup
behind a rival model's reported 86.4% [@gemini_2023]. A comparison holds only
when every model is run with the same setup.

A score is an estimate. With $n$ questions, the share answered correctly has a
95% confidence interval of at most about $\pm 1/\sqrt{n}{:}$ ±10 points for 100
questions and ±5 for 400. One large lab's model report lists this interval with
every benchmark score [@dubey2024llama]. On a music-theory test of 98
four-option questions, the test's authors reported about 26% for a leading model
of the time [@yuan_chatmusician_2024]. The interval around that score, from 17%
to 35%, includes the 25% expected from guessing.

(sec-eval-own)=
## Testing a model on your own task

A test for an MIR task starts from examples with answers you trust, such as
annotated keys or tempi. Tracks that are not well known, file names and tags
that do not give the answer, and examples kept offline guard against
[contamination](#sec-eval-pitfalls). The model can hear the tracks itself, as an
audio LLM does ([Chapter 2](../understanding/modalities.md)), or call MIR tools,
as the DJ agent does. By the interval above, a few dozen examples can show that
a model falls far short, but telling apart two models a few points apart takes
hundreds to thousands of questions. Running each question several times and
averaging the scores gives a steadier estimate, as large labs do for reasoning
models [@deepseek_r1_2025]. The result is then compared with the system you use
today, such as a beat tracker or a tagger.

Large labs' model reports state the setup behind each score, such as the prompt
format, the [temperature](#sec-next-token), and the number of runs per question
[@dubey2024llama; @deepseek_r1_2025]. For an MIR test, the setup also includes
the number of tracks, the source of the reference answers, the count of answers
that could not be extracted or said "I don't know", and, for an agent, its
harness and tools. A model you reach through a company's service can change
while its name stays the same, so the date of the run matters too
[@chen_chatgpt_2024].

(sec-eval-experts)=
## Tests written by music experts

Music tests for LLMs often take their reference answers from metadata, from the
output of MIR tools, or from multiple-choice questions their authors wrote. A
reference answer taken from a tool carries the tool's errors, such as the
half-tempo error in the [DJ example](#sec-agents), and such tests ask what is
easy to score: a tag, a key, one of four options. Musicians also judge music in
other terms, such as whether a voicing suits the style or whether a groove sits
behind the beat.

In other fields, experts write the tests. In a graduate-level science test,
domain experts wrote each question and other experts checked it. Experts
answered 65% correctly in their own field, and skilled non-experts with web
access 34% [@rein_gpqa_2024]. For a widely used coding benchmark, professional
developers screened the tasks, and the 500 they judged well specified and fairly
tested replaced the original set [@openai_swebench_verified_2024]. In music,
[Chapter 5](../performing/feedback_language.md) describes a test in which 18
professional vocal trainers annotated 515 recordings, and audio LLMs rarely
matched their diagnoses [@bang_vocalcoachbench_2026].

Musicians, theorists, and teachers can write such tests in their own terms, and
MIR researchers bring two decades of shared evaluation through MIREX
[@downie_mirex_2008]. The methods on this page apply: answers that several
experts agree on, or a measured level of disagreement among them; recordings
that are not well known; and part of the test kept private. Questions that no
current model answers correctly are worth keeping, because they show developers
what to fix.

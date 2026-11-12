---
title: Limitations and Open Problems
authors:
  - name: Seungheon Doh
---

# Limitations and open problems

The previous pages described what works, and the evaluation section of the
last one described how badly we measure it. This page collects what does not
work yet, organized by where in the pipeline the problem lives, and ends with
the directions we think are worth the next few years.

## In the record

- **Anything with a time axis.** The conditioned models of the annotation
  page are at parity with captioners and close on categories, but on tasks
  whose answer is a sequence of events aligned to the audio they are still
  far behind. In CMI-Bench2 the best audio-text LLM reaches an F-measure of
  30.3 on beat tracking against 88.3 for a supervised tracker, 7.2 against
  72.3 on melody extraction, and 33.8 against 70.3 on structure boundaries
  within 0.5 seconds [@ma_cmibench2_2026]. Chord recognition is not in the
  instruction benchmarks at all. One likely reason is the output format: an
  LLM emits one token at a time from a pooled audio representation, while
  beats, chords, and section boundaries are dense outputs that need to be
  placed on the waveform at frame resolution. For these fields the
  supervised MIR models are still the better source.
- **One entry per track.** Tags, captions, and the fields in the record
  describe a whole track, which is a direct consequence of the limitation
  above: without reliable structure analysis, there is no segment to attach
  a description to. A quiet verse and a loud chorus get one entry, and
  "late-night" may be true of half the track.
- **Answering from the text.** Audio-language models often answer music
  questions from the wording of the question rather than from the audio
  [@weck_muchomusic_2024], and benchmarks have had to be rewritten so that
  the text alone no longer gives the answer away [@zang_listening_2025]. A
  record built from such answers is partly a record of the prompt.
- **Evaluation measures fluency, not truth.** Caption metrics borrowed from
  image captioning reward overlap with a reference sentence and correlate
  poorly with whether the description fits the music
  [@lee2024captioningmetricsreflectmusic]. When the reference was written by
  another LLM, our reading is that they also reward the house style. Neither
  checks whether the trumpet is actually muted.
- **Hallucination at catalog scale.** The text LLM that enriches the record
  knows a great deal about famous artists and will invent what it does not
  know about obscure ones. A model that invents a release year for one track
  does so for a million, and the error is then indexed and searched. LLM
  recommenders have been shown to name items that do not exist
  [@he_zeroshot_crs_2023]; a record built from the model's memory inherits the
  habit.
- **New releases have no record.** A track released today has audio and a
  title. Everything the planner filters on has to be written first.

## In search

- **The planner is unverified.** When the LLM rewrites "late-night drive in
  the rain" as "slow instrumental jazz," that rewrite is a guess about the
  listener. It is rarely shown to the listener and rarely evaluated.
- **Negation and exclusion.** "No vocals" is easy once it is a field and hard
  when it is not. Most of what a listener might exclude (a mood, an era, a
  sound) is not a field yet.
- **The reranker never listens.** It orders by the record. Two tracks with the
  same record are the same track to it.

## In recommendation

- **Popularity bias.** An LLM has read far more about famous artists than
  obscure ones, and zero-shot LLM recommenders favor popular items
  [@he_zeroshot_crs_2023]. This is where the database thesis of this chapter
  pays off: the tools, and the record, are what pull the model back toward
  the catalog and its long tail.
- **Synthetic dialogues train synthetic behavior.** Most conversational
  training data was written by an LLM, including ours. A model trained on it
  learns to answer the requests an LLM would write, not the ones listeners
  make; human-collected dialogues [@chaganty2023beyond] are better kept for
  evaluation than for training.
- **Explanations may be rationalizations.** An LLM can state the evidence it
  used, or invent a plausible reason after the fact, and the two read the
  same. No current music recommender is evaluated on which one it does.
- **The state is not yet a product.** Listener state is held in a context
  window and lost at the end of the session. Memory across sessions, and the
  listener's control over it, are open design problems.

## Open problems from the RecSys Challenge 2026

The RecSys Challenge 2026 evaluated many submitted systems on the same
conversations. Its analysis shows four problems that the systems share
[@doh_recsyschallenge_2026].

### Open problem 1: Multi-turn understanding

Ranking quality rises over the first few turns, as the system learns what the
listener wants, and peaks around the third
({numref}`fig-limits-multiturn`). It then falls, and by the eighth turn the
median system has lost about half of its peak score. Systems use the first
turns of context and lose track of later ones.

:::{figure} img/limits-multiturn.png
:label: fig-limits-multiturn
:width: 60%
:alt: Line chart of nDCG at 20 by target turn index from 1 to 8 for the 16 challenge systems. The median system rises from about 0.1 at turn 1 to about 0.57 at turn 3, then declines to about 0.27 at turn 8. A BM25 plus Llama baseline stays below 0.3 throughout.

Ranking quality by conversation turn in the RecSys Challenge 2026. Figure from [@doh_recsyschallenge_2026].
:::

### Open problem 2: User query understanding

The analysis sorts queries by how specific the wording is and how specific
the target is ({numref}`fig-limits-query`). Systems do best when both are
specific ("Windup by Hayoung Lyou, the jazz composer and pianist"; median
nDCG@20 0.47). They do worst when the wording is vague but only a few tracks
are correct ("What was the popular song from a recent musical movie?"; 0.27).
That case needs world knowledge and reasoning before any retrieval.

:::{figure} img/limits-query-table.png
:label: fig-limits-query-table
:alt: Four query types. LL, low query specificity and low target specificity: Play some chill music. HL, high query specificity and low target specificity: Find bebop jazz with saxophone, 1950s to 60s. LH, low query specificity and high target specificity: What was the popular song from a recent musical movie? HH, high on both: Windup by Hayoung Lyou, the jazz composer and pianist.

Four query types by the specificity of the wording and of the target. Table from [@doh_recsyschallenge_2026].
:::

:::{figure} img/limits-query-specificity.png
:label: fig-limits-query
:width: 60%
:alt: nDCG at 20 of each challenge system on the four query types. Medians: LL 0.35, HL 0.39, LH 0.27, HH 0.47.

Ranking quality by query type. Vague wording with a specific target (LH) is the hardest. Figure from [@doh_recsyschallenge_2026].
:::

### Open problem 3: Cold start

When the listener's profile is hidden, most systems score about the same as
when it is shown ({numref}`fig-limits-coldstart`). Either the profile is
rarely needed, or systems are not yet using it. The second reading would mean
personalization is largely unsolved.

:::{figure} img/limits-cold-start.png
:label: fig-limits-coldstart
:width: 65%
:alt: For each challenge system, nDCG at 20 with the user profile visible (warm) and masked (cold), and the cold-minus-warm difference with 95% bootstrap intervals. For almost every system the interval includes zero.

Warm against cold nDCG@20 per system. Figure from [@doh_recsyschallenge_2026].
:::

### Open problem 4: Generalizing multitask modeling

The introduction argued that the two tasks merge, but the representations
resist. Semantic IDs built for search perform poorly on recommendation and
the reverse, and IDs trained on both tasks land between the two specialists
({numref}`fig-limits-joint`) [@penha_semanticids_2025].

:::{figure} img/limits-joint-ids.png
:label: fig-limits-joint
:width: 60%
:alt: Scatter plot of recommendation recall at 30 against search recall at 30 for semantic ID strategies. Recommendation-based IDs are highest on recommendation and lowest on search, search-based IDs the reverse. A multi-task strategy lies on the Pareto frontier between them; fused, separate, and prefix-share strategies lie below it.

Search and recommendation quality for different semantic ID strategies. Figure from [@penha_semanticids_2025].
:::

## Directions

**Treat annotation as a database problem.** Some fields have ground truth
and should be evaluated against it: tempo, key, and instrumentation against
MIR benchmarks, release year and artist against a release database. Others,
such as mood and scene, do not, and for those the question is agreement with
listeners rather than accuracy. Store each field with its provenance (which
model, which source, how confident), render language from the fields, and let
listeners and editors correct the record.

**Make the plan visible and testable.** Show the listener how the request was
split, let them correct it, and log the corrections as training data. Build
query sets from real request logs rather than captions, and score systems on
constraint satisfaction as well as relevance. Push the LLM's text knowledge
into the record at indexing time, where it can be checked once
[@doh_ttmrpp_2024], rather than into every query, where it cannot.

**Evaluate the loop, not the list.** With simulated or recruited listeners who
respond over several turns, score constraint satisfaction, revision handling,
and whether the explanation matches the evidence actually used. Make the
listener state a first-class object the listener can read and edit. And keep
the collaborative model in the loop as a tool, because it is the only
component that knows what millions of other people actually played.

**Let the reranker listen.** The one place in the pipeline where a conditioned
model could add something no record has is the final comparison between a
handful of candidates, where the cost of listening is small and the question
("which of these five fits a night drive?") is exactly the kind it answers
well.

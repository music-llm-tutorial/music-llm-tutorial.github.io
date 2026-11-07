---
title: Limitations
authors:
  - name: Seungheon Doh
---

# Limitations and directions

The previous pages described what works, and the evaluation section of the
last one described how badly we measure it. This page collects what does not
work yet, organized by where in the pipeline the problem lives, and ends with
the directions we think are worth the next few years.

## In the record

- **Anything with a time axis.** The conditioned models of the annotation
  page are at parity with captioners and close on categories, but on tasks
  whose answer is a sequence of events aligned to the audio they are not yet
  usable. In CMI-Bench the best audio-text LLM reaches an F-measure of 23.7
  on beat tracking against 88.3 for a supervised tracker, and 9.5 against
  74.3 on key detection, with melody extraction and lyrics transcription in
  the same range [@ma_cmibench_2025]. Chord recognition and structure
  analysis, the two time-aligned tasks a listener would most want in a record
  ("where is the chorus?", "what does the bridge do harmonically?"), are not
  in the instruction benchmarks at all, and we know of no audio-text LLM that
  reports them at a usable level. The reason is structural rather than a
  matter of scale: an LLM emits one token at a time from a pooled audio
  representation, and beats, chords, and section boundaries are dense
  outputs that need to be placed on the waveform at frame resolution. This
  is the one part of annotation where the supervised MIR models are not a
  stopgap but the only option, and a record that asks the conditioned model
  for them will be wrong in exactly the fields that make a track more than
  a mood.
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

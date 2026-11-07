---
title: LLM-powered Music Annotation
authors:
  - name: Seungheon Doh
---

# LLM-powered Music Annotation

In the introduction, user 1024 asked for something for a late-night drive in
the rain, with no vocals and nothing too old. Whether track #0381 is an answer
depends on what the database knows about it. The catalog supplied two columns
for free, *genre* (jazz) and *year* (2019), but the columns the request
actually turns on, *mood* and *instruments*, are empty. Annotation is the task
of filling them, and of adding the columns no one has filled yet. This page is
about which capabilities of LLMs change how that is done.

## How LLMs help annotation

Three capabilities of LLMs, each introduced in Chapter 1, change what
annotation can do ({numref}`fig-annotation-capabilities`).

**Multimodal understanding: the model hears the track and knows the world.**
An audio encoder and a small adapter map music into the LLM's token space, so
the model reads a track the way it reads a sentence. The model that hears a
brushed snare also knows what a piano trio is, what *nocturnal* tends to mean
in jazz, and that 2019 is recent. A tagger heard the audio and knew nothing
else. An LLM brings the vocabulary and world knowledge of text to every track
it listens to.

**Autoregressive generation: the output is open.** The model writes one token
at a time, so a label, a database field, and a full sentence come out of the
same mechanism. A column is no longer limited to the values a model was
trained on: *instruments* can hold *piano trio*, and a caption can say how the
instruments relate. Known fields can be given as the start of the sequence and
the missing ones written after them, which turns filling in a row into
continuing a text.

**Multitask instruction following: one model fills many columns.** The task
is named in the instruction rather than fixed at training time. "Add mood and
instruments, then write a caption" asks for three columns at once, and a new
column costs a new instruction rather than a new dataset and a new model.

Together, the three let one model fill many columns of the database, from one
set of weights, in whatever form each column needs. The next two sections take
multitask and autoregressive generation in turn; the last two cover how the
result is evaluated and where it still falls short.

:::{figure} ../assets/annotation-capabilities.svg
:label: fig-annotation-capabilities
:alt: Music passes through an audio encoder and an adapter into an LLM, which also reads an instruction: add mood and instruments, then write a caption. The LLM writes its answer one token at a time: mood nocturnal, instruments piano trio, and a caption beginning "A sparse piano trio". Three tags mark the capabilities: (1) multimodal understanding at the encoder and adapter, which turn music into tokens the LLM reads like text; (2) autoregressive generation at the output, which produces a label, a field, or a sentence the same way; (3) multitask at the instruction, which names the task so one model serves many annotation tasks.

Three LLM capabilities behind music annotation. (1) An audio encoder and adapter turn music into tokens the LLM can read. (2) The output is generated one token at a time, so a label, a field, and a sentence come out the same way. (3) The instruction names the task, so one model serves many tasks.
:::

## One model, many tasks

Before LLMs, each column had its own model. A genre classifier filled
*genre*, an instrument classifier filled *instruments*, and a captioner wrote
the caption, each trained on its own labeled dataset and each limited to what
that dataset contained: a tagger's vocabulary was typically around fifty
labels, and captioned audio existed only in the thousands
[@turnbull2008semantic; @nam2018deep; @manco2021muscaps; @manco2023song].
Adding a column meant collecting a dataset and training a model. Our earlier
tutorial covers this generation of tagging and captioning models in depth
[@doh2024connecting].

Audio-language LLMs replace the row of models with one
({numref}`fig-annotation-multitask`). The models in this family share a
design: a pretrained music audio encoder feeds a pretrained LLM through a
small adapter, and the pair is tuned on instruction data that was itself
written by an LLM from existing annotations. **MU-LLaMA** uses MERT features
and builds its question-answer data from caption datasets [@liu_music_2024].
**LLark** converts the annotations of several open datasets (tags, keys,
tempi, captions) into one instruction format [@gardner2023llark].
**MusiLingo** and **SALMONN** follow the same recipe, the latter for speech,
sound, and music in one model [@deng_musilingo_2024; @tang_salmonn_2024].
**Music Flamingo** scales it, with long captions and question-answer pairs
about harmony, structure, timbre, lyrics, and cultural context, followed by
chain-of-thought and reinforcement-learning stages
[@ghosh_musicflamingo_2026]. Chapter 2 covers the architectures. What matters
here is that the many datasets of the previous generation become many
instructions for one model.

:::{figure} ../assets/annotation-multitask.svg
:label: fig-annotation-multitask
:alt: Top, previous approaches: a genre classifier, an instrument classifier, and a captioner, three models trained on three datasets, each fill one column of the database (genre jazz, instruments piano trio, caption "A sparse piano trio, brushed drums."). Bottom, with an LLM: three instructions (What is the genre? List the instruments. Write a caption.) go into one audio-language LLM, which fills the same three columns.

One model per column versus one model for many columns. Previous approaches train a separate model for each column of the database; an audio-language LLM fills the same columns from one set of weights, with the instruction choosing the column.
:::

For the database, the consequence is that a column is defined at inference
time. A new column, *fits a night drive* or *what the lyrics are about*, costs
one instruction rather than one model. A zero-shot instruction defines the
column in words ("rate the energy from 1 to 5"). A few-shot instruction
defines it by example: a handful of tracks annotated the way an editor would,
placed in the context, and the model continues the pattern across the catalog
in the editor's vocabulary [@kong2024audio_flamingo]. CMI-Bench shows the
scale of the change: one checkpoint answers thirteen standard MIR tasks posed
as instructions, where the supervised baselines are thirteen separate models
[@ma_cmibench_2025]. At catalog scale, one model that is somewhat worse on
each column can be more useful than thirteen models that are better on one,
because the database is never finished.

## Why sequence modeling fits annotation

Autoregressive generation is what opens the output. A caption is a sequence:
the model predicts each word from the audio, the instruction, and the words
already written ({numref}`fig-annotation-sequence`). Nothing restricts the
next word to a fixed vocabulary, so the caption for #0381 can say *piano
trio* and *brushed drums*, values no fifty-label tagger had. It can also state
relations a label cannot: which instrument carries the melody, what changes
after the intro, that the tempo is slow *for* a trio.

Metadata imputation is the same computation on a different sequence. Write
the database row out as text, *genre: jazz, year: 2019, mood: …,
instruments: …*, and the known fields become the context while the missing
ones become the continuation. The model writes *nocturnal* for *mood* and
*piano trio* for *instruments*, each conditioned on the audio and on
everything before it, including the fields the catalog already had. Music
metadata LLMs make this a central task: audio and a partial set of fields
in, the missing fields out, so a catalog with a genre but no mood is
completed rather than rewritten [@bukey_metadata_2026].

:::{figure} ../assets/annotation-sequence.svg
:label: fig-annotation-sequence
:alt: Two rows of tokens. Captioning: given an audio chip and the instruction "Write a caption.", the model generates "A sparse piano trio, brushed drums." one token at a time, each conditioned on the ones before. Metadata imputation: the database row is written out as tokens, genre jazz and year 2019 given as context, and the model generates the missing values, mood nocturnal and instruments piano trio. The completed row goes back into the database with the generated cells highlighted.

Captioning and metadata imputation as sequence modeling. Gray tokens are given as context; amber tokens are generated, each conditioned on everything before it.
:::

The two tasks differ in what the model is given besides the audio and the
instruction, and that decides when each is the right tool.

| | Audio → information | Audio + metadata → information |
|---|---|---|
| Input | audio, instruction | audio, instruction, the row so far |
| Typical tasks | captioning, tagging, question answering | metadata imputation, conditioned captioning, consistency checking |
| Right tool for | a new release with only audio; a column no one has filled | a catalog with partial, noisy, or inconsistent fields |
| What goes wrong | invents what the audio cannot carry (year, artist) | inherits errors already in the row |

Generating from the row also keeps the row consistent. Because every token is
conditioned on the fields before it, a caption written after *year: 2019*
will not describe a 1950s recording, and a field the audio contradicts, such
as *vocals: yes* on an instrumental, can be flagged instead of propagated.
The output can be as structured as the database needs, a JSON object or a
table row, since a structure is only a sequence with a format. The weakness
is the mirror image: whatever is wrong in the row goes in as context and
tends to come out confirmed.

## Evaluation

Annotation is evaluated differently from understanding. Chapter 2 asks what a
model knows and can reason about, usually through question answering.
Annotation produces a column in the database, so it is judged the way MIR
models always were: on each task's datasets, with each task's metrics. What
changes is the ability under test. The question is no longer whether a model
built for genre classifies genre, but whether one model, told in words which
column to fill, fills it correctly and in the form the column needs. The
ability being measured is **instruction following**.

**CMI-Bench** is built around exactly this [@ma_cmibench_2025]. It recasts
thirteen standard MIR tasks, from tagging and key detection to melody
extraction and lyrics transcription, as instructions, and scores eleven
audio-text LLMs with each task's usual metric. The numbers can therefore be
compared directly with supervised models, and because each answer has to be
scored by that metric, it has to come back in the form the task expects: a
label from the set, a key name, beat times. {numref}`fig-annotation-cmibench`
shows six of the tasks. The pattern follows the capabilities above: parity on
captioning, the one task whose output is open; ten to twenty points behind on
categories such as tags, genre, and instruments; and far behind on
measurements such as key and beat. The comparison is one-sided, though. Each
supervised score comes from the best model built and tuned for that row, while
the LLM is one checkpoint answering every row from an instruction. That it
lands within reach on categories, and at parity on captioning, is the result
worth noticing. As with understanding benchmarks, it also has to be checked
that the answers came from the audio rather than from the wording of the
instruction [@weck_muchomusic_2024; @zang_listening_2025].

:::{figure} ../assets/annotation-cmibench.svg
:label: fig-annotation-cmibench
:alt: Dumbbell chart, one row per task, score on each task's own metric from 0 to 100. Open output: captioning (MusicCaps, METEOR) LLM 22.5, supervised 22.4. Categories: tagging (MagnaTagATune, ROC-AUC) 81.2 vs 92.0; genre (GTZAN, accuracy) 72.1 vs 83.9; instrument (NSynth, accuracy) 58.4 vs 78.2. Measurements: key (GiantSteps, weighted score) 9.5 vs 74.3; beat (GTZAN-Rhythm, F-measure) 23.7 vs 88.3.

The best audio-text LLM against the best supervised model on six CMI-Bench tasks [@ma_cmibench_2025]. Each task is scored on its own metric, so compare the gap within a row, not positions across rows.
:::

Captioning is where the MIR recipe runs out. There is no label to match, and
many different sentences describe #0381 correctly. Three approaches are in
use.

**Reference-based.** The caption is compared with one or more human-written
references. N-gram metrics borrowed from machine translation and image
captioning, such as BLEU, METEOR, and CIDEr, are cheap and reproducible, but
they reward word overlap with a particular sentence, and they correlate poorly
with whether the description fits the music
[@lee2024captioningmetricsreflectmusic]. A correct caption phrased
differently from the reference scores low, and when the reference was itself
written by an LLM, our reading is that the metrics also reward its house
style.

**Reference-free.** The caption is scored against the audio directly, as the
similarity between the two in a joint audio-text embedding such as CLAP
[@wu2023large]. No reference is needed, so any track in the catalog can be
scored. Embedding similarity is coarse, however: it misses errors of syntax
and small hallucinations.

**LLM-as-a-judge.** An LLM reads the caption, scores it against a rubric, and
explains the score. In general text generation, strong LLM judges agree with
human preferences about as well as humans agree with each other
[@zheng_judge_2023]. Multimodal LLMs extend the judge beyond text: given the
non-text input as well as the response, they compare two answers reliably,
though their absolute scores and rankings drift further from human ones
[@chen_mllmjudge_2024]. Music models have begun to use judges in both roles,
to evaluate and to curate. Music Flamingo reports the correctness and
coverage of its long-form captions with an LLM judge, keeps only training
captions and question–answer pairs that a multimodal LLM verifies, and checks
its reasoning chains step by step against the audio
[@ghosh_musicflamingo_2026]. LLM2Fx-Tools uses an LLM judge to score
instruction following and the quality of the model's reasoning, outputs that
have no single reference, and to flag weak training samples for regeneration
[@doh_llm2fxtools_2025]. AudioCapBench scores accuracy, completeness, and
hallucination separately, and finds music the hardest of its three domains
[@qiu_audiocapbench_2026]. We think this is the most promising direction for
annotation in particular. A caption makes claims, *a piano trio*, *brushed
drums*, *no vocals*, and a judge with access to the audio and the row can
check them one at a time, so the score says what is wrong and not only how
much. Judges have their own biases, toward their own phrasing and toward the
wording of the prompt, so a judge should be calibrated against a small set of
human ratings before it scores a catalog.

## Limitations and future challenges

- **Time-aligned measurements.** On tasks whose answer is a sequence of
  events placed on the waveform, LLMs are not yet usable: in CMI-Bench the best
  model reaches 23.7 on beat tracking against 88.3 for a supervised tracker,
  and 9.5 against 74.3 on key detection [@ma_cmibench_2025]. Chord recognition
  and structure analysis are not in the instruction benchmarks at all. The
  reason is structural rather than a matter of scale: the model emits one token
  at a time from a pooled audio representation, while beats, chords, and
  section boundaries are dense outputs at frame resolution. *Challenge:* let
  the LLM call supervised MIR models as tools, the agent pattern of Chapter 1,
  or give it audio representations that keep time.
- **One row per track.** Without reliable structure analysis there is no
  segment to attach a description to. A quiet intro and a busier second half
  share one row, and *nocturnal* may be true of half the track. *Challenge:*
  rows per section, so that search can point to the part of a track that fits.
- **World knowledge cuts both ways.** The knowledge that fills columns the
  audio cannot carry is also where the model is most confidently wrong. A model
  that invents a release year for one obscure track does so for a million, and
  the error is then indexed and searched; LLM recommenders have been shown to
  name items that do not exist [@he_zeroshot_crs_2023]. *Challenge:* record
  where each cell came from (audio, catalog, or model knowledge) and ground the
  knowledge-based columns in sources.
- **Errors in the row are confirmed.** Imputation conditions on the fields it
  is given, so a wrong *genre* goes in as context and comes out supported by a
  matching *mood*. *Challenge:* check each given field against the audio
  before writing new ones.
- **Evaluating the database, not the answer.** Every benchmark above scores
  one answer to one question. What a listening system needs is a database
  that is complete, consistent across columns, and useful downstream, and no
  benchmark measures that yet. *Challenge:* score annotation by what it does
  for search/retrieval and recommendation, the subject of the next pages.

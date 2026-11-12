---
title: Music Annotation
authors:
  - name: Seungheon Doh
---

# LLM-powered Music Annotation

In the introduction, a listener asked for something for a late-night drive in
the rain, with no vocals and nothing too old. Whether track #0381 is an answer
depends on what the database knows about it. The catalog supplied two columns
for free, *genre* (jazz) and *year* (2019), but the columns the request
actually turns on, *mood* and *instruments*, are empty. Annotation is the task
of filling them, and of adding the columns no one has filled yet. This page is
about which capabilities of LLMs change how that is done.

## Goal of annotation

The goal of annotation is to extract as much information as possible from the
music without writing anything false: high recall and high precision at the
same time. In database terms, an annotation model adds new fields to the
records the catalog already has, and new records for tracks that have none.

This is a different target from the multiple-choice question answering that
audio benchmarks such as MMAU-Pro and MMAR use
[@kumar_mmaupro_2025; @ma_mmar_2025]. Those benchmarks are good tests of
general audio intelligence: the model hears a clip, reads a question, and
picks one of a few options. An annotator is not handed options. It has to
decide on its own what is worth saying about a track, and every statement it
adds is a chance to be wrong. A model can score well on multiple choice and
still write a poor row, so annotation needs its own evaluation, described
[below](#sec-annotation-evaluation).

## LLM-powered annotation

Three capabilities of LLMs, each introduced in Chapter 1, change what
annotation can do.

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
autoregressive generation and multitask in turn. The sections after them
cover what other LLM capabilities add, how the result is evaluated, and where
it still falls short.

## Annotation as multitask sequence modeling

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

## Trends: the multitask music information decoder

Before LLMs, each column had its own model. A genre classifier filled
*genre*, an instrument classifier filled *instruments*, and a captioner wrote
the caption, each trained on its own labeled dataset and each limited to what
that dataset contained: a tagger's vocabulary was typically around fifty
labels, and captioned audio existed only in the thousands
[@turnbull2008semantic; @nam2018deep; @manco2021muscaps; @manco2023song].
Adding a column meant collecting a dataset and training a model. Our earlier
tutorial covers this generation of tagging and captioning models in depth
[@doh2024connecting].

Audio-language LLMs replace the row of models with one. The models in this
family share a design ({numref}`fig-annotation-capabilities`): a pretrained music audio encoder feeds a pretrained LLM through a
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

:::{figure} ../assets/annotation-capabilities.svg
:label: fig-annotation-capabilities
:alt: Music passes through an audio encoder and an adapter into an LLM, which also reads an instruction: add mood and instruments, then write a caption. The LLM writes its answer one token at a time: mood nocturnal, instruments piano trio, and a caption beginning "A sparse piano trio". Three tags mark the capabilities: (1) multimodal understanding at the encoder and adapter, which turn music into tokens the LLM reads like text; (2) autoregressive generation at the output, which produces a label, a field, or a sentence the same way; (3) multitask at the instruction, which names the task so one model serves many annotation tasks.

Three LLM capabilities behind music annotation. (1) An audio encoder and adapter turn music into tokens the LLM can read. (2) The output is generated one token at a time, so a label, a field, and a sentence come out the same way. (3) The instruction names the task, so one model serves many tasks.
:::

:::{table} Audio-language models that can be instructed to annotate music. Size is the approximate total parameter count; "eff." means effective parameters. † marks entries not yet checked against the paper.
:label: tbl-annotation-models

| Model | Year | Weights | Audio encoder | LLM backbone | Size | Tasks |
|---|---|---|---|---|---|---|
| LLark [@gardner2023llark] | 2023 | Open | Jukebox-5B (frozen) | Llama 2 7B-chat | ~7B | Captioning, QA, reasoning, key/tempo |
| MU-LLaMA [@liu_music_2024] | 2023 | Open | MERT-v1-330M | LLaMA-2 7B | ~7B | Music QA, captioning |
| MusiLingo [@deng_musilingo_2024] | 2023 | Open | MERT-v1-330M | Vicuna-7B | ~7B | Captioning, music QA |
| SALMONN [@tang_salmonn_2024] | 2023 | Open | Whisper-large-v2 + BEATs | Vicuna 7B / 13B | 7B / 13B | Speech, sound, music: ASR, captioning, QA |
| Qwen-Audio [@chu_qwen-audio_2023] | 2023 | Open | Whisper-large-v2 (init) | Qwen-7B | 8.2B | 30+ audio tasks, multitask pretraining |
| Audio Flamingo [@kong2024audio_flamingo] | 2024 | Open | ClapCap (sliding window) | OPT-IML-MAX 1.3B | ~2.2B | Sound/music captioning, QA, ICL, dialogue |
| Gemini 1.5 Pro | 2024 | Closed | Undisclosed (native multimodal) | Undisclosed | — | Long audio/video understanding |
| Qwen2-Audio | 2024 | Open | Whisper-large-v3 (init) | Qwen-7B | 8.2B | Voice chat, audio analysis |
| OpenMU [@zhao_openmu_2024] | 2024 | Open | AudioMAE † | Llama 3 † | ~8B † | Captioning, reasoning, MCQ, lyrics, tool use |
| Audio Flamingo 2 | 2025 | Open | AF-CLAP | Qwen2.5-3B | ~3B | Long audio (up to 5 min) QA, reasoning |
| Gemini 2.5 Pro | 2025 | Closed | Undisclosed | Undisclosed (thinking) | — | Audio/video understanding with reasoning |
| Qwen2.5-Omni [@xu_qwen25omni_2025] | 2025 | Open | Whisper-large-v3 (init) | Qwen2.5-7B (Thinker) | 7B | Text/image/audio/video in, speech out |
| Gemma 3n | 2025 | Open | USM-based Conformer (~680M) | Gemma 3n E2B / E4B | 2B / 4B eff. | ASR, speech translation, audio QA, on-device |
| Audio Flamingo 3 [@goel_af3_2025] | 2025 | Open | AF-Whisper | Qwen2.5-7B | ~8B | Speech/sound/music, long audio, CoT, chat |
| MuFun † | 2025 | Open | † | Qwen3-8B-Base | ~8B | Music understanding, lyrics, captioning |
| Qwen3-Omni [@xu_qwen3omni_2025] | 2025 | Open | AuT (from scratch) | Qwen3-30B-A3B MoE | 30B (3B active) | Omni; audio captioner variant |
| Music Flamingo [@ghosh_musicflamingo_2026] | 2025 | Open | AF-Whisper (from AF3) | Qwen2.5-7B | ~8B | Long music captions, theory QA, CoT + RL |
| Step-Audio-R1 | 2025 | Open | Qwen2 audio encoder (frozen) | Qwen2.5-32B | ~33B | Audio reasoning with RL |
| Gemini 3 Pro | 2025 | Closed | Undisclosed | Undisclosed | — | Multimodal reasoning |
| Gemma 4 | 2026 | Open | USM-based Conformer (305M) | Gemma 4 E2B / E4B | 2B / 4B eff. | On-device audio understanding |
| MOSS-Audio † | 2026 | Open | MOSS-Audio-Encoder + DeepStack | Qwen3-4B / 8B | 4B / 8B | Speech, sound, music, time-aware QA |
| MOSS-Music † | 2026 | Open | MOSS-Audio-Encoder | Qwen3-8B | ~8B | Music understanding |
| Audex | 2026 | Open | Audio encoder → text embedding † | Nemotron-Cascade-2-30B-A3B | 30B (3B active) / 2B | Unified audio-text, no text regression |
:::

The family keeps growing. **OpenMU** adds a benchmark built from existing MIR
datasets to the same design [@zhao_openmu_2024], and general omni models such
as **Qwen3-Omni** treat music as one of many inputs [@xu_qwen3omni_2025].

### How to train the model

The training data follows a recipe that LLark made explicit, with three
sources. The first is *multiple datasets*: the annotations of existing
tagging, key, tempo, and captioning datasets are pooled. The second is
*distillation from pretrained MIR models*: tempo, downbeat, chord, and key
estimators are run on every clip, so a clip that came with only a genre tag
also gets these derived features. The third is *LLM augmentation*: a text LLM
reads everything known about a clip and writes question-answer pairs for
music understanding, captioning, and reasoning [@gardner2023llark]. The model
is then trained on the audio and these pairs. None of the three sources needs
new human labels.

:::{figure} img/annotation-llark-training.png
:label: fig-annotation-llark
:alt: LLark's training data pipeline. Original annotations such as tags and genre vary by dataset. Pretrained feature extractors estimate tempo, downbeats, chords, and key from the raw audio for every clip. The combined features are given to a language model with three prompts, which writes question-answer pairs for music understanding, captioning, and reasoning.

How LLark builds its instruction data: annotations from several datasets, features estimated by pretrained MIR models, and question-answer pairs written by an LLM. Figure from [@gardner2023llark].
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

(sec-annotation-capabilities)=
## Beyond the multitask model: more LLM capabilities

A model that answers many instructions uses only some of what Chapter 1
described. In-context learning, pretrained knowledge, chain-of-thought
reasoning, and pipelines of several models are starting to be applied to
annotation as well. Four recent examples show what each adds.

### In-context learning calibrates subjectivity

Emotion is the standard
example of a label on which listeners disagree. Dai et al. do not ask the LLM
for valence and arousal directly. A small task-specific model predicts both
first, and the LLM corrects that prediction after reading demonstrations:
other tracks, each with its description or audio embedding, its lyrics, the
small model's prediction, and the human rating [@dai_va_icl_2026]. Arousal
was already predictable from the audio (R² 0.78 from the small model alone,
0.87 after refinement). Valence was not: asked directly, the LLM scores an R²
of −0.80, the small model reaches 0.11, and 80 demonstrations raise it to
0.43. The demonstrations show the LLM how this particular set of listeners
rated music, which a fixed model cannot be told.

:::{figure} img/annotation-icl-valence.png
:label: fig-annotation-icl
:width: 70%
:alt: Bar chart of R squared on MER60 for valence and arousal. Valence: zero-shot LLM minus 0.801, base model without in-context learning 0.110, with 80-shot in-context refinement 0.427. Arousal: 0.699, 0.783, and 0.874.

In-context learning calibrates valence far more than arousal. Results from [@dai_va_icl_2026].
:::

### Pretrained knowledge helps annotation

Yang et al. give GPT-4o
only the title and composer of a classical piano piece and ask which of four
valence-arousal quadrants it belongs to [@yang_emotion_annotation_2025].
Against the majority vote of three experts the model is right 57% of the
time, and 71% once it also reads retrieved web text about the piece. The
experts themselves agree with their own majority 81 to 87% of the time. The
model is below human level, but it annotates from what has been written about
the music, with no audio encoder at all.

:::{figure} img/annotation-emotion-knowledge.png
:label: fig-annotation-emotion
:alt: Left: accuracy against the expert majority vote on four emotion quadrants. GPT-4o with title and composer only 57.0%, GPT-4o with web context 71.0%, three human experts 83.3%, 81.2%, and 86.9%. Right: pairwise Cohen's kappa is 0.561 between humans and 0.558 between GPT-4o and humans.

Text knowledge alone predicts emotion quadrants, and the model's agreement with experts is within the range of agreement between experts. Results from [@yang_emotion_annotation_2025].
:::

### LLMs as coordinators of MIR tools

Chang et al. run key detection, beat
tracking, and source separation, then chord recognition on the full mix and
on stems with drums and vocals removed. The outputs are written as text, and
GPT-4o works through them in a five-stage chain of thought: it chooses among
the candidate chords, then checks them against the bass and the key
[@chang_chord_cot_2025]. MIREX chord accuracy rises by 1.1 to 2.8 points over
the chord recognizer alone on three test sets (for example, from 80.07 to
81.13 on UsPop2002). The LLM never hears the audio here. It reasons over what
the tools measured, which is one answer to the time-aligned limitation
[below](#sec-annotation-limitations).

:::{figure} img/annotation-chord-cot.png
:label: fig-annotation-chord
:alt: Music audio goes through source separation, local key detection, beat tracking, and chord recognition on the full mix, the drum-removed stem, and the drum-and-vocal-removed stem, plus a bass stem. The outputs are written as text and passed to GPT-4o, which runs a five-stage chain-of-thought refinement and returns a refined chord sequence.

The LLM as a coordinator of MIR tools for chord recognition. Figure from [@chang_chord_cot_2025].
:::

### Multi-stage annotation with task-specific LLMs

A captioner that writes a
sentence first forces tags to be extracted from prose afterwards. Music
metadata LLMs reverse the order: an audio-language model reads the audio and
whatever fields exist and fills the missing fields, and a text LLM can then
turn the fields into a caption [@bukey_metadata_2026]. The fields are the
checked intermediate result, and the caption is rendered from them.

The first stage is metadata imputation, and what separates it from tagging
is its input. A tagger reads only the audio and predicts every field from
nothing. An imputation model reads the audio together with a partial
annotation: the fields the catalog already has are written into the prompt,
and the empty ones are marked as missing
({numref}`fig-annotation-metadata`). The existing metadata works as context.
A row that already says *genre: jazz* and *year: 2019* narrows what *mood*
and *instruments* can plausibly be, so the model does not have to recover
from the audio what the catalog already knows. Each kind of field can also
come from the source that carries it. Year and artist are not audible and
come from the row, timbre and tempo are audible and come from the audio, and
a field such as mood uses both.

This matches how catalogs look in practice. Few tracks have no metadata at
all, and few have a complete row. Most have some fields filled by a label, a
distributor, or users, and the set of filled fields differs from track to
track. A model trained with randomly masked fields handles any such
combination with one set of weights, from audio alone to a nearly complete
row. The more fields it is given, the less it has to guess.

:::{figure} img/annotation-metadata-llm.png
:label: fig-annotation-metadata
:width: 95%
:alt: Baseline: a multimodal LLM turns audio into a caption, and an optional text LLM extracts genre, mood, and instrument fields from the caption. Proposed: a multimodal LLM reads the audio and a partly missing metadata row and outputs the full set of fields, and an optional text LLM turns the fields into a caption.

Audio-to-caption-to-tag (baseline) against audio-to-tag-to-caption (proposed). Figure from [@bukey_metadata_2026].
:::

(sec-annotation-evaluation)=
## Evaluation of LLM-powered annotation

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
label from the set, a key name, beat times. In the 2025 results the pattern
follows the capabilities above: parity on captioning, the one task whose
output is open; ten to twenty points behind on categories such as tags,
genre, and instruments; and far behind on measurements such as key and beat.
The comparison is one-sided, though. Each supervised score comes from the
best model built and tuned for that row, while the LLM is one checkpoint
answering every row from an instruction. As with understanding benchmarks, it also has to be checked
that the answers came from the audio rather than from the wording of the
instruction [@weck_muchomusic_2024; @zang_listening_2025].

**CMI-Bench2** widens the same design [@ma_cmibench2_2026]. It covers 17
tasks on 29 datasets and evaluates 23 models, including newer ones such as
Qwen3-Omni, Audio Flamingo 3, Music Flamingo, and Gemini. The added tasks
include structure analysis and music from Greek folk and Arab-Andalusian
traditions. {numref}`fig-annotation-cmibench` shows the best LLM on each task
against the supervised reference.

The gap has closed on several clip-level tasks. Qwen3-Omni reaches 92.8% on
GTZAN genre classification against 83.9% for the supervised reference, and
the best key score on GiantSteps rose from 9.5 in the 2025 results to 63.6,
against 74.3. Multi-label tagging is still ten to seventeen points behind in
ROC-AUC. Sequential tasks remain far behind: the best beat F-measure on GTZAN
is 30.3 against 88.3, and the best melody accuracy on MedleyDB is 7.2 against
72.3. Structure analysis depends on the tolerance. The best boundary
F-measure is 69.6 against 78.4 when a boundary may be off by 3 seconds, but
33.8 against 70.3 at 0.5 seconds. The paper also reports that results are
sensitive to the prompt, that the best scores often come from models trained
on the same datasets, and that models show cultural bias.

:::{figure} ../assets/annotation-cmibench.svg
:label: fig-annotation-cmibench
:alt: Four bar charts comparing the best audio-text LLM with the supervised reference on CMI-Bench2. Captioning: MusicCaps BLEU 31.6 vs 21.7, METEOR 23.8 vs 22.4, ROUGE 33.9 vs 30.8, BERTScore 87.5 vs 87.8; SongDescriber METEOR 23.2 vs 16.7, BERTScore 87.4 vs 86.0. Multi-label tagging ROC-AUC: MagnaTagATune 82.1 vs 92.0; MTG-Jamendo top-50 71.7 vs 84.3, genre 71.0 vs 88.0, mood 65.9 vs 78.6, instrument 64.7 vs 78.8. Clip-level classification: GTZAN genre 92.8 vs 83.9, NSynth instrument 75.2 vs 78.2, GiantSteps key 63.6 vs 74.3, VocalSet technique 42.5 vs 76.9, NSynth pitch 39.8 vs 89.2. Sequential tasks: GTZAN beat 30.3 vs 88.3, Ballroom beat 30.4 vs 96.8, GTZAN downbeat 11.9 vs 54.1, Ballroom downbeat 13.5 vs 94.1, MedleyDB melody 7.2 vs 72.3, Guzheng technique 3.5 vs 90.0, SongForm boundary F-measure 33.8 vs 70.3 at 0.5 seconds and 69.6 vs 78.4 at 3 seconds.

The best audio-text LLM against the supervised reference on CMI-Bench2, with numbers from Table V of [@ma_cmibench2_2026]. The model named above each amber bar is the best on that task among the models the paper evaluates, including the earlier models of CMI-Bench. An asterisk marks a proprietary model scored on a sampled subset. Each task is scored on its own metric, so compare the two bars within a task, not bars across tasks.
:::

### Annotation evaluation with LLMs

Most annotation tasks need no new metric. Because the model follows an
instruction, its answer comes back in the form the task expects, and it is
scored with the metric MIR already uses for that task: ROC-AUC for tagging,
accuracy for genre and instrument classification, a weighted score for key,
and F-measure for beats. These are the metrics of MIREX and `mir_eval`
[@downie_mirex_2008; @raffel2014mir_eval], and using them is what lets
CMI-Bench compare an LLM directly with supervised models.

Captioning is the exception. There is no label to match, and many different
sentences describe #0381 correctly. Three kinds of metric are in use.

**Reference-based.** The caption is compared with one or more human-written
references. BLEU, METEOR, and CIDEr come from machine translation and image
captioning and count the n-grams the caption shares with the reference. They
are cheap and reproducible, but they reward the wording of one particular
sentence, and they correlate poorly with whether the description fits the
music [@lee2024captioningmetricsreflectmusic]. A correct caption phrased
differently from the reference scores low. When the reference was itself
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

Two designs show how such a judge can be built. **CLAIR-A** gives a text LLM
the candidate caption and the reference captions and asks for a score from 0
to 100 with a written reason [@wu_claira_2025]. It still needs references but
no longer depends on shared wording. **MQAScore** removes the references and
checks the audio directly. It splits a caption into atomic concepts, such as
*pop*, *piano*, and *calm*. For each concept $t$ it asks an audio-language
model a yes/no question $q$ about the audio $a$ ("Does this music belong to
the genre pop? Answer Yes or No.") and reads the score from the answer
probabilities:

$$
S(a, t) = \frac{p_\theta(\text{Yes} \mid a, q)}{p_\theta(\text{Yes} \mid a, q) + p_\theta(\text{No} \mid a, q)}
$$

Each concept in the caption gets its own confidence, so a wrong instrument
can be found without rejecting the whole sentence. The cost is one model call
per concept, which is expensive at catalog scale.
:::{figure} img/annotation-claira.png
:label: fig-annotation-claira
:alt: CLAIR-A. Two reference captions and one candidate caption about rain falling on a road are given to an LLM with the prompt: on a scale from 0 to 100, how well does this caption describe the references? The output score is 75.

CLAIR-A: a text LLM scores a candidate caption against the references. Figure from [@wu_claira_2025].
:::

:::{figure} img/annotation-mqascore.png
:label: fig-annotation-mqascore
:alt: MQAScore demo. A prompt describes a tranquil pop piece with piano and violin, a calming effect, and a serene concert atmosphere. Two generated clips are scored concept by concept: pop, violin, serene, calming, piano, concert atmosphere. Each concept has its own score for each clip, and the mean is shown at the bottom.

MQAScore scores each concept in the text separately, so two clips can be compared concept by concept.
:::

% MQAScore: "Fine-Grained Text-Music Alignment Evaluation via Large Audio
% Language Model" (submitted to ICASSP 2027). Add the citation once public.

## Benefits of LLM-powered annotation

Before the limitations, a summary of what the sections above showed.

1. **Open vocabulary.** One model writes tags, structured fields, and full
   captions. A column is not limited to a fixed tag set, and the output stays
   readable.
2. **A unified model.** A new annotation task costs an instruction, not a new
   dataset and a new model.
3. **World knowledge and context.** The model conditions on the metadata that
   exists and on what it knows about artists and eras, so the fields it fills
   are consistent with the rest of the row.

(sec-annotation-limitations)=
## Limitations and opportunities

- **Time-aligned measurements.** On tasks whose answer is a sequence of
  events placed on the waveform, LLMs are still far behind: in CMI-Bench2 the
  best model reaches 30.3 on beat tracking against 88.3 for a supervised
  tracker, and 33.8 against 70.3 on structure boundaries within 0.5 seconds
  [@ma_cmibench2_2026]. Chord recognition is not in the instruction
  benchmarks at all. The
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
- **Most LLM capabilities are still unused.** Most work stops at one model
  that answers many instructions. Chain-of-thought reasoning, in-context
  learning, and agentic pipelines have only begun to reach annotation, as the
  examples [above](#sec-annotation-capabilities) show. *Challenge:* decide
  which capability each kind of field needs.
- **Audio is not the only input.** Today's annotators mostly read audio,
  sometimes with lyrics or metadata. *Challenge:* decode from audio, MIDI or
  a transcription, lyrics, and metadata together, so that each field is
  written from the input that carries it.
- **Evaluating the database, not the answer.** Every benchmark above scores
  one answer to one question. What a listening system needs is a database
  that is complete, consistent across columns, and useful downstream, and no
  benchmark measures that yet. *Challenge:* score annotation by what it does
  for search/retrieval and recommendation, the subject of the next pages.

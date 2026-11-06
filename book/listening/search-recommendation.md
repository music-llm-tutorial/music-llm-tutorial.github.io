---
title: Search and Recommendation
authors:
  - name: Seungheon Doh
---

# LLM-powered Music Search and Recommendation

Track #0381 now has a full row: *jazz*, *2019*, *72 bpm*, *D♭ major*,
*vocals: none*, *mood: nocturnal*, *instruments: piano trio*, and a caption
that says all of it in one sentence. User 1024 is still waiting for something
for a late-night drive in the rain, with no vocals and nothing too old.
Whether #0381 reaches her depends on two readings: of the request against the
row, and of her (favorites Bill Evans and Nils Frahm, ten recent plays, one
skip) against what the system knows about who listens to what. The
introduction argued that once both are language, search and recommendation
become one problem, *(user, query) → music*. This page asks where in that
computation the LLM sits. It can be the **recommender** itself, a
**reranker** over what a retriever found, or an **agent** that calls tools
and keeps the conversation going. Each placement reads the request and the
user differently, costs something different, and is measured, so far, by a
benchmark that misses something.

## What a request contains

Natural-language music requests mix several kinds of information at once. A
study of real music-seeking questions found bibliographic details, lyrics,
genre, mood, and intended use side by side in the same request
[@lee2010analysis]. For user 1024 we collapse these into four kinds
({numref}`fig-search-request`). The **situation**, "a late-night drive in the
rain," implies a sound without naming one. The **constraints**, "no vocals"
and "not too old," are facts the row holds. The **taste**, Bill Evans and Nils
Frahm, is why the situation means sparse piano for this listener and dim
synths for someone else. The **behavior**, her plays and skips and behind them
the logs of everyone else, records who listened to what.

Each earlier system read one of these. Tag retrieval read a constraint if it
happened to be a tag, such as *instrumental*, and nothing else
[@turnbull2008semantic; @won2021multimodal]. Joint audio-text embeddings read
any phrase, including, loosely, the situation
[@huang2022mulan; @manco2022contrastive; @wu2023large], and enriching their
text side with metadata and LLM-written descriptions let them read an artist
or a year as well [@doh2023toward; @doh_ttmrpp_2024]. None of them handled
"no": contrastive embeddings tend to retrieve what is named rather than what
is excluded, so "no vocals" pulls the query toward vocals. Collaborative
filtering read behavior, and through it taste, without reading the music at
all [@hu2008collaborative; @koren2009matrix]; it fails on a new track and
cannot say why it chose one [@vandenoord_content_2013].

:::{figure} ../assets/search-request.svg
:label: fig-search-request
:alt: Top: user 1024's query, "Something for a late-night drive in the rain, no vocals, and not too old", and profile (female, aged 25 to 34, favorites Bill Evans and Nils Frahm, 10 recent plays and 1 skip). Below, a matrix of four kinds of information against four systems. Situation: tag retrieval does not read it, a joint audio-text embedding reads it loosely, collaborative filtering does not, conversational recommendation with an LLM does. Constraints: tags read them partly, the embedding and collaborative filtering do not, conversational recommendation does. Taste: collaborative filtering reads it partly, conversational recommendation reads it. Behavior: collaborative filtering reads it; conversational recommendation reads it partly, since it can read this listener's history as text but not the logs of millions of others.

What a request contains, and who could read it. Each earlier system read one kind of information; conversational recommendation with an LLM reads the first three directly, and the fourth only for the listener in front of it.
:::

An LLM reads the first three directly, in the words the listener used. The
fourth it reads only in part. It can read user 1024's ten plays written out
as a list, but not the co-plays of millions of other listeners that make
collaborative filtering work. That asymmetry runs through the rest of this
page: the LLM is good at reading this request and this listener, and needs
something else for what everyone else did. The question is where to put it.

## The LLM as recommender

The most direct design makes the model produce the recommendation itself.
The profile, the history, and the request are written into the context, and
the model continues the sequence with tracks
({numref}`fig-search-recommender`). Prompting an off-the-shelf LLM this way
already works surprisingly well on conversational recommendation benchmarks,
and it fails in two characteristic ways: the model names items that do not
exist, and it favors popular ones [@he_zeroshot_crs_2023]. Both follow from
the model knowing the catalog only through text it has read.

The remedy is to make the catalog part of the vocabulary. In general
recommendation this began with item IDs the model learns to generate
[@rajput_tiger_2023]. In music, **Text2Tracks** generates track IDs directly
from a prompt [@palumbo_text2tracks_2025], and **TalkPlay** builds each track
token from audio, lyrics, metadata, and collaborative-filtering embeddings, so
one model continues a listening history and a conversation in the same stream
[@doh_talkplay_2025]. **MuseChat** applies the idea to recommending music for
a video [@dong_musechat_2024]. The dialogues these models train on were
themselves written by LLMs, from real listening sessions and intent analyses
[@leszczynski2023talk; @doh2024music; @doh_talkplaydata2_2025].

:::{figure} ../assets/search-recommender.svg
:label: fig-search-recommender
:alt: Top, generative recommendation as sequence modeling, p(next tracks given user, history, request). The context is given: the user token for user 1024, three track tokens from her history (0112, 0927, and 0458, which she skipped), and the request "late-night drive in the rain, no vocals, not too old". The model generates track tokens 0381 and 0644 and a response, "Slow piano after 2015, like your Nils Frahm." Bottom left: audio, lyrics, metadata, and a collaborative-filtering embedding are combined into one token for track 0381. Bottom right: every track the model can name is a token learned in training, and a track released today is not a token until the model is retrained.

The LLM as recommender. History, request, and tracks share one sequence, and each track is a token built from several signals. The catalog is the model's vocabulary.
:::

What this design buys is one model that reads the conversation and the
collaborative signal together, with no retrieval stage to tune. What it costs
follows from where the catalog lives. A new release is not a token until the
model is retrained, and the context window bounds how much history the model
can read. The row from the previous page is not consulted at query time
either: the recommender answers from what it absorbed in training, so if the
*mood* of #0381 was corrected yesterday, it does not know.

## The LLM as reranker

The second design keeps retrieval as it was and puts the LLM on both sides of
it ({numref}`fig-search-reranker`). Before the retriever, the LLM rewrites the
request into what each tool reads well. "A late-night drive in the rain, no
vocals, not too old" becomes the query "slow, sparse piano, nocturnal" for
the text-to-music retriever and `vocals = none, year >= 2015` for a filter
over the record. The profile shapes the rewrite: Bill Evans and Nils Frahm
are why the query says piano and not synths. Here the record pays off. Once
*vocals* is a field, "no vocals" stops being a fuzzy retrieval problem and
becomes an exact filter, and the negation that embeddings could not handle is
handled by the row instead.

After the retriever, the LLM reads the candidates' rows and orders them
against the whole request and the listener. The two components read
differently. The retriever reads the audio, and may rank a lo-fi track with a
Rhodes and a drum machine highest, because it sounds like late night. The LLM
reads the rows and the profile, and moves the piano trio and the solo piano
above it. Putting LLM-written descriptions into the retriever's text side at
indexing time was an earlier way to get the same knowledge into the score
[@doh_ttmrpp_2024]. Rewriting at query time and reranking afterwards is the
more flexible way, the retrieval-augmented pattern of Chapter 1
[@lewis_rag_2020], because nothing has to be reindexed when the model
improves.

:::{figure} ../assets/search-reranker.svg
:label: fig-search-reranker
:alt: Top row: user 1024's request goes to an LLM that rewrites it into a text query, "slow, sparse piano, nocturnal", and a filter, vocals = none and year at least 2015. These go to a text-to-music retriever, which scores audio, and a metadata filter over the record. Middle: five candidates with their records and retriever scores. Lo-fi track 0207 (2021, no vocals, chill, Rhodes and drum machine) scores 0.82; dream-pop track 0930 (2022, vocals) scores 0.80 and is removed by the filter; jazz track 0381 (2019, no vocals, nocturnal, piano trio) scores 0.79; jazz track 0112 (1959) scores 0.77 and is removed by the year filter; ambient track 0644 (2017, no vocals, calm, solo piano) scores 0.74. The LLM reranks the survivors by reading their rows and the profile: 0381 first, 0644 second, 0207 third. Bottom: the answer with its reason, and a note that the LLM never hears the audio.

The LLM as reranker. The LLM rewrites the request into a query and a filter, the retriever scores the audio, and the LLM reorders what survives by reading each row against the request and the profile.
:::

The reranker's reason is what it read. A collaborative recommender's "because
you listened to X" is attached after the fact; a reranker that placed #0381
first because its row says *2019, piano trio, no vocals* can say so. Whether
it actually does, rather than inventing a plausible reason afterwards, is a
question for the evaluation section below.

Note where the audio is in this design. The LLM never hears it. It reads the
retriever's scores and the rows, and two tracks with the same row are the
same track to it. If the row is thin, the reranker is ordering by names and
years. The quality of search is bounded by the quality of annotation, which
is why the previous page came first.

## Agentic music recommendation

The third design gives the LLM the retriever, the filter, the collaborative
model, and the records as tools, and lets it decide which to call, in what
order, and when to stop ({numref}`fig-search-agent`). It is the agent pattern
of Chapter 1 [@yao_react_2023; @schick_toolformer_2023] applied to listening.
In music it was introduced with **TalkPlay-Tools**, which moved
recommendation from generating track tokens to calling a catalog and MIR
models inside the conversation [@doh_talkplaytools_2025].

The agent contains the reranker: planning is the rewrite above, and the final
ordering is the reranking above. It adds two things. The first is the
collaborative model, back as a tool, which closes the asymmetry from the start
of this page: the LLM reads the request and the listener, and the tool
supplies what millions of others played. The second is the loop. The limits
of single-turn retrieval were clear before LLMs could address them: context
lost between queries, no way to learn from feedback, no "like this but more
upbeat." The Conversational Playlist Curation Dataset collected 917 human
dialogues and showed what multi-turn curation looks like
[@chaganty2023beyond]. An agent keeps the conversation as context, so "more
upbeat" revises the plan, raising the tempo while keeping `vocals = none` and
`year >= 2015`, instead of starting a new search, and a skip is evidence
rather than noise.

:::{figure} ../assets/search-agent.svg
:label: fig-search-agent
:alt: User 1024's request, then "more upbeat" and a skip of track 3, enter an LLM. The LLM plans: the situation and taste become a text query ("slow, sparse piano"), the facts become a filter (vocals = none, year at least 2015), and the rest stays as context. It keeps a listener state: her profile (Bill Evans, Nils Frahm), what she stated (no vocals, then upbeat), and her history (10 plays, 1 skip). It calls four tools over the music database: a text-to-music retriever, a metadata filter over the record, a collaborative-filtering model over listening logs, and the records of candidates. It reranks the candidates by reading their records and returns a ranked list with a reason ("#0381: 2019, piano trio, no vocals"). The listener replies, and the loop continues.

Agentic music recommendation. Search runs this loop once from a request; recommendation runs the same loop with a listener state and listening logs added.
:::

The agent is also where the **listener state** lives. Over a conversation it
accumulates what the listener said, what they skipped, and what it inferred.
Scrutable user models have been proposed before, as short editable statements
of taste [@balog_scrutable_2019]; what is new is that the state is written in
free text, by the same component that uses it, and can be carried into the
next session if the system is built to keep it
[@zhang_agent_memory_survey_2024]. And because the catalog stays outside the
model, a new release is available the moment it has a row.

The three designs differ less in what the LLM can read than in where the
catalog lives.

| | Recommender | Reranker | Agent |
|---|---|---|---|
| Where the catalog lives | in the model, as tokens | in an index the retriever searches | in tools the LLM calls |
| What the LLM reads | request, profile, history | request, profile, candidates' rows | all of that, over many turns |
| Who listened to what | learned into the track tokens | in the retriever, if it is collaborative | a tool it can call |
| A new release | needs retraining | needs a row and an index entry | needs a row |
| "More upbeat" | a new prompt | a new search | a revision of the plan |

We expect the agent design to be the shape production systems converge on,
because it is the only one that keeps both the record and the collaborative
signal outside the model, where each can be updated on its own schedule. That
is a prediction, not yet a survey result.

## Evaluation

Each role is evaluated the way its predecessors were, and each inherits the
blind spot.

| Role | Judged by | What it misses |
|---|---|---|
| Recommender | held-out next-track prediction on listening logs | the conversation: ignoring "no vocals tonight" and still hitting the held-out track scores full marks |
| Reranker | retrieval metrics with captions as queries [@manco2023song] | situations, constraints, and taste; whether the reason matches the evidence |
| Agent | a listener who responds over several turns | offline logs cannot respond; simulated listeners inherit their model's habits |

Captions describe a sound. Real requests describe a situation, a constraint,
and a taste, and no widely used benchmark scores relevance and constraint
satisfaction at once. For agents, human-collected dialogues exist but are
small [@chaganty2023beyond], and the current answer is an LLM that plays the
listener over several turns [@wang_crs_simulator_2023]. A system trained on
LLM-written dialogues [@doh_talkplaydata2_2025] and evaluated by an
LLM-played listener can look better than it is. Our own view is that
synthetic dialogues are for training and the human-collected ones should be
kept for evaluation.

What a listening evaluation should score, for all three roles, is shown in
{numref}`fig-search-evaluation`: whether every track in the list satisfies
the stated constraints, whether a revision ("more upbeat") is handled as a
revision that keeps the earlier constraints, and whether every field the
reason cites is one the ranker actually read. None of these needs the
held-out track, and all of them can be checked against the record.

:::{figure} ../assets/search-evaluation.svg
:label: fig-search-evaluation
:alt: Left, what benchmarks score. Held-out next track: the logs say user 1024 played track 0517 next; the metric asks whether 0517 is in the list (hit at 10). Caption as query: "A slow piano trio, brushed drums" is the query; the metric asks whether the captioned track is retrieved (recall at 10). Neither looks at the request, the revision, or the reason. Right, what a listening evaluation should score, over two turns. Turn 1: the request returns 0381, 0644, and 0207; check 1, every track has no vocals and a year of 2015 or later. Turn 2: "more upbeat" returns 0702 and 0815; check 2, tempo goes up from 72 to 118 bpm while vocals and year stay fixed. The reason, "#0702: 2021, piano and drums, no vocals, 118 bpm"; check 3, every field the reason cites is one the ranker read.

What benchmarks score and what a listening evaluation should score. The three checks on the right are read off the record and the conversation; none of them needs the held-out track.
:::

With this page's systems, user 1024 gets a ranked list that respects "no
vocals" and "not too old," a reason for each track, and a way to say "more
upbeat" and be heard. What they cannot do yet is the subject of
[the next page](limitations.md).

---
title: "Search & Recommendation"
authors:
  - name: Seungheon Doh
---

# LLM-powered Music Search and Recommendation

Track #0381 now has a full row: *jazz*, *2019*, *72 bpm*, *D♭ major*,
*vocals: none*, *mood: nocturnal*, *instruments: piano trio*, and a caption
that says all of it in one sentence. The listener is still waiting for something
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

:::{figure} img/search-three-designs.png
:label: fig-search-designs
:alt: Three designs side by side over a shared music database and user database. LLM-as-a-recommender: the user and the query go into an LLM whose parameters predict music items. LLM-as-a-reranker: the user, the query, and retrieved music go into an LLM that reorders the retrieved list. Agentic music recommendation: an LLM plans, orchestrates, and calls tools such as a recommender system, BM25, and SQL, and returns retrieved and reranked music.

Three places for the LLM: recommender, reranker, and agent.
:::

## Goal of search and recommendation

The goal of search and recommendation is to find, in a catalog of millions of
tracks, the music this listener wants to hear right now. Every returned track
should satisfy the request and fit the listener's taste.

## LLM-powered search and recommendation

LLMs add three things toward that goal, each from a capability introduced in
Chapter 1.

1. **Unified search and recommendation.** Natural-language understanding and
   long context let one model read who the listener is (profile, recent
   history) and what they want now (the query) in a single prompt.
2. **Interpretable responses.** Natural-language generation lets the model
   describe the music it recommends and say why it was chosen, from the
   listener's preference to musical attributes to the track. Each explanation
   can be grounded in metadata and audio analysis.
3. **Multi-turn refinement.** A listener rarely knows the full request up
   front. Conversation, instruction following, and long context let the model
   ask a clarifying question, turn a critique ("no vocals", "more upbeat")
   into a constraint, and keep the whole session in view.

TalkPlayData 2 shows all three in one dialogue [@doh_talkplaydata2_2025]. A
listener with a written profile asks for an electronic band with a
"powerful, almost anthemic sound." The system recommends a track, explains
the choice using the profile and the track's attributes, and adjusts when the
listener answers.

:::{figure} ../assets/search-talkplaydata2.svg
:label: fig-search-talkplaydata2
:alt: A dialogue from TalkPlayData 2 with three callouts. The listener profile (twenties, Argentina, prefers gothic and industrial music) and the first user turn, asking for an electronic band with a powerful, almost anthemic sound, are marked as unified search and recommendation. The assistant's track, Perpetual by VNV Nation, and its response explaining the choice are marked as interpretable response. The user's follow-up, asking for earlier tracks with an epic, introspective feel, is marked as multi-turn refinement.

One dialogue from TalkPlayData 2, with the three additions marked. Dialogue from [@doh_talkplaydata2_2025].
:::

## What a request contains

Natural-language music requests mix several kinds of information at once. A
study of real music-seeking questions found bibliographic details, lyrics,
genre, mood, and intended use side by side in the same request
[@lee2010analysis]. For our listener we collapse these into four kinds.
The **situation**, "a late-night drive in the
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

An LLM reads the first three directly, in the words the listener used. The
fourth it reads only in part. It can read this listener's history written out
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

### Representing music as tokens

An LLM predicts the next token, so recommending a track means writing it as
tokens. There are three ways to do that.

:::{figure} img/search-item-representations.png
:label: fig-search-item-tokens
:alt: Three ways to represent the track Says by Nils Frahm, 2013. As a single token: one new token, item42, per track. As natural language: the title and artist split into sub-word tokens. As a semantic ID: a music encoder and a quantizer produce a short sequence of discrete codes from a residual quantizer.

A track as a single token, as natural language, and as a semantic ID.
:::

| | Single token | Natural language | Semantic ID |
|---|---|---|---|
| A track is | one new token (`<item42>`) | its title and artist as words | a short code of shared sub-tokens |
| Vocabulary added | one token per track | none | a few codebooks |
| Similar tracks | unrelated tokens | related only if the names are | share a prefix |
| Main problem | catalog is too large | names that do not exist; popularity bias | needs training on the catalog |

**Natural language** is what zero-shot prompting uses: the history is a list
of titles, and the model writes more titles
[@he_zeroshot_crs_2023; @wang_nir_2023; @dai_chatgpt_recsys_2023]. It needs
no training and draws on what the model has read about music, with the two
failures noted above.

:::{figure} img/search-zeroshot-crs.png
:label: fig-search-zeroshot
:alt: Zero-shot conversational recommendation by prompting. Left: a conversation in which a user asks for movie recommendations over several turns, with the last system turn left blank. Middle: a prompt made of a task description, a format instruction, and the conversation. Right: the LLM writes a list of titles, which a processing step maps to item IDs in the catalog.

Items as natural language. The conversation is placed in a prompt, the LLM writes titles, and a post-processing step maps the titles to catalog items. The example is from movie recommendation. Figure from [@he_zeroshot_crs_2023].
:::

A **single token** per track fails on size. The vocabulary of an LLM is two
to three orders of magnitude smaller than a streaming catalog.

| | Size |
|---|---|
| Llama 3 vocabulary | about 128,000 tokens |
| GPT-5 vocabulary | about 200,000 tokens |
| Gemma 2 vocabulary | about 256,000 tokens |
| Spotify catalog | more than 100 million tracks |

**Semantic IDs** are the usual answer
[@tay_dsi_2022; @rajput_tiger_2023]. An encoder embeds each track, and a
residual quantizer turns the embedding into a few discrete codes. A few
thousand code tokens can name millions of tracks, and similar tracks get
similar codes.

### Semantic IDs and generative retrieval

Generating an ID is called generative retrieval, and it differs from
similarity-based retrieval in where the cost lies. A similarity-based system
embeds the query and every track and takes a dot product, so its cost grows
with the catalog. A generative system predicts the next token, so its cost
grows with the size of the model.

:::{figure} img/search-generative-retrieval.png
:label: fig-search-generative
:alt: Left, similarity-based retrieval: a query encoder and an item encoder embed the chat and every item in the pool, and the item with the highest similarity is returned; cost grows with the database. Right, generative retrieval: a large language model with an expanded vocabulary reads the multi-turn dialogue and generates the tokens of the music item, which are then looked up in the item pool; cost grows with the number of parameters.

Similarity-based retrieval against generative retrieval.
:::

In music, Text2Tracks compares the ID choices directly. With semantic IDs
built from collaborative-filtering embeddings it reaches a Hits@10 of 0.270
on prompt-based recommendation, against 0.101 for BM25 and 0.119 for a
fine-tuned bi-encoder, and above IDs built from artist and track names
[@palumbo_text2tracks_2025].

:::{figure} img/search-text2tracks.png
:label: fig-search-text2tracks
:width: 55%
:alt: Bar chart of Hits at 10 for prompt-based music recommendation: BM25 0.101, zero-shot bi-encoder 0.065, fine-tuned bi-encoder 0.119, Text2Tracks 0.270.

Generating semantic IDs against sparse and dense retrieval on prompt-based recommendation. Figure from [@palumbo_text2tracks_2025].
:::

### Multimodal semantic IDs

A track has more than one description, and later work makes the ID
**multimodal**. TalkPlay quantizes playlist,
tag, metadata, lyrics, and audio embeddings separately and writes a track as
one code per modality. It reaches an MRR of 0.049 on conversational
recommendation, against 0.032 for the best fine-tuned embedding retriever and
0.008 for TIGER [@doh_talkplay_2025]. FusID argues
that one tokenizer per modality repeats information and misses how modalities
interact. It fuses the modality embeddings first and then applies product
quantization, improving on TalkPlay's tokens by about six percent on MRR and
recall [@kim_fusid_2026].

:::{figure} img/search-talkplay-tokenizer.png
:label: fig-search-talkplay-tokens
:alt: TalkPlay's music tokenizer. Playlist, tag, metadata, lyrics, and audio encoders each embed a track. A vector quantizer assigns each embedding a codebook index, and each index is mapped to a token such as playlist-13, tag-9, metadata-11, lyrics-143, and audio-94.

Multimodal semantic IDs with one code per modality. Figure from [@doh_talkplay_2025].
:::

To generate these codes, the LLM's vocabulary is extended. Each code becomes
a new token with its own row in the embedding table and in the output layer,
next to the text tokens. The model is then trained with next-token prediction
on conversations in which a recommended track is written as its codes, so a
reply can mix words and tracks in one sequence. At inference the generated
codes are mapped back to codebook vectors and matched against the quantized
embeddings of the catalog, which returns a ranked list of tracks.

:::{figure} img/search-talkplay-vocab.png
:label: fig-search-talkplay-vocab
:alt: Left: a text-only LLM with tokenization, a text embedding table, transformer layers with causal attention, and a text LM head; the conversation "I'm looking for some hiphop music" and "I recommend Money and the Power" is a sequence of text token IDs. Right: the same model with a music embedding table and a music LM head added; the track is written after the text as five new token IDs for playlist, tag, metadata, lyrics, and audio codes.

Extending the vocabulary of an LLM with music tokens. The new embeddings are initialized from the distribution of the existing ones. Figure from [@doh_talkplay_2025].
:::

:::{figure} img/search-talkplay-retrieval.png
:label: fig-search-talkplay-retrieval
:alt: Left: training with next-token prediction on a conversation in which the recommended track is written as music tokens between the user and assistant turns. Right: retrieval with generated music tokens. The generated playlist, tag, metadata, lyrics, and audio tokens are mapped to codebook vectors and used as a query; tracks in the music database are embedded and quantized into a reference set; music retrieval returns a ranked list of tracks.

Training with next-token prediction, and retrieval from the generated music tokens. Figure from [@doh_talkplay_2025].
:::

Lee et al. apply the same idea to a production-scale catalog of about 1.6
million tracks [@lee_3mtoken_2026]. They group track data into nine
modalities: artist roles, title and artist name, genre and mood tags, audio,
tempo and key, release date, song facts, artist biography, and co-listening.
Each modality gets its own residual quantizer (RQ-VAE), so a track is written
as a few codes per modality, with coarse information in the first code and
finer detail in the later ones. A small LLM, Qwen2.5-1.5B-Instruct, is
fine-tuned to generate these codes from a text request, and a separate model
predicts how much each modality matters for the request, so "90s rock" leans
on release date and genre. On retrieving tracks from the same curated
playlist, the multimodal ID reaches a Hit@5 of 0.284, against 0.099 for the
best single modality (co-listening), and 0.513 against 0.307 at Hit@50.

:::{figure} img/search-3mtoken-results.png
:label: fig-search-3mtoken
:width: 85%
:alt: Hit at k for multimodal against unimodal semantic IDs on two content-based retrieval sets. Curated playlists: 0.284 vs 0.099 at Hit@5, 0.352 vs 0.151 at Hit@10, 0.418 vs 0.216 at Hit@20, 0.513 vs 0.307 at Hit@50. Co-occurrence pairs: 0.300 vs 0.165, 0.375 vs 0.239, 0.433 vs 0.322, 0.510 vs 0.426.

Multimodal against the best unimodal semantic ID on content-based retrieval, for curated playlists and co-occurrence pairs. Numbers from [@lee_3mtoken_2026].
:::

:::{figure} img/search-fusid.png
:label: fig-search-fusid
:width: 75%
:alt: FusID. Playlist, tag, metadata, lyrics, and audio embeddings are concatenated and passed through an MLP block to give one modality-fused embedding. Product quantization splits it into parts and quantizes each part, giving the fused semantic ID.

Modality-fused semantic IDs: fuse first, then quantize. Figure from [@kim_fusid_2026].
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
it. Before the retriever, the LLM rewrites the
request into what each tool reads well. "A late-night drive in the rain, no
vocals, not too old" becomes the query "slow, sparse piano, nocturnal" for
the text-to-music retriever and `vocals = none, year >= 2015` for a filter
over the record. Her listening history shapes the rewrite: Bill Evans and
Nils Frahm are why the query says piano and not synths. The filter also
solves the negation problem. Once *vocals* is a field in the record, "no
vocals" is an exact filter, and the embedding no longer has to handle it.

After the retriever, the LLM reads the candidates' rows and orders them
against the whole request and the listener. The two components read
differently. The retriever reads the audio, and may rank a lo-fi track with a
Rhodes and a drum machine highest, because it sounds like late night. The LLM
reads the rows and her listening history, and moves the piano trio and the
solo piano above it. Putting LLM-written descriptions into the retriever's text side at
indexing time was an earlier way to get the same knowledge into the score
[@doh_ttmrpp_2024]. Rewriting at query time and reranking afterwards is the
more flexible way, the retrieval-augmented pattern of Chapter 1
[@lewis_rag_2020], because nothing has to be reindexed when the model
improves.

The reranker can also give a reason. A collaborative recommender's "because
you listened to X" is attached after the fact. A reranker that placed a track
first because its row says *2019, piano trio, no vocals* can say so in its
answer.

In this basic design the LLM does not hear the audio. It reads the
retriever's scores and the rows, and two tracks with the same row are the
same track to it. If the row is thin, the reranker is ordering by names and
years, so the quality of reranking depends on the quality of annotation.

The result also depends on the prompt. Hou et al. show that an LLM can rank
retrieved candidates zero-shot, and that the order of the history and of the
candidates in the prompt changes the result [@hou_llmrank_2024].

### The LLM as a multimodal reranker

MusiCRS asks whether a reranker should also listen [@surana_musicrs_2025]. It
collects Reddit music requests with linked audio and gives an audio-language
reranker (Qwen2.5-Omni) the audio, the text query, or both. With both, its
Recall@20 is 21.9%, against 19.3% with audio alone and 18.2% with the query
alone. A CLAP joint embedding reaches 22.7% from the query alone, however. So
listening helps the LLM reranker, but it does not yet beat a retriever
trained for the task.

:::{figure} img/search-musicrs.png
:label: fig-search-musicrs
:width: 80%
:alt: Recall at 20 and nDCG at 20 on MusiCRS for audio-only, query-only, and combined input. Recall at 20: CLAP joint embedding 21.15, 22.71, 22.43; Qwen2.5-Omni-7B reranker 19.26, 18.24, 21.93. nDCG at 20: CLAP 14.90, 15.90, 15.82; reranker 13.48, 13.96, 16.21.

A joint embedding and an audio-language LLM reranker with audio, query, or both as input. Results from [@surana_musicrs_2025].
:::

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

TalkPlay-Tools gives the agent one tool for each way of reading the catalog
[@doh_talkplaytools_2025].

| Retrieval | Tool | What it matches | Example query |
|---|---|---|---|
| Boolean | SQL | numeric and categorical fields | "Recent songs over 130 BPM" |
| Sparse | BM25 | words in titles, artists, and lyrics | "Songs from Adele's 21" |
| Dense | text-to-item | meaning of a description | "Play a calm piano piece" |
| Dense | item-to-item | sound and style of a given track | "Ok, more similar voices" |
| Dense | user-to-item | this listener's history | a user ID |
| Generative | semantic ID | several modalities at once | a track code |

:::{figure} img/search-talkplay-tools.png
:label: fig-search-talkplay-tools
:alt: A music recommendation agent with tool calling. The user sends a message to the LLM. The LLM plans and selects among tools: SQL, BM25, text-to-item, item-to-item, user-to-item, and semantic ID. An executor runs them in an environment with a SQL server, BM25, CLAP, Qwen3 embeddings, SigLIP2, BPR, and RVQ over the music and user databases. Retrieval returns the top k, reranking narrows them, and the results go back to the LLM, which reasons and responds.

The TalkPlay-Tools agent: plan, run tools, retrieve, rerank, respond. Figure from [@doh_talkplaytools_2025].
:::

The LLM plans which tools to call, an executor runs them against the music
and user databases, and the LLM reranks the results and writes the response.
{numref}`fig-search-talkplay-trace` shows one turn. The listener asks for
another track by an artist she has been playing. The model first reasons
about the request and her history, then decides to call BM25 over artist
names for retrieval and user-to-item similarity for reranking, and returns
the top track.

:::{figure} img/search-talkplay-tools-trace.png
:label: fig-search-talkplay-trace
:width: 85%
:alt: One turn of the TalkPlay-Tools agent in three steps. Step 1, chain-of-thought: the model notes that the user asked for another track by "Weird Al" Yankovic, that the listening history already contains several of his tracks, and that BM25 over the artist corpus fits retrieval while user-to-item similarity fits reranking. Step 2, tool calls: a BM25 call with the query "weird al yankovic" on the artist corpus with top-k 20, and a user-to-item similarity call with the user ID and top-k 20. Step 3, the recommended track with its tags and a playable preview.

One turn of a tool-calling recommender: (01) reasoning about the request and the listening history, (02) tool calls, (03) the recommended track. Figure adapted from [@doh_talkplaytools_2025].
:::

An agent does not have to call tools for everything. WeMusic-Agent first
trains music knowledge into the model, and then trains it to recognize the
boundary of that knowledge: it answers from memory when it can and calls a
search tool when the request is outside what it knows, such as a recent
release [@bi_wemusic_2025]. Fewer tool calls make the agent faster and
cheaper.

:::{figure} img/search-wemusic-agent.png
:label: fig-search-wemusic
:alt: The WeMusic-Agent training framework in three stages. Stage 1 trains two specialized models, an internalized music model and a cold-start agentic model with a tool environment. Stage 2 samples trajectories: positive samples from both, and negative samples from the internalized model replaced by tool trajectories. Stage 3 learns the agentic boundary with curriculum-guided supervised fine-tuning and controllable reinforcement learning.

Agentic boundary learning: when to answer from internal knowledge and when to call a tool. Figure from [@bi_wemusic_2025].
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

## Datasets for conversational recommendation

Training or testing any of these systems needs conversations: a request in a
listener's own words, the tracks that were accepted, and what the listener
said next. Listening logs have none of this, so the conversations have to be
collected from people or written by a model. The datasets fall into those two
groups.

| Dataset | Who wrote the requests | Conversations | Turns | Tracks |
|---|---|---|---|---|
| CPCD [@chaganty2023beyond] | people: 110 users paired with 10 expert curators | 917 | 5.8 | 106,736 |
| MusiCRS [@surana_musicrs_2025] | people: Reddit threads from seven music subreddits | 477 | 1 | 3,589 entities |
| TtWMusic [@leszczynski2023talk] | a language model, over random walks through expert playlists | over 1M | 5.6 | — |
| LP-MusicDialog [@doh2024music] | an LLM, over attribute sequences from the Million Song Dataset | 288K | 5.0 | 319K |
| TalkPlayData 1 [@doh_talkplay_2025] | an LLM, over playlists | 532K | 7.0 | 406K |
| TalkPlayData 2 [@doh_talkplaydata2_2025] | LLM agents, over listening sessions from LFM-2b | 16.2K | 8 | 47K |
| Spotify [@palumbo_bootstrapping_2026] | an LLM, from real single-turn requests, talking to the live agent | not released | 2 or more | production catalog |

**Conversations from people.** The Conversational Playlist Curation Dataset
(CPCD) paired a user with a human curator who had a music search tool. The
user listened to the playlist, rated tracks, and said how to improve it, which
gives 24.5 ratings per conversation [@chaganty2023beyond]. MusiCRS takes
requests people posted without being asked. It keeps 477 Reddit threads from
r/classicalmusic, r/hiphopheads, r/electronicmusic, r/metal, r/popheads,
r/indieheads, and r/jazz, takes the music named in the replies as the answer,
ranked by upvotes, and attaches audio through YouTube links
[@surana_musicrs_2025]. Each thread has about 8 answers and is tested against
100 candidates. These requests are the closest to how listeners actually ask,
but a thread is one request and its replies. Nobody says "more upbeat" in the
next turn, and upvotes favor what the subreddit already likes.

**Conversations from a model.** Synthetic datasets start from music that
already belongs together, such as a playlist or a listening session, and have
a model write the conversation that would lead to it. TalkTheWalk walks
through an embedding space of expert playlists and has a language model fill
in the user's turns [@leszczynski2023talk]. LP-MusicDialog and TalkPlayData 1
have an LLM write both sides
[@doh2024music; @doh_talkplay_2025]. TalkPlayData 2 separates the roles into
four LLMs: one writes a listener profile, one sets a conversation goal, one
plays the listener, and one plays the recommender. The recommender is not
shown the goal and has to find it through the conversation, and the listener
hears the audio of each recommended track before replying
[@doh_talkplaydata2_2025]. Its test split is chronological, with cold-start
users and tracks held out.

Spotify used the same idea before launching a conversational agent, when no
multi-turn traffic existed yet [@palumbo_bootstrapping_2026]. The seeds are
real single-turn requests from product traffic, with synthetic ones added for
uses the product did not support yet. An LLM turns each seed into a dialog
plan that tests one of five abilities: refining the content, retaining an
instruction, resolving a reference such as "the third artist," following a
shift of intent, and accepting a task split over two turns. A second LLM then
plays the user against the live agent and adapts the plan to what the agent
actually returns. Annotators judged 93% of the conversations realistic. The
data is used to test the agent and improve its prompt, not to train it, and it
showed that the agent holds up to four turns and degrades from the fifth.

The trade is size for origin. The datasets written by people have hundreds of
conversations, and the ones written by models have up to a million, with every
request in a model's phrasing.

## Evaluation of conversational recommendation

Each role is evaluated the way its predecessors were, and each inherits the
blind spot.

| Role | Judged by | What it misses |
|---|---|---|
| Recommender | held-out next-track prediction on listening logs | the conversation: ignoring "no vocals tonight" and still hitting the held-out track scores full marks |
| Reranker | retrieval metrics with captions as queries [@manco2023song] | situations, constraints, and taste; whether the reason matches the evidence |
| Agent | a listener who responds over several turns | offline logs cannot respond; simulated listeners inherit their model's habits |

Captions describe a sound. Real requests describe a situation, a constraint,
and a taste, and caption-based retrieval benchmarks do not test those. For agents, human-collected dialogues exist but are
small [@chaganty2023beyond], and the current answer is an LLM that plays the
listener over several turns [@wang_crs_simulator_2023]. A system trained on
LLM-written dialogues [@doh_talkplaydata2_2025] and evaluated by an
LLM-played listener can look better than it is. Our own view is that
synthetic dialogues are for training and the human-collected ones should be
kept for evaluation.

The RecSys Challenge 2026 is the largest shared evaluation of conversational
music recommendation so far [@doh_recsyschallenge_2026]. A system receives a
user profile and the chat so far, and returns a ranked list of tracks and a
response. The two outputs are scored separately. The list is scored by
nDCG@20 against the track the listener accepted, with catalog diversity (the
share of the catalog a system ever recommends) as a second measure. The
response is scored by lexical diversity and by an LLM judge that rates
personalization and explanation quality on a blind test set. Stated
constraints are not checked directly: a list that contains the accepted track
scores well on nDCG even if other tracks in it ignore "no vocals." What the
challenge revealed is on [the next page](limitations.md).

:::{figure} img/search-challenge-evaluation.png
:label: fig-search-challenge-eval
:alt: Evaluation in the RecSys Challenge 2026. A conversational recommender takes a user profile and chat context and outputs recommended music and a response. The music is scored by nDCG and diversity, the response by an LLM score and diversity. A table defines the four dimensions: nDCG at 20 for ranking quality, catalog diversity as the share of unique recommended tracks, lexical diversity measured with Distinct-2, and an LLM judge for personalization and explanation quality.

How the RecSys Challenge 2026 scores a conversational recommender. Figure from [@doh_recsyschallenge_2026].
:::

With this page's systems, the listener gets a ranked list that respects "no
vocals" and "not too old," a reason for each track, and a way to say "more
upbeat" and be heard. What they cannot do yet is the subject of
[the next page](limitations.md).

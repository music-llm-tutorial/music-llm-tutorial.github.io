---
title: Introduction
authors:
  - name: Seungheon Doh
---

# Music listening with LLMs

A music listening application is where listeners and artists meet
({numref}`fig-intro-application`). Artists release music into it, and
listeners open it to find something to hear. The application connects the
two. It stores the music, learns what each listener likes, and decides which
of millions of tracks to show to which person. Streaming services, radio
apps, and the search bar of a music library are all listening applications.

:::{figure} img/intro-listening-application.png
:label: fig-intro-application
:width: 100%
:alt: A listener with headphones on the left, labeled User, and a musician at a workstation on the right, labeled Artists. Arrows from both point to phones showing a music player in the middle, labeled Listening Applications.

A music listening application connects users and artists.
:::

This chapter looks at how the capabilities of LLMs have changed music
listening applications. Chapter 1 introduced those capabilities, among them
language understanding and generation, world knowledge, instruction
following, in-context learning, and tool calling. Here we ask what each one
changes in a listening application: how the catalog is described, how a
listener asks for music, and how the system answers.

Imagine a listener who opens the application and types: *"something for a
late-night drive in the rain, no vocals, and not too old."* The request
describes the music she wants: a sound ("no vocals"), a release date ("not
too old"), and a situation ("a late-night drive in the rain"). The
application also has her listening history. Her recent plays are mostly Bill
Evans and Nils Frahm. The history describes the person, and it changes what a
good answer is. For this listener, a late-night drive probably means sparse
piano and slow jazz. For someone whose history is full of synthwave, the same
words point somewhere else entirely. We return to this listener and her
request throughout the chapter.

## Tasks for music listening applications

The two halves correspond to the two tasks a listening system performs.
**Search/Retrieval** maps a query to music: the listener says what they want,
and the system returns tracks that match it. **Recommendation** maps a user to
music: the system starts from the user, identified by an ID and described by a
profile and listening history, and suggests the next track for that user. The
request above needs both.

Neither task reaches the music directly. A system can match a query or a user
only against what is recorded about each track, and producing that record is
a third task. **Annotation** maps music to information: tags, captions, and
structured fields such as genre, instrumentation, or release year. The
listener never sees it, but it sets the limit on what search/retrieval
and recommendation can answer.

:::{figure} ../assets/listening-tasks.svg
:label: fig-listening-tasks
:alt: Three columns, one per task. Annotation maps music, an audio track, to information: tags, captions, and fields. Search/retrieval maps a query, "late-night drive in the rain, no vocals, not too old", to music, the tracks that match it. Recommendation maps a user (ID 1024, female, aged 25–34, favorites Bill Evans and Nils Frahm) to music, the next track for that user.

The three tasks. Annotation maps music to information, search/retrieval maps a query to music, and recommendation maps a user to music.
:::

| Task | Input → output | For the listener |
|---|---|---|
| Annotation | music → information | what the system knows about each track |
| Search/Retrieval | query → music | the listener says what they want |
| Recommendation | user → music | the system suggests the next track for this user |

## Previous approaches: annotation, search, and recommendation

Search/retrieval improved by widening what could be written about a track. Early
catalogs held a title, an artist, and a year, so a query was an exact match
or nothing. Crowds then added free-form tags, which made "jazz" and "no
vocals" searchable, at the cost of sparse and uneven coverage
[@lamere2008social]. Autotagging closed the coverage gap: a model trained on
labeled tracks stamped the same vocabulary on every track in the catalog, and
a keyword query was ranked against those stamps
[@whitman2005learning; @turnbull2008semantic; @nam2018deep]. The vocabulary
was fixed, though, and "a late-night drive in the rain" was not in it. Joint
audio-text embeddings removed the fixed vocabulary: any phrase could be a
query, scored against the audio directly
[@huang2022mulan; @manco2022contrastive]. But an embedding trained on audio
and captions knows only the sound. "Not too old" needs a release date, and
nothing in the audio carries one.

Recommendation took a different route. Collaborative filtering represents
each user and each track by an ID and learns a vector for each from listening
logs, so that a user's vector scores highest on tracks that similar listeners
played; matrix factorization made this the standard design
[@hu2008collaborative; @koren2009matrix]. It needs no annotation at all, and
it captures taste that no tag describes. Its limits follow from the same
design. A new track has no plays and therefore no vector, which is why
content-based models were brought in to fill the gap
[@vandenoord_content_2013]. A vector cannot say why a track was chosen. And
there is no place to put a query: the system can predict what this listener
usually plays, but not what they want tonight.

With these approaches, query and user lived in different representations. A query
was a set of keywords or a text embedding; a user was an ID learned from
logs. The two systems could not be combined, and each answered only half of
the request. It was the listener who adapted, choosing keywords the tagger
knew and expressing taste through the skip button. Annotation and
search/retrieval in this setting, from tagging to captioning and from
query-by-text to joint embeddings, are covered in depth in our earlier
tutorial, *Connecting Music Audio and Natural Language* [@doh2024connecting].

:::{figure} ../assets/listening-before.svg
:label: fig-listening-before
:alt: Three columns, one per task, as solved by previous approaches. Annotation by tagging: a tagger scores an audio track against a fixed vocabulary (jazz 0.91, piano 0.84, instrumental 0.78, vocals 0.05, rock 0.02) and writes the top tags as information. Search/retrieval by joint text-audio embedding: a text encoder and an audio encoder place the query "late-night drive in the rain" and every track in one shared space, and the nearest tracks are returned. Recommendation by matrix factorization: the user-by-track play matrix is approximated by user vectors times track vectors, and the missing cells in user 1024's row are scored to pick the next track.

Previous approaches. Annotation is tagging with a fixed vocabulary, search/retrieval is nearest-neighbor search in a joint text-audio embedding, and recommendation factorizes the user-by-track play matrix. Each task has its own model and its own representation.
:::

## LLM-powered listening applications

LLMs change all three tasks, and the change is the same in each: the input
becomes language.

{numref}`fig-intro-models` shows the change at the level of the system. A
listening application has three parts: an interface that takes the request,
models that answer it, and a database of music and users. Previous systems
used a separate model for each kind of request: a recommender for a user, a
text search model for a text query, and an audio search model for an audio
example. An LLM-powered application puts one model, or one LLM that calls the
earlier models, behind all three.

:::{figure} img/intro-application-models.png
:label: fig-intro-models
:width: 90%
:alt: Two diagrams of a music listening application with an interface, models, and a database of music and users. Top: three kinds of request (query by user ID and listening history, query by text, query by audio example) each go to a separate model: recommender models, text search models, and audio search models. Bottom: the same three kinds of request go to a single block labeled LLMs x Models.

A music listening application before and with LLMs. Top: one model per kind of request. Bottom: LLMs take the place of the separate models.
:::

**Annotation.** An LLM can write a description for every track from whatever
signals exist, such as tags, metadata, or the outputs of MIR models, so the
catalog gets captions without anyone writing them
[@doh2023lp; @gardner2023llark; @bukey_metadata_2026]. The model also brings
world knowledge about artists, scenes, and eras, so "jazz-ish" and "not too
old" can be resolved against the same record as "no vocals"
[@doh_ttmrpp_2024]. That knowledge is also where the model is most likely to
be confidently wrong, about an obscure artist or a release year.

**Search/Retrieval.** The query no longer has to fit a vocabulary. An LLM reads the
request, separates it into a sound description, metadata constraints, and
context, and sends each part to what can answer it: a text-to-music retriever
for the sound, a filter over the record for the date
[@doh_talkplaytools_2025]. "Not too old" becomes a condition rather than a
phrase the embedding cannot place.

**Recommendation.** The recommender can now take an explicit query as well.
Matrix factorization learned what a listener usually plays, but it had no
input for what she wants right now. An LLM-based recommender accepts both.
The listening history goes in as a list of tracks, the request goes in as a
sentence, and the model returns tracks and says why it chose them
[@he_zeroshot_crs_2023; @palumbo_text2tracks_2025]. The collaborative signal
is not thrown away. It can be built into the track tokens the model
generates, or kept as a matrix factorization model that the LLM calls as a
tool [@doh_talkplay_2025; @doh_talkplaytools_2025]. The system then uses
what millions of listeners played and what this listener just asked for in
the same answer.

Once query and user are both language, they can sit in the same context.
Search/retrieval and recommendation then become one problem, *(user, query) → music*:
the request supplies the query, the history supplies the user, and the same
model answers both. In a conversation the line fades further. "Make it more
upbeat" refines the query, a skip updates what the system knows about the
user, and both enter the same loop
[@chaganty2023beyond; @doh_talkplaytools_2025]. This convergence is the main
claim of the chapter.

The rest of the chapter follows the late-night-drive request through this
shift: how LLMs annotate a catalog, how they search and recommend from it, how
the two meet in conversation, and what does not work yet.

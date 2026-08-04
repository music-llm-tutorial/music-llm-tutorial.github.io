---
title: Bringing the Modalities Together
authors:
  - name: Huan Zhang
---

# Bringing the modalities together

CLAMP 3
https://openreview.net/pdf?id=p3Is6TcsYA 

Score, audio, and motion are complementary representations of the same underlying event. A score specifies what should happen; audio captures what did happen; motion reveals how it happened. Jointly reasoning across all three is what enables holistic performance understanding — and it is where the most interesting research questions currently sit.

Score-informed networks {cite}`huang_score_informed_2020` condition performance assessment directly on the notated score, using the symbolic reference as an additional input channel alongside audio features. The fundamental linking operation that makes this possible is **score-to-performance alignment**: given a score and a recording, establishing a time-indexed correspondence between each notated event and its acoustic realisation. This is computationally non-trivial because performances deviate from the score in tempo (rubato, accelerando, ritardando), pitch (ornaments, microtonal inflection), and structure (skipped repeats, cuts, improvisatory additions). Classical alignment methods use Dynamic Time Warping (DTW) over chroma or spectral features; more recent learned alignment models handle structural deviations more robustly, producing note-level correspondences even across large expressive departures from the score {cite}`nakamura_hmm_alignment_2015`.

% TODO: add more alignment citations — Foscarin et al. on parangonar, Dorfer et al. on score-to-audio alignment; check current bib for anything relevant

Once alignment is established, the combined representation becomes substantially more powerful than any single modality alone. An analysis system can localise a timing deviation to a specific measure, compare the performed dynamic against the printed marking, and examine whether body motion shows a corresponding physical gesture. This cross-modal evidence is what enables grounded, specific observations — not "the tempo is unsteady" but "in bar 34, the notated marking is ♩= 96 and the performed tempo peaks at ♩= 112, while the printed dynamic is *piano*." Alignment is therefore not a post-processing step; it is the architecture that makes every downstream reasoning operation meaningful.

Three recent systems demonstrate how an LLM acts as a reasoning and communication layer on top of these perceptual components. **LLaQo** {cite}`zhang_llaqo_2025` fine-tunes an audio-language model on expert piano performance QA, enabling natural-language queries about a recording without requiring a separate symbolic alignment step. **MuseAgent** {cite}`zhao_museagent_2026` coordinates OMR, AMT, and score-audio alignment through an agentic LLM controller, enabling multi-turn dialogue that can span both the score (which chord is implied by bars 17–20?) and the audio (how many notes are missing in the fifth measure?). **MusiQAL** {cite}`christodoulou_musiqal_2025` extends the framing to video, providing a benchmark that tests not only what a system can hear but what it can observe about the performer's body and the visual scene. Together these systems sketch the shape of what a fully perceptive performance analysis pipeline could be: one that reads the score, hears the performance, watches the performer, and can discuss all three in natural language calibrated to the performer's needs.

% TODO: add a diagram of the full pipeline: Score image → OMR → symbolic repr → LLM / Audio → AMT → symbolic repr → LLM / Video → visual features → LLM, with alignment linking the two symbolic streams
% TODO: check with other chapter authors whether MAESTRO, URMP, and GuitarSet descriptions overlap with Chapter 2 (music understanding datasets) and trim or cross-reference accordingly

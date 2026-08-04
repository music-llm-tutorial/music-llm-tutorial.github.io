---
title: Perceiving Motion Performances
authors:
  - name: Huan Zhang
---

# Perceiving motion performances 

Sound is not the only observable output of a performance. The performer's body generates a parallel stream of visual and proprioceptive information: bow-arm trajectory, key-depression velocity, breath timing, left-hand vibrato motion, postural weight shifts. For instruments where body-to-sound coupling is direct — bowed strings, piano key velocity, embouchure pressure — motion data can reveal technique aspects that are invisible in audio alone. A pianist's arm weight determines the onset envelope of a note in ways that MIDI velocity alone cannot capture; a cellist's bow contact point is the single most decisive variable for tone quality and is entirely absent from audio features.

The **Piano50kMotion** dataset provides motion-capture recordings of piano performances paired with corresponding audio, enabling research into the relationship between physical gesture and acoustic output at scale.

% TODO: get full citation for Piano50kMotion — author(s), venue, year, bib key. Is this from ISMIR or a dedicated dataset paper?

The **CCOM String Dataset** offers analogous resources for bowed string instruments from the Central Conservatory of Music, pairing performance audio with video and annotation data covering bowing technique, posture, and articulation decisions.

% TODO: get full citation for CCOM String Dataset — authors, venue, year, bib key. May be from ISMIR or a Chinese MIR venue.

Video provides a lower-cost alternative to dedicated motion-capture rigs. MusiQAL {cite}`christodoulou_musiqal_2025` demonstrates that standard performance video — 310 recordings spanning diverse musical traditions and styles including jazz, raga, djembe rhythms, and Polynesian dance, paired with 11,793 human-annotated question-answer pairs grounded in musicology and music psychology — carries sufficient visual information to support multimodal reasoning about performance. The dataset deliberately covers a wide range of cultural contexts, addressing the genre bias and representational limitations that affect many existing MIR datasets.

The challenge for automated systems is that body motion is not instrument-agnostic or culture-neutral. A cellist's bow arm path reflects centuries of Western conservatory pedagogy; a sarod player's right-hand technique follows entirely different physical and sonic principles; a Carnatic vocalist's microgestures of head movement encode melodic ornamentation in ways that Western body-motion features cannot capture. Systems that treat gesture as a universal feature space will generalise poorly across traditions.

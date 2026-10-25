---
title: Perceiving Motion Performances
authors:
  - name: Huan Zhang
---

# Perceiving motion performances

Sound is not the only observable output of a performance. The performer's body generates a parallel stream of visual and proprioceptive information: bow-arm trajectory, key-depression velocity, breath timing, left-hand vibrato motion, postural weight shifts. For instruments where body-to-sound coupling is direct, motion data reveals technique aspects that are invisible in audio alone. A pianist's arm weight determines the onset envelope of a note in ways MIDI velocity cannot capture; a cellist's bow contact point is the single most decisive variable for tone quality and is entirely absent from audio features.

Emerson and Harrison {cite}`emerson_multimodal_2025` survey 41 accessible multimodal corpora and organize the available modalities across three phases: before performance (score, instrument, venue, performer background), during performance (performer movement and physiological state, instrument state, sound), and after performance (performer and listener evaluation). Their coverage analysis is the important result. Performer physiological state during performance appears in one dataset, listener eye tracking in one, performer physical attributes and personality inventories in none. The modality gap is not a matter of degree; most of the taxonomy is empty.

**Optical motion capture** gives millimetre precision at the cost of ecological validity. MOSA {cite}`huang_mosa_2024` is the largest such corpus: 742 performances by 23 professional pianists and violinists, 30 hours, 570K notes, with 3D motion paired to audio and note-level annotation of pitch, beat, phrase, dynamic, articulation, and harmony. SKY-Piano {cite}`bae_skypiano_2026` adds hand and body motion, multi-view video, audio, MIDI, and scores from 7 professional and 12 amateur pianists on a shared core repertoire stratified by technique and difficulty, with motion released in both occlusion-flagged and imputed form. For bowed strings, TELMI {cite}`volpe_telmi_2017` records four master violinists across 41 techniques with synchronized motion, video, audio, and EMG; QUARTET {cite}`papiotis_quartet_2014` captures body and bow motion for string quartets to study ensemble interdependence; SPD {cite}`jin_spd_2024` provides cello and violin performances from up to 23 camera views with 3D annotation of body, hands, instrument, and bow. Percussion is served by the snare drum rudiment corpus {cite}`vanrooyen_snare_2015`.

**Video** trades precision for scale and for access to performances that were never staged for a lab. PianoMotion10M {cite}`gan_pianomotion10m_2025` annotates 10 million hand poses across 116 hours of bird's-eye-view piano video collected from the internet. FürElise {cite}`wang_furelise_2024` reconstructs 10 hours of 3D hand motion from 15 elite pianists using five calibrated cameras, refining pose estimates by inverse kinematics against Disklavier MIDI. PianoVAM {cite}`kim_pianovam_2025` records amateur daily practice with top-view video, hand landmarks, and semi-automated fingering labels; its reported gain from adding visual information to onset detection was smaller than expected, which is the most useful negative result in this literature. Fingering extraction from video and MIDI {cite}`moryossef_fingering_2023` yields 150,000 tagged notes without any capture hardware. MusiQAL {cite}`christodoulou_musiqal_2025` shows that standard performance video supports multimodal reasoning rather than only kinematic measurement: 310 recordings spanning jazz, raga, djembe rhythms, and Polynesian dance, paired with 11,793 question-answer pairs grounded in musicology and music psychology.

:::{figure} assets/pianomotion_overview.png
:label: fig-pianomotion
:alt: Bird's-eye-view piano video strips from the internet on the left, converted into aligned streams of hand meshes, audio waveform and MIDI; on the right, piano audio driving a model that outputs hand poses over a keyboard.
:width: 100%

What motion data actually is: video scraped from the internet, reduced to parametric hand meshes aligned with audio and MIDI {cite}`gan_pianomotion10m_2025`. Scale comes from giving up the laboratory, and the 14 experts behind those 116 hours are all advanced players, so the poses a learner produces are not in the distribution.
:::

The tradeoff is instrument-dependent. Markerless pose carries centimetre-level joint error, which is tolerable for gross posture and ensemble coordination and fatal for fingering, embouchure, or bow contact point. Emerson and Harrison nonetheless recommend video-based estimation as the default for new corpora {cite}`emerson_multimodal_2025`, on the grounds that intrusive capture suppresses the behaviour being measured.

Coverage is uneven by instrument:

| Instrument | Motion and video resources | State |
|---|---|---|
| Piano | PianoMotion10M, FürElise, PianoVAM, SKY-Piano, MOSA, Piano Gestures | Saturated; fingering is the active task |
| Violin, cello | TELMI, SPD, QUARTET, EEP, MOSA, Violin Gestures | Strong, bow-parameter focused |
| Guitar | MMG, GAPS | Thin on motion |
| Percussion | Snare Drum MoCap, ENST-Drums | Pre-deep-learning |
| Conducting | PHENICX-Conduct | Minimal |
| Wind | None with motion | Absent |
| Voice, Western | None with motion | Absent |
| Hindustani vocal | Clayton et al., ISMIR raga-gesture corpora | Strongest non-Western line |

Instrument-embedded sensors and biosignals sit outside this corpus infrastructure. EMG appears in TELMI and the Violin Gestures set, breath and embouchure sensing exists only as lab instrumentation, and gaze is confined to sight-reading studies with no released data. EEG is the sharpest case: the MIR-facing EEG corpora are all *listening* datasets, and performance-side EEG lives in music psychology venues with no benchmark infrastructure. For a system that must reason about how someone plays, these channels are currently evidence that a question can be asked, not data on which a model can be trained.

Body motion is not instrument-agnostic or culture-neutral. A cellist's bow arm path reflects centuries of Western conservatory pedagogy; a sarod player's right-hand technique follows entirely different physical and sonic principles. The Hindustani case is now measured rather than asserted. Clayton et al. {cite}`clayton_pose_2023` classify singers from movement information alone and reach 38.2% mean accuracy on nine ragas from pose data, and gesture-melody correspondence has been studied on purpose-built alap corpora {cite}`nadkarni_alap_2023`. Singers' gesturing is idiosyncratic and tightly coupled to melodic movement at the same time, which is precisely the property that a universal body-motion feature space would destroy.

The practical consequence for LLM-based systems is that motion is the modality where data exists but the interface does not. Current work is either pose estimation with threshold rules, or audiovisual benchmarks that stop at description. A motion analyser belongs in the system as a tool the model calls, returning bow contact point or key-descent velocity as structured measurements, not as a token stream the model is asked to interpret directly.

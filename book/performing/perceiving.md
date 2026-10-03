---
title: Perceiving Performance
authors:
  - name: Huan Zhang
---

# Perceiving performance

A performance leaves three records. The score says what the page asked for. Audio says what one player did with it, once. Motion says how the body produced the sound. Each is blind to something the other two see: a score does not say whether the crescendo happened, audio does not say whether the bow ran out, and motion does not say what the page asked for ({ref}`fig-perception-channels`).

A language model receives none of the three directly. The score arrives as tokens, the audio as the output of MIR analysers {cite}`benetos_amt_2019`, {cite}`lerch_survey_2019`, the motion as pose estimates. The model reads what the tools said about the take. What the tools drop, the model never sees.

:::{figure} assets/perception_channels.svg
:label: fig-perception-channels
:alt: Three panels show one passage as a score with a slur, fingering, dolce and a crescendo hairpin from p to f; as a waveform whose loudness envelope grows; and as a bow arm drawn in three positions along a path. Under each panel an eye-off icon marks its blind spot. Arrows lead through a tokeniser, audio analysers and a pose estimator into a single language model box.
:width: 100%

One passage, three records, one blind spot each. The language model sits below all three tools and reads their output, not the performance.
:::

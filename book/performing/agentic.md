---
title: Agentic Coaching Systems
authors:
  - name: Huan Zhang
---

# Agentic coaching systems

Single-session feedback answers *what just went wrong*. The next question is what a learner should work on *across weeks*. Educational surveys of LLM agents organise that longer horizon around **tool calling**, **memory**, and **planning**, together with decisions about when to instruct, when to ask, and when to step back {cite}`chu_llm_agents_education_2025`. Chapter 1 introduces these ingredients for general agents.

Music systems so far cover pieces of the picture: analysers and score-audio controllers for one take, query-based coaches for dialogue. What is missing is coaching as an *agent* that continues a thread, calling perceptual tools, carrying learner state, and adapting a practice plan over time. Music practice makes this harder than most classroom tutoring. Perception is multimodal and breaks on imperfect play, skill is embodied, and human teachers are absent between lessons.

## Practice apps in 2026

:::{table} Practice apps as of October 2026, compiled from help centres, store listings, patents and published reviews. The last five rows add a conversational coach.
:label: tbl-practice-apps
:class: col-body-outset-right

| App | Instrument | Input | What it checks | What it keeps | Next task | Teacher | LLM |
|---|---|---|---|---|---|---|---|
| Simply Piano {cite:p}`simply_piano_help_2026` | piano | mic, MIDI | notes, live, with hints | progress, stars, streaks | fixed path, star gates | ✗ | ✗ |
| Flowkey {cite:p}`flowkey_2026,flowkey_onboarding_2026` | piano | mic, MIDI | notes, live; can wait for them | course progress | self-report quiz, then learner picks | ✗ | ✗ |
| Skoove {cite:p}`skoove_help_2026` | piano | mic, MIDI | notes, live | course history | questionnaire picks a first lesson | ✓ paid messages, live lessons | ✗ |
| Piano Marvel {cite:p}`piano_marvel_sasr_2026` | piano | MIDI; mic in beta | notes, how early or late | scores, minutes, sight-reading level | ✓ sight-reading test picks excerpts by score | ✓ sees scores, minutes | ✗ |
| Yousician {cite:p}`yousician_help_2026` | guitar, bass, piano, ukulele, voice | mic, MIDI | notes, chords per string, timing | stars, best scores, streaks | unlocked path, learner picks | ✗ | ✗ |
| Rocksmith+ {cite:p}`rocksmith_difficulty_2026,rocksmith_skill_profiles_2022` | guitar, bass, piano | cable, mic, MIDI | notes, chords, techniques | ✓ level per technique | ✓ song gets harder after runs of hits | ✗ | ✗ |
| Melodics {cite:p}`melodics_stages_2026` | pads, keys, drums | MIDI; mic for drums | timing of each hit | scores, XP, Stages | ✓ Stage gates, weekly goals | ✗ | ✗ |
| Fender Play {cite:p}`fender_feedback_mode_2026,fender_feedback_mode_faq_2026,fender_play_one_2024` | guitar, bass, ukulele | mic | pitch, rhythm, after the take | path progress; take scores not kept | fixed path | ✓ paid, separate service | ✗ |
| SmartMusic {cite:p}`makemusic_cloud_help_2026` | band, orchestra, voice | mic, MIDI | pitch, onset, duration; teacher sets tolerance and live marks | graded takes, practice minutes | teacher assigns | ✓ gradebook, rubric | ✗ |
| Trala {cite:p}`trala_2026` | violin | mic | pitch, rhythm, live | progress | fixed curriculum | ✗ since 2025 | ✗ |
| tonestro {cite:p}`tonestro_2026` | winds, brass, strings, piano | mic | pitch, rhythm, live; repeats until clean | points, exams, streaks | "Smart Practice", method not documented | ✗ | ✗ |
| Metronaut {cite:p}`metronaut_2026` | 20+ instruments, voice | mic, MIDI | pitch, timing; ✓ accompaniment follows tempo | recordings, practice time | learner or teacher picks | ✓ playlists, annotations | ✗ |
| Modacity {cite:p}`modacity_2026` | any | recorder | ✗ by design | ✓ journal, recordings, self-ratings | learner's own lists | ✗ | ✗ |
| June by Yousician {cite:p}`yousician_june_2026,maxim_yousician_2026` | guitar | mic | inside the tools it opens | progress review claimed | ✓ proposes next drill or song | ✗ | ✓ chat that opens tuner, chord trainer, songs |
| ROLI AI Music Coach {cite:p}`roli_ai_music_coach_2026,roli_coach_learn_app_2026` | piano | ROLI keyboard, infrared hand camera | notes, timing, fingering, live | learning claimed, not documented | ✓ suggests what to practise, paces songs | ✗ | ✓ voice, 40 languages |
| Artie {cite:p}`artie_2026` | piano | mic, MIDI | rhythm, accuracy, live tips | plan, weekly streak | personalised plan | ✗ | ✓ tips and chat |
| Singing Carrots {cite:p}`singing_carrots_coach_2026,singing_carrots_studio_2026` | voice | mic | pitch, live | ✓ goals and voice notes the singer can edit | ✓ LLM plans each session | ✓ lesson transcripts feed the coach | ✓ text chat |
| Clefer {cite:p}`clefer_teachers_2026,clefer_app_store_2026` | piano | mic | notes, rhythm, live | recordings, practice per piece | teacher assigns; coach suggests what to try next | ✓ sees practice habits, weak passages | chat during practice |
:::

Among these apps, **only Metronaut's accompaniment follows the player's tempo**; the others wait for the right note or play at a set tempo. A set tempo has a cost. In a study with 34 wind and brass students, SmartMusic kept penalising notes after a late entrance or a small tempo drift, and adding it to a panel of four band directors lowered the panel's dependability from .95 to .67 {cite}`shih_smartmusic_2018`. Simply and Yousician patented choosing the next exercise from a stored skill level or from recurring errors {cite}`joytunes_adaptive_patent_2023,joytunes_exercises_patent_2024,yousician_skill_patent_2017`, but their help centres describe only fixed or learner-chosen paths.

In the apps with a language model, conventional recognition still does the listening, and the model chooses which tool to open and what to say. June calls a tuner, a chord trainer or a song player, and a separate prompt writes the feedback on each take {cite}`maxim_yousician_2026`. ROLI's coach slows or loops a passage when asked and tracks finger placement from the camera {cite}`roli_coach_learn_app_2026`. **Singing Carrots is the only one that documents its memory**: up to 30 goals and notes about the singer's voice, which the singer can edit, and transcripts of lessons with the singer's human teacher {cite}`singing_carrots_coach_2026,singing_carrots_studio_2026`. None of them names its model, and we found no published evaluation of whether learners improve.

The subsections take the three ingredients in turn: tools, memory, and pedagogy as the policy over both.

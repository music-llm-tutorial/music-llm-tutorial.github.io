---
title: Pedagogy as the Agent's Control Policy
authors:
  - name: Huan Zhang
---

# Pedagogy as the agent's control policy

Tools and memory are infrastructure. Teaching is the **policy** over them: which speech act to use now, how much help to give, and when to stop helping. Educational agent surveys list planning and personalisation beside memory and tools for this reason {cite}`chu_llm_agents_education_2025`. Without some pedagogical policy, even a well-instrumented agent tends to default to answering rather than teaching.

## Classical anchors

**Zone of proximal development.** Vygotsky's ZPD describes the gap between what a learner can do alone and what they can do with guidance {cite}`vygotsky_mind_society_1978`. Mapped onto practice agents, this suggests choosing the next drill or repertoire target just beyond current mastery estimates — hard enough to grow, not so hard that the session collapses — rather than only repeating owned material or jumping straight to performance tempo.

**Scaffolding and fading.** Wood, Bruner, and Ross characterised scaffolding as contingent support that enables a learner to solve a problem they could not solve alone, with help gradually withdrawn as competence grows {cite}`wood_scaffolding_1976`. Later instructional work stresses that fading must be intentional lest support become permanent dependency {cite}`van_de_pol_scaffolding_2010`. Agentic coaching literature inherits the same trade-off: richer feedback depths and heavier hints early, then withdrawal toward autonomy as error rates fall.

**Formative feedback.** Reviews argue that effective comments are specific, timely, and aimed at the task or process rather than at the ego {cite}`hattie_feedback_2007`, {cite}`shute_formative_2008`. That distinction maps onto the annotation depths discussed under open problems for performance data: summary praise, note-level evidence, diagnostic exercise, and physical cue are different pedagogical moves, not interchangeable paraphrases.

## How recent LLM tutors enact those ideas

**Planning then adapting.** ScaffoldLM first builds a stepwise pedagogical plan, then uses assessment-driven memory to decide whether to remediate the current step or advance {cite}`li_scaffoldlm_2026`. A music analogue is a practice plan for a passage (hands separate → slow both hands → target tempo) whose step index advances when tool-assessed criteria are met.

**Roles that protect autonomy.** MusicScaffold frames generative AI as guide, coach, and partner — explaining structure, prompting reflection, and co-creating without taking over the learner's direction {cite}`hu_musicscaffold_2025`. Chat Melody explores Learning-by-Teaching: the student explains while the agent plays novice, with reported gains in learning and reduced cognitive load {cite}`jin_teachable_agent_2025`. Both illustrate that "act like a teacher" can mean *not* supplying the answer.

**Reactive vs proactive.** Pedagogical-agent reviews distinguish systems that only reply from those that initiate {cite}`scoping_llm_pedagogical_agents_2026`. During playing, latency favours short reactive loops (analyser → brief cue). Between lessons, a coach may nudge from memory ("bars 12–16 still cold — ten minutes of isolation?"). Which regime fits which moment remains an open design choice.

**The automation–learning tension.** Work on agentic AI and pedagogical practice notes that systems optimised to complete tasks for the user can undermine learning if they never leave room for productive struggle {cite}`agentic_ai_pedagogy_2026`. Practical responses explored in that literature include withholding completion, asking a question, or deferring to a human teacher — especially at the boundary between technical error and interpretive choice, or wherever child-safety and duty of care apply.

## Closing the loop

Taken together, tools diagnose, memory carries state, and pedagogy selects the move. A sketch of one multi-session thread — the same pitch instability in a bar across weeks, shifting from note-level callouts to a diagnostic drill and then to faded check-ins — shows why none of the three modules alone is coaching. Evaluation remains open: general tutoring benchmarks such as DeepTutor's TutorBench illustrate interactive, profile-conditioned assessment {cite}`deeptutor_2026`, but longitudinal music-practice benchmarks are still scarce.

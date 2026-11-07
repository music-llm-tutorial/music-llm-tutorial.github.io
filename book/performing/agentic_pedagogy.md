---
title: Pedagogy as the Agent's Policy
authors:
  - name: Huan Zhang
---

# Pedagogy as the agent's policy

The main parts of a practice agent are summarized in {ref}`fig-practice-agent-build`. Three of them are the same in every tool-using agent: a model reached through an API that supports tool calling, a set of tool schemas with the functions behind them, and a loop that sends the conversation, runs whatever tools the model asked for, appends the results, and repeats {cite}`chu_llm_agents_education_2025`. Tools and memory are infrastructure. Teaching is the **policy** over them: which move to make now, how much help to give, and when to stop helping. A pedagogical policy decides the tutor's next action and has been induced from student data with reinforcement learning as in Chi and colleagues {cite}`chi_rl_pedagogical_2011`. Without a policy, a well-instrumented agent defaults to answering rather than teaching with domain knowledge.

:::{figure} assets/practice_agent_build.svg
:label: fig-practice-agent-build
:alt: A seven-row table listing model, tools, loop, domain knowledge, memory, policy and evaluation, with what each is in a practice agent, which page of the chapter covers it, and where it appears in the demo notebook.
:width: 100%

The parts of a practice agent, where this chapter covers each, and where the demo notebook (in the next page) implements it.
:::

VanLehn splits tutoring behaviour into two loops {cite}`vanlehn_behavior_tutoring_2006`. The **outer** loop runs once per task and chooses what the student works on next. The **inner** loop runs once per step, gives hints and feedback, and updates the student model. Agent harnesses have the same split: a task loop that picks the next unit of work, and a turn loop that handles one model request and its tool calls {cite}`bui_opendev_2026`, {cite}`openai_codex_cli_2026`. In a practice agent, which passage to work on next is an outer loop decision, and how much to say about one take is an inner loop decision.

## Domain knowledge: Centuries of pianism treatises

Before an agent can decide how to teach, it has to know how the piano is played. There are two centuries of treatises cover it ({ref}`fig-piano-treatises`): how a key is pressed and a tone produced {cite}`matthay_act_of_touch_1903`, the five basic motions of arm and hand {cite}`sandor_on_piano_playing_1981`, how to practise and memorise {cite}`leimer_gieseking_piano_technique_1972`, what a teacher listens for in tone and rhythm {cite}`neuhaus_art_of_piano_1973`, the nervous system behind the movement {cite}`kochevitsky_art_of_piano_1967`. It's similar as the case law Harvey trained into its legal model, and [](./agentic.md) outlines the two ways to put it into an agent: train it into the weights, or retrieve it at run time by scaffolding.

:::{figure} assets/piano_treatises.jpg
:label: fig-piano-treatises
:alt: Twelve book covers in two rows, from Czerny's letters of 1839 to Paul Harris's graded sight-reading series, each labelled with the aspect of piano playing it covers.
:width: 100%

Written treatises of how the piano is played and pedagogicla principles, 1839 to 2008: fingering and daily practice {cite}`czerny_letters_1839`, touch and tone {cite}`matthay_act_of_touch_1903`, {cite}`hofmann_piano_playing_1920`, technique measured in the laboratory {cite}`ortmann_physiological_mechanics_1929`, practising and memorising {cite}`leimer_gieseking_piano_technique_1972`, {cite}`chang_fundamentals_2016`, the arm and the nervous system {cite}`whiteside_indispensables_1955`, {cite}`kochevitsky_art_of_piano_1967`, {cite}`sandor_on_piano_playing_1981`, {cite}`fraser_craft_2003`, the teacher's ear {cite}`neuhaus_art_of_piano_1973`, graded sight-reading {cite}`harris_sight_reading_2008`. 
:::

Ideally, the policy should sit on top of this knowledge. Given what the treatises say about playing and what memory says about this learner, the policy decides which move to make now, which tool call to examine which aspect, how much help to give, and when to stop.

## Domain knowledge: Classical anchors for education

**Zone of proximal development.** Vygotsky's ZPD is the gap between what a learner can do alone and what they can do with guidance {cite}`vygotsky_mind_society_1978`. For a practice agent this is a nice fit for outer loop policy: pick the next drill just past current mastery, instead of repeating owned material or jumping to performance tempo.

**Scaffolding and fading.** Wood, Bruner and Ross described scaffolding as support that lets a learner solve a problem they could not solve alone, withdrawn as competence grows {cite}`wood_scaffolding_1976`. Later work stresses that the withdrawal has to be deliberate, or the support becomes permanent {cite}`van_de_pol_scaffolding_2010`.

**Formative feedback.** Useful comments are specific, timely, and about the task or the process rather than the person {cite}`hattie_feedback_2007`, {cite}`shute_formative_2008`. Details like summary praise, note-level evidence, a diagnostic exercise and a physical cue shall be separate to address each bullet point.

**Reactive or proactive.** Reviews separate agents that only reply, from agents that start the conversation {cite}`scoping_llm_pedagogical_agents_2026`. Between lessons an agent can open the turn itself from memory, asking student in a proactive way.

**Automation against learning.** Systems tuned to finish the task for the user will remove the struggle that produces the learning {cite}`agentic_ai_pedagogy_2026`. In their manuscript, they discussed more favorable responses like withholding completion, asking a question, or handing back to a human teacher.

### How recent LLM tutors enact those ideas

**Plan then adapt.** ScaffoldLM builds a stepwise plan first, then uses assessment-driven memory to decide whether to remediate the current step or advance {cite}`li_scaffoldlm_2026`. The music version is a plan for one passage (hands separate, slow hands together, target tempo) whose step advances when tool-assessed criteria are met.

:::{figure} assets/scaffoldlm_framework.png
:label: fig-scaffoldlm
:alt: A stepwise pedagogical plan decomposing one algebra problem into three question and answer pairs, above a turn-by-turn loop in which the tutor assesses the learner state then acts, with a memory panel tracking which plan steps are complete and recording each turn's state.
:width: 100%

The two loops drawn concretely {cite}`li_scaffoldlm_2026`. The plan across the top is the outer loop and it does not change during the dialogue. Each turn below it assesses the learner's state, picks an action, and writes the result back.
:::

**Roles that protect autonomy.** MusicScaffold frames generative AI as guide, coach and partner, explaining structure and prompting reflection without taking over {cite}`hu_musicscaffold_2025`. Chat Melody has the student explain while the agent plays novice, and reports learning gains with lower cognitive load {cite}`jin_teachable_agent_2025`. Acting like a teacher can mean not giving the answer.


## Incorporating domain knowledge into the agent

Three routes, in increasing order of cost.

**In the prompt, or in skills loaded on demand.** A system prompt holds rules, such as a feedback rubric or the sight-reading criteria for one grade, but not a book. Agent Skills keep such knowledge in a directory whose full contents load only when a task matches {cite}`anthropic_agent_skills_2025`.

**Retrieval.** Retrieval beat fine-tuning for adding knowledge to a model, both for facts seen in pretraining and for new ones {cite}`ovadia_knowledge_injection_2024`. A few dozen piano treatises are small enough for keyword search over chapters. A retrieved passage carries its book and page, so a teacher can check the claim; a claim recalled from the weights has no source.

**Into the weights.** Harvey's 2024 case-law model, built with OpenAI, tried fine-tuning and retrieval first, then added the equivalent of 10 billion tokens of US case law to a base model; attorneys preferred its answers to GPT-4's 97 percent of the time {cite}`openai_harvey_2024`. A book cannot be trained in by reading it once: a model stores a fact seen once but **cannot answer questions about it unless the training data presents the fact in many rewritten forms** {cite}`allenzhu_knowledge_2024`. EntiGraph generates those rewrites ({ref}`fig-entigraph`). From 1.3 million tokens of source text it synthesised 455 million, and training on them recovered more than 80 percent of what retrieval achieves {cite}`yang_entigraph_2025`. Training Neuhaus into a model would follow the same recipe.

:::{figure} assets/entigraph_overview.png
:label: fig-entigraph
:alt: EntiGraph pipeline: a small corpus of documents, a list of extracted entities, a graph of those entities with a language model prompted to describe one edge, and the output, a diverse synthetic corpus for continued pretraining.
:width: 100%

EntiGraph extracts the entities in each document, then prompts a model to write about how pairs of them relate; the outputs form the corpus for continued pretraining {cite}`yang_entigraph_2025`. For a piano treatise the entities would be terms such as arm weight, wrist and tone.
:::

## Incorporating the policy into the agent

A student plays bar 12 wrong for the third time. The tutor can name the note, ask whether it sounded right, set a slow drill on bars 11 to 13, or move on. The policy picks one. It can be written into the prompt, which is cheap but which the model may ignore, or trained into the weights. {ref}`fig-policy-ladder` follows the bar 12 example up three rungs.

:::{figure} assets/policy_ladder.svg
:label: fig-policy-ladder
:alt: A three-row table: write it, optimise it, learn it, with where the policy lives, what each rung needs, and what each looks like for a student who plays bar 12 wrong the third time.
:width: 100%

Three ways to put a teaching policy into a practice agent, from cheapest to most expensive.
:::

**Write it.** Most policies are written by hand in three places. The prompt holds a few rules, added only after observed failures {cite}`anthropic_context_engineering_2025`. Tool returns decide what the model can see: "accuracy 82%" lets it say only "keep practising" {cite}`anthropic_writing_tools_2025`. The harness enforces in code what must not be skipped, through stored plan state, gated tools, and hooks that check each reply before it goes out {cite}`bui_opendev_2026`, {cite}`openai_codex_cli_2026`.

**Optimise it.** GEPA keeps the policy as prompt text but has a model rewrite it {cite}`agrawal_gepa_2026`. It runs the agent on 20 to 100 scored examples, has a model write down what went wrong in each run, and edits the prompt. It beat GRPO, which trains the weights, with up to 35 times fewer runs.

**Learn it.** Reinforcement learning trains the weights from a reward. Chi and colleagues trained a physics tutor to choose between telling a step and asking for it, rewarded by the students' test gains {cite}`chi_rl_pedagogical_2011`; MC-CPO limits the allowed actions by the learner's mastery {cite}`olukola_mccpo_2026`. Self-distillation fine-tuning (SDFT) needs no reward: the model is trained so that its answer without a teacher's demonstration matches its answer with one {cite}`shenfeld_sdft_2026`.

Coding agents are trained with reinforcement learning because tests pass or fail automatically. Music practice has no such check: whether a drill worked shows a week later. Distillation needs teacher demonstrations instead, a take and what the teacher said next, and **no one has collected a corpus of them yet**. Until then the policy is written and prompt-optimised.

## Closing the loop

Tools diagnose, memory carries state, pedagogy picks the move. One multi-session thread shows why no single module is coaching: the same unstable bar across several weeks, moving from note-level callouts to a diagnostic drill and then to faded check-ins.

The demo notebook checks each take against note-level evidence before saying anything about it, and ranks that check above fine-tuning. Evaluation is the gap, and it has moved backwards. Chi and colleagues ran classroom studies and showed that which policy you use changes what students learn {cite}`chi_rl_pedagogical_2011`. Most LLM tutors now write the policy by hand and report task performance instead of learning gain. DeepTutor's TutorBench evaluates interactive, profile-conditioned tutoring {cite}`deeptutor_2026`, and nothing directly comparable exists for music practice over time.

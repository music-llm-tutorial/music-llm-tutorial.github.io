---
title: Pedagogy as the Agent's Policy
authors:
  - name: Huan Zhang
---

# Pedagogy as the agent's policy

Tools and memory are infrastructure. Teaching is the **policy** over them: which move to make now, how much help to give, and when to stop helping. A pedagogical policy decides the tutor's next action and has been induced from student data with reinforcement learning as in Chi and colleagues {cite}`chi_rl_pedagogical_2011`. Educational agent surveys list planning and personalisation beside memory and tools for the same reason {cite}`chu_llm_agents_education_2025`. Without a policy, a well-instrumented agent defaults to answering rather than teaching with domain knowledge.

VanLehn splits tutoring behaviour into two loops {cite}`vanlehn_behavior_tutoring_2006`. The **outer** loop runs once per task and chooses what the student works on next. The **inner** loop runs once per step and gives hints and feedback and updates the student model. General agent harnesses have the same split under different names: a task loop that picks the next unit of work, and a turn loop that handles one model request and its tool calls {cite}`openai_codex_cli_2026`.

:::{figure} assets/tutoring_agent_loops.svg
:label: fig-tutoring-agent-loops
:alt: An outer loop box containing an inner loop box, each labelled with the tutoring-systems term and the agent-harness term for the same thing.
:width: 100%

The same two-loop structure in Tutoring systems 2006 {cite}`vanlehn_behavior_tutoring_2006` and agent harnesses {cite}`bui_opendev_2026`, {cite}`openai_codex_cli_2026`.
:::

## Domain knowledge

### How the piano is played

Before an agent can decide how to teach, it has to know how the piano is played. There are two centuries of treatises cover it ({ref}`fig-piano-treatises`): how a key is pressed and a tone produced {cite}`matthay_act_of_touch_1903`, the five basic motions of arm and hand {cite}`sandor_on_piano_playing_1981`, how to practise and memorise {cite}`leimer_gieseking_piano_technique_1972`, what a teacher listens for in tone and rhythm {cite}`neuhaus_art_of_piano_1973`, the nervous system behind the movement {cite}`kochevitsky_art_of_piano_1967`. It's similar as the case law Harvey trained into its legal model, and [](./agentic.md) outlines the two ways to put it into an agent: train it into the weights, or retrieve it at run time by scaffolding.

:::{figure} assets/piano_treatises.jpg
:label: fig-piano-treatises
:alt: Twelve book covers in two rows, from Czerny's letters of 1839 to Paul Harris's graded sight-reading series, each labelled with the aspect of piano playing it covers.
:width: 100%

Written treatises of how the piano is played and pedagogicla principles, 1839 to 2008: fingering and daily practice {cite}`czerny_letters_1839`, touch and tone {cite}`matthay_act_of_touch_1903`, {cite}`hofmann_piano_playing_1920`, technique measured in the laboratory {cite}`ortmann_physiological_mechanics_1929`, practising and memorising {cite}`leimer_gieseking_piano_technique_1972`, {cite}`chang_fundamentals_2016`, the arm and the nervous system {cite}`whiteside_indispensables_1955`, {cite}`kochevitsky_art_of_piano_1967`, {cite}`sandor_on_piano_playing_1981`, {cite}`fraser_craft_2003`, the teacher's ear {cite}`neuhaus_art_of_piano_1973`, graded sight-reading {cite}`harris_sight_reading_2008`. 
:::

Ideally, the policy should sit on top of this knowledge. Given what the treatises say about playing and what memory says about this learner, the policy decides which move to make now, which tool call to examine which aspect, how much help to give, and when to stop.

### Classical anchors for education

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

{ref}`fig-tutoring-agent-loops` drawn concretely {cite}`li_scaffoldlm_2026`. The plan across the top is the outer loop and it does not change during the dialogue. Each turn below it assesses the learner's state, picks an action, and writes the result back.
:::

**Roles that protect autonomy.** MusicScaffold frames generative AI as guide, coach and partner, explaining structure and prompting reflection without taking over {cite}`hu_musicscaffold_2025`. Chat Melody has the student explain while the agent plays novice, and reports learning gains with lower cognitive load {cite}`jin_teachable_agent_2025`. Acting like a teacher can mean not giving the answer.

## How the agent is built

The main parts of practice agent are summarized in {ref}`fig-practice-agent-build`. Three of them are the same in every tool-using agent: a model reached through an API that supports tool calling, a set of tool schemas with the functions behind them, and a loop that sends the conversation, runs whatever tools the model asked for, appends the results, and repeats {cite}`chu_llm_agents_education_2025`. The two sections below take the two that have to be put into the agent, knowledge and policy, and the routes available for each.

:::{figure} assets/practice_agent_build.svg
:label: fig-practice-agent-build
:alt: A seven-row table listing model, tools, loop, domain knowledge, memory, policy and evaluation, with what each is in a practice agent, which page of the chapter covers it, and where it appears in the demo notebook.
:width: 100%

The parts of a practice agent, where this chapter covers each, and where the demo notebook (in the next page) implements it.
:::

### Putting domain knowledge into the agent

Three routes in increasing order of cost:

**In the prompt, or in skills loaded on demand.** A system prompt holds rules: a feedback rubric, the sight-reading criteria for one grade, etc. It does not hold a book. Anthropic's Agent Skills standard puts procedural knowledge in a directory with a `SKILL.md` entry file. Only the name and a description are loaded at start, the full file when a task matches, and supporting files only when needed {cite}`anthropic_agent_skills_2025`. A **rubric** for octave passages or an exam board's sight-reading **criteria** fit this shape.

**Retrieval.** Ovadia and colleagues compared unsupervised fine-tuning with retrieval-augmented generation (RAG) for putting knowledge into a model. Retrieval won consistently, on knowledge the model had seen in pretraining and on knowledge it had not {cite}`ovadia_knowledge_injection_2024`. The piano treatises are a few dozen books, small enough that keyword search over chapters is enough and no vector database is needed. When the agent quotes a retrieved passage it can name the book and page, so a teacher can check the claim. A claim recalled from the weights has no source to check. Harvey keeps this layer even after training its own models: with Voyage AI it fine-tuned a legal embedding model on more than 20 billion tokens of US case law and cut irrelevant results in the top ten by about a quarter {cite}`harvey_voyage_embeddings_2024`.

**Into the weights.** Harvey's first case-law model, built with OpenAI in 2024, started with fine-tuning through the public API and with retrieval, found both insufficient for open-ended legal research, and ended by adding the equivalent of 10 billion tokens of US case law to a base model. Attorneys at ten firms preferred its answers to GPT-4's 97 percent of the time {cite}`openai_harvey_2024`. Harvey's 2026 model, Tenet, was trained differently: reinforcement learning on legal tasks, on a Kimi K3 base {cite}`harvey_tenet_2026`. That taught the model to carry out long legal workflows, not new law. For putting a body of knowledge into a model, the 2024 case-law model is the example to follow.

A book cannot be fine-tuned in once. Allen-Zhu and Li showed on controlled biographies that a model stores a fact it has seen a single time but **cannot answer questions about it unless the training data presents the fact in many rewritten and reordered forms** {cite}`allenzhu_knowledge_2024`. Ovadia and colleagues saw the same on real models and found that paraphrasing the facts helped {cite}`ovadia_knowledge_injection_2024`. EntiGraph turns this into a method: extract the entities in a small corpus, prompt a model to write text that connects them, and continue pretraining on the result. From 1.3 million tokens of source text it synthesised 455 million, and the trained model recovered more than 80 percent of what retrieval achieves on the same questions, while still gaining from retrieval on top {cite}`yang_entigraph_2025`. Training Neuhaus into a model means the same recipe: a few books, hundreds of rewrites per claim, continued pretraining. 

### Putting the policy into the agent

The same ladder as for knowledge: write it, optimise it from examples, learn it.

**Write it.** Most of the policy is written by hand, and the writing has a method: context engineering for what reaches the prompt, tool design for what the model can observe, and the harness for what must be enforced.

**Context engineering.** Anthropic's engineering guide names the discipline: choose, each turn, the smallest set of tokens that produces the behaviour wanted {cite}`anthropic_context_engineering_2025`. Its rules for the system prompt: start minimal on the best available model, add instructions only in response to observed failures, prefer a few worked examples to a list of edge cases.

**Tool design.** A tool description is a prompt, and a tool return is context. Anthropic's guide on tools: return meaningful content rather than identifiers, keep returns within a token budget, namespace tools so their boundaries are clear {cite}`anthropic_writing_tools_2025`. For a practice agent the tool surface decides what the model can observe at all; [](./agentic_tools.md) covers the analysers behind it.

**Where each commitment is enforced.** Prompt text and skills hold the parts of the policy the model is asked to follow. The model can ignore them and nothing checks. Harness engineering puts the rest where code enforces it {cite}`bui_opendev_2026`:

- **State** for anything that must persist across sessions: the current plan step, how much scaffolding is still in force.
- **Tool gating** for what the agent may do at all.
- **Hooks** for what must happen every time: a check the harness runs before a turn ends {cite}`openai_codex_cli_2026`.

**Optimise it from examples.** GEPA is a prompt optimiser {cite}`agrawal_gepa_2026`. Give it a running agent, 20 to 100 example tasks, and a score for each run. It runs the agent, has a model read each trajectory and write in plain language what went wrong and how the prompt should change, applies the change, and keeps the candidate prompts that score best on different examples. It beat GRPO by 6 to 20 percent with up to 35 times fewer rollouts. For a practice agent the examples would be recorded takes paired with a teacher's written feedback, the score a judge comparing the agent's feedback with the teacher's, and the output a rewritten system prompt, for instance one that asks for another take when the aligner's confidence is low instead of naming a bar. The weights do not change.

**Learn it.** Self-distillation fine-tuning (SDFT) puts an expert demonstration in the context, samples from the same model without it, and trains the bare model toward the demonstration-conditioned one token by token. Across a sequence of skills it beats supervised fine-tuning on the new task and forgets less of the old ones {cite}`shenfeld_sdft_2026`. The demonstration stands in for the reward. With a reward, the policy can be trained directly. Chi and colleagues induced pedagogical policies from student interaction logs and tested them on real classes {cite}`chi_rl_pedagogical_2011`. MC-CPO restricts which instructional actions are admissible according to the learner's mastery state, across 21 million interactions {cite}`olukola_mccpo_2026`.

Coding agents can be trained with reinforcement learning because coding has a verifier: tests pass or they do not, but music practice has none: Nobody can score automatically whether a piece of coaching worked. Distillation asks for demonstrations instead of a verifier, and teachers produce those every lesson, so what a learned coaching policy is missing is a corpus of teacher moves rather than a reward. Until someone collects it, the policy will be configured and prompt-optimised.

## Closing the loop

Tools diagnose, memory carries state, pedagogy picks the move. One multi-session thread shows why no single module is coaching: the same unstable bar across several weeks, moving from note-level callouts to a diagnostic drill and then to faded check-ins.

The demo notebook checks each take against note-level evidence before saying anything about it, and ranks that check above fine-tuning. Evaluation is the gap, and it has moved backwards. Chi and colleagues ran classroom studies and showed that which policy you use changes what students learn {cite}`chi_rl_pedagogical_2011`. Most LLM tutors now write the policy by hand and report task performance instead of learning gain. DeepTutor's TutorBench evaluates interactive, profile-conditioned tutoring {cite}`deeptutor_2026`, and nothing directly comparable exists for music practice over time.

---
title: Music as Images
authors:
  - name: Zachary Novack
---

Any vision-language model (VLM) can look at a picture of a score. No music
training is needed to send one: the image goes through the same route as a
photo. This makes score images the cheapest way to give music to a frontier
model, and one of the hardest for the model to use.

(sec-und-score-images)=
## Scores as images

A score image can be rendered from a file, as in {numref}`fig-und-score`, or
scanned or photographed from paper. Either way, the image holds symbols, not
notes. To answer "what key is this in?", a model has to find the key signature,
read the clefs, and connect noteheads to staff positions, which is the job of
optical music recognition. Scores are dense: one bar of piano music can hold
dozens of small symbols whose meaning depends on their exact vertical position
and on symbols elsewhere on the page, such as the clef and key signature at the
start of the line.

VLMs get their images in the same ways that audio LLMs get their audio
([](#sec-und-encoders)). Most use a vision encoder and an adapter. LLaVA uses a
CLIP ViT-L/14 encoder and a linear projection [@liu_llava_2023]. Qwen2.5-VL
trains its own Vision Transformer at native resolution, and an MLP merges each
group of four neighboring patch features into one token [@bai_qwen25vl_2025].
Others have no vision encoder. Fuyu-8B linearly projects image patches "into the
first layer of the transformer" [@adept_fuyu_2023]; Gemma 4 12B passes 48×48
pixel patches through a single matrix multiplication [@gemma4_2026]; and Inkling
encodes 40×40 pixel patches "using a four-layer hMLP"
[@thinkingmachines_inkling_2026].

Resolution matters for scores. A notehead is a few pixels tall, and a VLM that
shrinks a page to a fixed size can lose the difference between a line and a
space. Native-resolution encoders such as Qwen2.5-VL's keep more detail, but
spend more tokens: Qwen2.5-VL's preprocessing resizes the reel's score image
from 1,507×555 to 1,512×560 pixels, and it becomes 1,080 image tokens, one per
28×28 pixels.

(sec-und-score-findings)=
## What VLMs read on a score

Several benchmarks test VLMs on scores, and they agree that reading the notation
is the weak step.

- **MusiXQA** renders synthetic scores with MusiXTeX and asks questions about
  their notes, text, layout, and chords [@chen_musixqa_2025]. On optical music recognition,
  GPT-4o reaches 4.0 on the paper's accuracy measure, against 68.4 for a
  Phi-3-Vision model fine-tuned on the dataset.
- **NOTA** collects 1,019,237 records of score images and text from three
  regions of the world and trains NotaGPT, which first aligns score images with
  their ABC notation [@tang_notagpt_2025].
- **WildScore** takes 807 questions about score images that people posted on
  the r/musictheory subreddit between 2012 and 2022 [@mundada_wildscore_2025].
  The best model, GPT-4.1-mini, scores 68.31% with the image and 65.76% without
  it. Several open VLMs score *higher* without the image: LLaVA goes from 32.97%
  with it to 37.16% without, and InternVL from 39.34% to 45.54%. A direct
  perception probe, with simple questions such as which clef is shown or how
  many symbols of a kind appear, on 50 images, finds that GPT-4.1-mini perceives
  the relevant symbols correctly in 52% of cases, InternVL in 38%, and LLaVA in
  26%.
- **MSU-Bench** asks 1,800 questions about 150 complete scores by Bach,
  Beethoven, Chopin, Debussy, and others, at four levels: onset information,
  notation and notes, chords and harmony, and texture and form
  [@dai_msubench_2026]. It gives LLMs the score as ABC text and VLMs the score as
  a PDF. The best zero-shot result with ABC is 49.44%; the best with images is
  24.22%. The authors name localization, finding the right bar, as one of "two
  persistent challenges" for VLMs.
- **SSMR-Bench** generates sheet-music questions from music-theory rules as
  programs, with 1,600 text and 1,600 visual questions [@wang_ssmr_2025]. Because
  the answers are computed, they can serve as rewards: after reinforcement
  learning, Qwen2.5-VL-7B rises from 41.81 to 70.56 on the visual questions.

The WildScore result is a warning that returns on the [evaluation
page](#sec-und-needs-music): when the image adds nothing, the model answers from
the question. [Chapter 5](../performing/perceiving_score.md) covers score
formats and the performance markings a score carries, such as dynamics and
articulation, and how current systems handle them.

(sec-und-qwen25-vl)=
## Asking a VLM about the score

Qwen2.5-VL-7B-Instruct is an open VLM on Hugging Face. The code below follows
its model card, with the reel's score image and a question in place of the
card's example:

```python
# pip install transformers accelerate qwen-vl-utils==0.0.8
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info

model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2.5-VL-7B-Instruct", torch_dtype="auto", device_map="auto")
processor = AutoProcessor.from_pretrained("Qwen/Qwen2.5-VL-7B-Instruct")

messages = [
    {"role": "user", "content": [
        {"type": "image", "image": "reel_score.png"},
        {"type": "text", "text": "What key is this piece in, and which notes "
                                 "does the treble staff play in bar 1?"},
    ]},
]

text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
image_inputs, video_inputs = process_vision_info(messages)
inputs = processor(text=[text], images=image_inputs, videos=video_inputs,
                   padding=True, return_tensors="pt").to(model.device)

generated_ids = model.generate(**inputs, max_new_tokens=128)
trimmed = [out[len(inp):] for inp, out in zip(inputs.input_ids, generated_ids)]
print(processor.batch_decode(trimmed, skip_special_tokens=True)[0])
```

The correct answer is D major (two sharps), and D5, F♯5, D5, A4, F♯4, A4.
Compare the answer with the same question asked about the ABC text on the [next
page](#sec-und-text-llm). The image is at
`book/assets/understanding/reel_score.png` in the book's repository.

(sec-und-spectrogram-images)=
## Spectrograms as images

A spectrogram is also an image, so a VLM can "listen" by looking at one. Two
studies tested this.

@dixit_spectrogram_2024 gave VLMs spectrograms of environmental sounds from
ESC-10 and asked them to classify the sound. GPT-4o reached 59.00%
cross-validated accuracy. In a 10-shot setting on the first fold, GPT-4o reached
73.75%, slightly above the 72.50% of human experts who classified the same
spectrograms by eye.

@loakman_seeingisnthearing_2025 asked VLMs to pick the transcription of a spoken
word from its spectrogram, among four options. All models performed around
chance (25%), with and without fine-tuning. A speech recognition model given the
audio reached 87.56%, and a trained phonetician, one of the authors, reached
75.00% on 100 examples from the spectrograms.

Reading a spectrogram is a skill that humans learn too, and for coarse
categories it can work. For fine distinctions, such as phonemes, or for music,
where the reel's notes are a few pixels apart in the CQT panel of
{numref}`fig-und-spectrograms`, an audio encoder sees what the image hides.

---
title: Foundations
authors:
  - name: Keunwoo Choi
---

# Foundations of large language models

## From sequence models to foundation models

An autoregressive model represents a sequence by factorizing its probability:

$$
p(x_{1:T}) = \prod_{t=1}^{T} p(x_t \mid x_{<t}).
$$

Scaling this objective across broad data and tasks yields a reusable model whose
behavior can be adapted through context, instructions, or additional training.

**TODO:** Add a diagram of tokenization → embeddings → transformer → next-token
distribution, followed by a music-specific token example.

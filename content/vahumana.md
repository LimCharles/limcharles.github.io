# vahumana: emotional memory for LLMs

vahumana is a research prototype (2026, Python, PyTorch, Hugging Face Transformers) exploring human-like, lossy, reconstructive emotional memory for large language models.

The idea: human memory is not a tape recorder. It is reconstructive, emotionally weighted and lossy. People remember the gist of experiences, coloured by how they felt. Vivid emotional events are consolidated sharply and mundane ones blur.

How it works:

1. Intercept: forward hooks capture hidden states at each transformer block during inference.
2. Project: a small MLP (hidden size to 128 to 2) maps them into Russell's circumplex emotion space, valence by arousal.
3. Consolidate: states are stored in a persistent memory with Gaussian noise scaled by 1/salience, so important memories are kept more faithfully.
4. Retrieve: emotionally salient memories are recalled by top-k cosine similarity in emotion space and injected back into the residual stream, biasing the next token.

The result is a model whose "mood" and recall change over a conversation without any weight updates. It wraps any Hugging Face causal LM; the examples use Qwen3-0.6B.

Code: https://github.com/LimCharles/vahumana

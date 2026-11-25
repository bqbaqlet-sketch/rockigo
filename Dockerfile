FROM node:24-bookworm-slim

WORKDIR /opt/rockigo
ENV ROCKIGO_RUNTIME=/opt/rockigo-runtime \
    ROCKIGO_MODEL_PATH=/opt/rockigo-runtime/Qwen3.5-0.8B-Q4_0.gguf \
    ROCKIGO_BIND=0.0.0.0 \
    PORT=8080

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/rockigo-runtime/wasm \
    && curl --fail --show-error --location --retry 2 \
      https://registry.npmjs.org/@wllama/wllama/-/wllama-4.0.0.tgz -o /tmp/wllama.tgz \
    && echo '7c80d64651cf4fd27e90b428b8bd0f3d25587eb9cdcf75a429103642f2425be81df05939d0c35f7b5b63fe97abec41bad0243077c805bda2bf0e81c7cedb6724  /tmp/wllama.tgz' | sha512sum --check --status \
    && tar -xzf /tmp/wllama.tgz -C /opt/rockigo-runtime/wasm \
    && rm /tmp/wllama.tgz \
    && curl --fail --show-error --location --retry 2 \
      https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF/resolve/main/Qwen3.5-0.8B-Q4_0.gguf \
      -o /opt/rockigo-runtime/Qwen3.5-0.8B-Q4_0.gguf \
    && cd /opt/rockigo-runtime \
    && echo '57d1997790d1744fba5b40a7317df71ea5e2acee28c47e78f0cce39c0703f8cf  Qwen3.5-0.8B-Q4_0.gguf' | sha256sum --check --status

COPY server.mjs lessons.mjs curriculum.mjs science-questions.mjs wasm-runtime.mjs llama-api.mjs model-server.mjs ./
USER node
EXPOSE 8080
CMD ["node", "--experimental-wasm-jspi", "server.mjs", "--api", "--local-ai"]

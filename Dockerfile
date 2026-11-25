FROM node:24-bookworm-slim

WORKDIR /opt/rockigo
ENV ROCKIGO_RUNTIME=/opt/rockigo-runtime \
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
      https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf \
      -o /opt/rockigo-runtime/qwen2.5-0.5b-instruct-q4_k_m.gguf \
    && cd /opt/rockigo-runtime \
    && echo '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db  qwen2.5-0.5b-instruct-q4_k_m.gguf' | sha256sum --check --status

COPY server.mjs lessons.mjs wasm-runtime.mjs ./
USER node
EXPOSE 8080
CMD ["node", "--experimental-wasm-jspi", "server.mjs", "--api"]

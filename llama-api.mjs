export function createLlamaApi({ url, key, model }) {
  if (!url && !key) return null;
  if (!url || !key || !model) throw new Error("Set ROCKIGO_LLAMA_URL, ROCKIGO_LLAMA_KEY and ROCKIGO_LLAMA_MODEL together.");
  const endpoint = new URL(url);
  if (endpoint.protocol !== "http:" || endpoint.hostname !== "127.0.0.1" || !endpoint.port ||
      endpoint.pathname !== "/" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error("ROCKIGO_LLAMA_URL must be an HTTP address on 127.0.0.1 with an explicit port.");
  }
  if (!/^[!-~]{24,256}$/.test(key) || !/^[\w.-]{1,80}$/.test(model)) {
    throw new Error("The local model name or API key has an invalid format.");
  }

  async function request(path, { body, signal }) {
    const response = await fetch(new URL(path, endpoint), {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${key}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal,
      redirect: "error"
    });
    if (!response.ok) throw new Error(`Local model returned HTTP ${response.status}.`);
    return response.json();
  }

  return {
    model,
    async ready() {
      try {
        const response = await request("/v1/models", { signal: AbortSignal.timeout(1800) });
        return response.data?.some(item => item.id === model) === true;
      } catch {
        return false;
      }
    },
    createChatCompletion({ abortSignal, ...options }) {
      return request("/v1/chat/completions", {
        body: { ...options, model, stream: false },
        signal: abortSignal ?? AbortSignal.timeout(75000)
      });
    }
  };
}

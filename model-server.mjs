import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { loadWasm } from "./wasm-runtime.mjs";

function sendJson(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value));
}

export async function startPrivateModel(runtime, weights) {
  await access(weights);
  await access(join(runtime, "wasm", "package", "esm", "wasm", "wllama.wasm"));
  const host = "127.0.0.1";
  const model = "Qwen3.5-0.8B";
  const key = randomBytes(32).toString("base64url");
  const expected = Buffer.from(`Bearer ${key}`);
  let engine, busy = false;

  const listener = createServer(async (req, res) => {
    const supplied = Buffer.from(req.headers.authorization ?? "");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return sendJson(res, 401, { error: "API key required" });
    }
    if (req.method === "GET" && req.url === "/v1/models") {
      return sendJson(res, 200, { data: [{ id: model }] });
    }
    if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
      return sendJson(res, 404, { error: "Unknown model endpoint" });
    }
    if (busy) return sendJson(res, 503, { error: "Model busy" });

    busy = true;
    const interrupted = new AbortController();
    res.on("close", () => { if (!res.writableEnded) interrupted.abort(); });
    try {
      let body = "";
      let bytes = 0;
      req.setEncoding("utf8");
      for await (const chunk of req) {
        bytes += Buffer.byteLength(chunk);
        if (bytes > 16_384) return sendJson(res, 413, { error: "Model request too large" });
        body += chunk;
      }
      let options;
      try { options = JSON.parse(body); }
      catch { return sendJson(res, 400, { error: "Invalid JSON" }); }
      if (options?.model !== model || !Array.isArray(options.messages) || !options.messages.length) {
        return sendJson(res, 400, { error: "Invalid model request" });
      }
      engine ??= loadWasm(runtime, weights).catch(error => { engine = null; throw error; });
      const instance = await engine;
      const result = await instance.createChatCompletion({
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        response_format: options.response_format,
        chat_template_kwargs: { enable_thinking: false },
        abortSignal: AbortSignal.any([interrupted.signal, AbortSignal.timeout(70000)])
      });
      if (!res.destroyed) sendJson(res, 200, result);
    } catch (error) {
      if (!interrupted.signal.aborted) console.error("Local model failed:", error.name);
      if (!res.destroyed) sendJson(res, 500, { error: "Local model unavailable" });
    } finally {
      busy = false;
    }
  });
  await new Promise((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, host, resolve);
  });
  return { url: `http://${host}:${listener.address().port}`, key, model };
}

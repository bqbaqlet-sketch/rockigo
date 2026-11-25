import { Worker as NodeWorker } from "node:worker_threads";
import { openAsBlob } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolveObjectURL } from "node:buffer";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const workerPrelude = `
import { parentPort } from "node:worker_threads";
import { createRequire } from "node:module";
import { join } from "node:path";
const __dirname = process.cwd();
const __filename = join(__dirname, "wasm-runtime.mjs");
const require = createRequire(__filename);
globalThis.self = globalThis;
globalThis.WorkerGlobalScope = class WorkerGlobalScope {};
globalThis.WorkerNavigator = navigator.constructor;
globalThis.location = { href: "https://localhost/" };
globalThis.postMessage = (value, transfer) => parentPort.postMessage(value, transfer);
globalThis.close = () => parentPort.close();
let current;
Object.defineProperty(globalThis, "onmessage", { get: () => current, set: callback => { current = callback; } });
parentPort.on("message", value => current?.({ data: value }));
globalThis.addEventListener = (name, handler) => {
  if (name === "message") parentPort.on("message", value => handler.call(globalThis, { data: value }));
};
globalThis.removeEventListener = () => {};
`;

class WebWorker {
  constructor(url) {
    const source = resolveObjectURL(url);
    if (!source) throw new Error("Не удалось прочитать код работника модели.");
    this.ready = source.text().then(text => {
      const payload = Buffer.from(workerPrelude + "\n" + text).toString("base64");
      const worker = new NodeWorker(new URL("data:text/javascript;base64," + payload));
      worker.on("message", data => this.onmessage?.({ data }));
      worker.on("error", error => this.onerror?.(error));
      return worker;
    });
    this.ready.catch(error => this.onerror?.(error));
  }
  postMessage(value, transfer) {
    this.ready.then(worker => worker.postMessage(value, transfer)).catch(error => this.onerror?.(error));
  }
  terminate() { return this.ready.then(worker => worker.terminate()); }
}

const logger = {
  debug() {},
  log() {},
  warn(...values) { console.warn(values[0]?.message ?? values[0]); },
  error(...values) { console.error(values[0]?.message ?? values[0]); }
};

export async function loadWasm(runtime, model) {
  globalThis.self ??= globalThis;
  globalThis.Worker ??= WebWorker;
  const wasmDirectory = join(runtime, "wasm", "package", "esm");
  const wasmUrl = pathToFileURL(join(wasmDirectory, "wasm", "wllama.wasm")).href;
  globalThis.location ??= { href: wasmUrl };
  const builtInFetch = globalThis.fetch;
  globalThis.fetch = (resource, options) => String(resource) === wasmUrl
    ? readFile(new URL(wasmUrl)).then(buffer => new Response(buffer, {
        headers: { "Content-Type": "application/wasm" }
      }))
    : builtInFetch(resource, options);
  try {
    const { Wllama } = await import(pathToFileURL(join(wasmDirectory, "index.js")).href);
    const engine = new Wllama({ default: wasmUrl }, {
      cacheManager: {}, modelManager: {}, logger, suppressNativeLog: true
    });
    await engine.loadModel([await openAsBlob(model)], { n_gpu_layers: 0, n_threads: 1, n_ctx: 2048 });
    return engine;
  } finally {
    globalThis.fetch = builtInFetch;
  }
}

"use client";

// Lazy loader for the Go→WASM module (public/go/portfolio.wasm).
// Returns null if the module isn't present (e.g. not yet compiled), so callers
// can fall back gracefully.

interface GoRuntime {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): Promise<void>;
}
interface GoConstructor {
  new (): GoRuntime;
}

declare global {
  interface Window {
    Go?: GoConstructor;
    __goStats?: (json: string) => string;
    __goVersion?: () => string;
  }
}

export interface GoApi {
  stats(json: string): string;
  version(): string;
}

let loadPromise: Promise<GoApi | null> | null = null;

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector("script[data-go-exec]")) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.dataset.goExec = "1";
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("failed to load wasm_exec.js"));
    document.head.appendChild(el);
  });

async function init(): Promise<GoApi | null> {
  if (typeof window === "undefined") return null;

  const resp = await fetch("/go/portfolio.wasm", { cache: "force-cache" });
  if (!resp.ok) return null; // not compiled / not deployed

  await loadScript("/go/wasm_exec.js");
  const GoCtor = window.Go;
  if (!GoCtor) return null;

  const go = new GoCtor();
  const bytes = await resp.arrayBuffer();
  const result = await WebAssembly.instantiate(bytes, go.importObject);
  // main() registers the globals then blocks on select{} — do NOT await run().
  void go.run(result.instance);

  // Wait for the exported functions to register.
  for (let i = 0; i < 50; i++) {
    if (typeof window.__goStats === "function") break;
    await new Promise((r) => setTimeout(r, 20));
  }
  if (typeof window.__goStats !== "function") return null;

  return {
    stats: (json: string) => window.__goStats!(json),
    version: () =>
      typeof window.__goVersion === "function" ? window.__goVersion() : "go",
  };
}

export function loadGo(): Promise<GoApi | null> {
  if (!loadPromise) loadPromise = init().catch(() => null);
  return loadPromise;
}

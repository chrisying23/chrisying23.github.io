#!/usr/bin/env node
// OpenRouter image generation helper for the baoyu-comic skill.
// Reads a prompt file (YAML frontmatter + body), POSTs to OpenRouter /api/v1/images,
// decodes the returned base64 image and writes it to the requested output path.
//
// Usage:
//   node openrouter-image.mjs --prompt prompts/01-page-foo.md --out 01-page-foo.png
// Optional flags: --model <slug> --aspect 3:4 --quality high --resolution 2K
//                 --seed <int> --format png --steps <int> --guidance <float>
//                 --ref <image>   (repeatable; attached as input_references)
// Reads OPENROUTER_API_KEY from the process env or from <repo-root>/.env

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
}
function all(name) {
  const out = [];
  process.argv.forEach((v, i) => {
    if (v === name && process.argv[i + 1] !== undefined) out.push(process.argv[i + 1]);
  });
  return out;
}
function has(name) {
  return process.argv.indexOf(name) !== -1;
}

function mimeFor(file) {
  switch (extname(file).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

const promptFile = arg("--prompt");
const outFile = arg("--out");
if (!promptFile || !outFile) {
  console.error("Usage: node openrouter-image.mjs --prompt <file.md> --out <file.png> [--model slug] [--aspect 3:4] [--quality high] [--seed N]");
  process.exit(1);
}

// ---- API key from env or .env at repo root ----
let apiKey = process.env.OPENROUTER_API_KEY || "";
if (!apiKey) {
  // .env lives at the repo root; script may live under .opencode/skills/.../scripts
  for (const p of [
    resolve(here, "../../../../.env"), // skill scripts dir -> project root
    resolve(process.cwd(), ".env"),
  ]) {
    if (existsSync(p)) {
      const env = readFileSync(p, "utf8");
      const m = env.match(/^\s*OPENROUTER_API_KEY\s*=\s*["']?([^"'\r\n]+)/m);
      if (m) { apiKey = m[1]; break; }
    }
  }
}
if (!apiKey) {
  console.error("OPENROUTER_API_KEY not found in env or .env");
  process.exit(1);
}

// ---- parse prompt file (frontmatter) ----
let promptBody = readFileSync(promptFile, "utf8");
const meta = {};
const fmMatch = promptBody.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
if (fmMatch) {
  for (const line of fmMatch[1].split(/\r?\n/)) {
    const mm = line.match(/^\s*([\w_-]+)\s*:\s*(.*?)\s*$/);
    if (mm) meta[mm[1]] = mm[2].replace(/^["']|["']$/g, "");
  }
  promptBody = promptBody.slice(fmMatch[0].length).trim();
}

const payload = {
  model: arg("--model", meta.model || "black-forest-labs/flux.2-max"),
  prompt: promptBody,
  n: 1,
  output_format: arg("--format", meta.output_format || "png"),
  aspect_ratio: arg("--aspect", meta.aspect_ratio || "3:4"),
};

if (meta.resolution || has("--resolution")) payload.resolution = arg("--resolution", meta.resolution);
if (meta.quality || has("--quality")) payload.quality = arg("--quality", meta.quality);
const seed = arg("--seed", meta.seed);
if (seed) payload.seed = Number(seed);

// reference images -> input_references (base64 data URLs)
const refFiles = all("--ref");
if (refFiles.length) {
  payload.input_references = refFiles.map((f) => {
    if (!existsSync(f)) {
      console.error(`Reference image not found: ${f}`);
      process.exit(1);
    }
    const b64 = readFileSync(f).toString("base64");
    return { type: "image_url", image_url: { url: `data:${mimeFor(f)};base64,${b64}` } };
  });
  console.log(`Attaching ${payload.input_references.length} reference image(s)`);
}

// provider-specific passthrough for Black Forest Labs endpoints
const providerOpts = {};
if (has("--steps") || meta.steps) providerOpts.steps = Number(arg("--steps", meta.steps));
if (has("--guidance") || meta.guidance) providerOpts.guidance = Number(arg("--guidance", meta.guidance));
if (Object.keys(providerOpts).length) {
  payload.provider = { options: { "black-forest-labs": providerOpts } };
}

console.log(`Generating: ${payload.model}  (${payload.aspect_ratio}, ${payload.output_format})`);
const started = Date.now();

const resp = await fetch("https://openrouter.ai/api/v1/images", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const text = await resp.text();
let json;
try { json = JSON.parse(text); } catch { json = null; }

if (!resp.ok) {
  console.error(`HTTP ${resp.status}`);
  console.error(json ? JSON.stringify(json, null, 2) : text);
  process.exit(1);
}

const data = json.data && json.data[0];
if (!data || !data.b64_json) {
  console.error("No image in response:", JSON.stringify(json, null, 2));
  process.exit(1);
}

const buf = Buffer.from(data.b64_json, "base64");
writeFileSync(outFile, buf);

const usage = json.usage || {};
console.log(`Saved ${outFile} (${(buf.length / 1024).toFixed(1)} KB) in ${((Date.now() - started) / 1000).toFixed(1)}s`);
if (usage.cost != null) console.log(`Cost: $${Number(usage.cost).toFixed(4)}`);

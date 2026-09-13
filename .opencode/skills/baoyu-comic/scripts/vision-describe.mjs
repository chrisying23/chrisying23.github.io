#!/usr/bin/env node
// Sends an image to a vision-capable OpenRouter chat model and prints the analysis.
// Usage: node vision-describe.mjs --image <path> [--prompt <text>] [--model <slug>]

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
}

const imagePath = arg("--image");
const model = arg("--model", "google/gemini-2.5-flash");
const promptText = arg(
  "--prompt",
  "Analyze this character reference image. For EACH person shown (use the label/name shown next to their face if present), give a concise structured description for use in an image-generation character sheet. Fields per person: face shape; skin tone; hair (color, length, style, parting); eyebrows; eyes (color, shape, size, any glasses); nose; mouth/lips; facial hair if any; age cues (wrinkles, lines); distinguishing marks (moles, earrings, etc.); overall vibe. If the label text is unclear, identify them by position (left-to-right, top-to-bottom)."
);
if (!imagePath) {
  console.error("Usage: node vision-describe.mjs --image <path> [--prompt text] [--model slug]");
  process.exit(1);
}

let apiKey = process.env.OPENROUTER_API_KEY || "";
if (!apiKey) {
  for (const p of [resolve(".env"), resolve("../../.env")]) {
    if (existsSync(p)) {
      const m = readFileSync(p, "utf8").match(/^\s*OPENROUTER_API_KEY\s*=\s*["']?([^"'\r\n]+)/m);
      if (m) { apiKey = m[1]; break; }
    }
  }
}
if (!apiKey) { console.error("OPENROUTER_API_KEY not found"); process.exit(1); }

const b64 = readFileSync(imagePath).toString("base64");

const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
        ],
      },
    ],
  }),
});

const json = await resp.json().catch(() => null);
if (!resp.ok) {
  console.error(`HTTP ${resp.status}`, json ? JSON.stringify(json) : "(unparseable)");
  process.exit(1);
}
console.log(json.choices?.[0]?.message?.content || JSON.stringify(json));

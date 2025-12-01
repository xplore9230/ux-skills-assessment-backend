#!/usr/bin/env node
import { readdirSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const src = join(rootDir, "server_py", "pregenerated_data");
const dest = join(rootDir, "api", "pregenerated_data");

if (!existsSync(src)) {
  console.warn("Source pregenerated_data not found:", src);
  process.exit(0);
}

if (!existsSync(dest)) {
  mkdirSync(dest, { recursive: true });
}

const files = readdirSync(src).filter((f) => f.endsWith(".json"));
let copied = 0;

for (const file of files) {
  try {
    copyFileSync(join(src, file), join(dest, file));
    copied++;
  } catch (error) {
    console.error(`Error copying ${file}:`, error);
  }
}

console.log(`Copied ${copied} pregenerated JSON files to api/pregenerated_data`);


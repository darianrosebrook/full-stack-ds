#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const generatedRoot = path.join(
  repoRoot,
  "packages",
  "ds-figma-plugin",
  "src",
  "generated",
);

const slim = (d) => ({
  schemaVersion: d.schemaVersion,
  component: d.component,
  variants: d.variants,
  css: d.css ? { blocks: d.css.blocks } : undefined,
});

const read = (p) =>
  JSON.parse(fs.readFileSync(path.join(generatedRoot, p), "utf8"));

const bundle = {
  stack: read("primitives/Stack/Stack.figma.json"),
  button: slim(read("components/Button/Button.figma.json")),
  chip: slim(read("components/Chip/Chip.figma.json")),
  status: slim(read("components/Status/Status.figma.json")),
  label: slim(read("components/Label/Label.figma.json")),
  avatar: slim(read("components/Avatar/Avatar.figma.json")),
};

process.stdout.write(JSON.stringify(bundle));

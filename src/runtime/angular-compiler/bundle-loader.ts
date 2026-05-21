// Node-side bundle loader for the Angular preview pipeline.
//
// The showcase normally reads the bundle via virtual:fsds/data inside the Vite
// graph. The Angular Vite plugin runs server-side (in configureServer / fs
// watchers / dev middleware) where the virtual module isn't resolvable, so it
// needs a direct disk read. This module wraps the existing buildBundle helper
// from the data plugin instead of duplicating the contract-walking logic.

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Bundle } from "../../types/data";
import { buildBundle } from "../../../vite-plugin-fsds-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

export async function loadBundleFromDisk(): Promise<Bundle> {
  return buildBundle(REPO_ROOT) as Promise<Bundle>;
}

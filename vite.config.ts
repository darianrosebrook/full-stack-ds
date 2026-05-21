import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fsdsData from "./vite-plugin-fsds-data";
import { angularPreviewPlugin } from "./src/runtime/angular-compiler/vite-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Framework plugins are listed below the React showcase plugin. Their default
// include patterns are already extension-scoped (`*.vue`, `*.svelte`,
// `*.svelte.ts`) so they don't claim files outside their workspace; the
// preview pipeline's per-framework Vite plugin (see ADR-PREVIEW-PIPELINE-001
// step 2+) will additionally serve `/preview/<fw>/...` routes that compose
// these transforms.
export default defineConfig({
  plugins: [
    react(),
    vue(),
    svelte({ configFile: false }),
    fsdsData(),
    angularPreviewPlugin(),
  ],
  resolve: {
    alias: {
      "@full-stack-ds/react": path.resolve(
        __dirname,
        "packages/ds-react/src/index.ts",
      ),
    },
  },
});

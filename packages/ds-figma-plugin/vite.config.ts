import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, type UserConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");

/**
 * Read the built `dist/ui.html` (assets already inlined by `inlineUiAssets`
 * below) so the plugin bundle can `figma.showUI(__html__)` without a runtime
 * fetch. `manifest.json`'s "ui" field also points Figma Desktop directly at
 * `dist/ui.html`, but `figma.showUI` needs the markup as a string constant
 * baked into `dist/plugin.js` at build time (spec A5: if `dist/ui.html` is
 * missing when the plugin bundle is built, this falls back to soft-fail
 * markup instead of crashing the build or the runtime open).
 */
function readUiHtmlForPlugin(): string {
  const htmlPath = path.join(distDir, "ui.html");
  if (!fs.existsSync(htmlPath)) {
    return "<main>Full Stack DS plugin UI failed to load.</main>";
  }
  return fs.readFileSync(htmlPath, "utf8");
}

/**
 * Figma plugin UI must be a single self-contained HTML string (no external
 * asset requests — the UI iframe has no access to the dist/ directory at
 * runtime). This closeBundle hook runs after the `ui` mode build produces
 * `dist/ui.html` + `dist/assets/*`, inlines the built JS/CSS directly into
 * the HTML, and removes the now-unused `dist/assets` directory (A4: no
 * leftover external asset files).
 */
function inlineUiAssets() {
  return {
    name: "inline-figma-ui-assets",
    closeBundle() {
      const htmlPath = path.join(distDir, "ui.html");
      if (!fs.existsSync(htmlPath)) return;
      let html = fs.readFileSync(htmlPath, "utf8");
      const scripts: string[] = [];
      html = html.replace(
        /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
        (_match, src: string) => {
          const assetPath = path.join(distDir, src.replace(/^\//, ""));
          scripts.push(fs.readFileSync(assetPath, "utf8"));
          return "";
        },
      );
      html = html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        (_match, href: string) => {
          const assetPath = path.join(distDir, href.replace(/^\//, ""));
          const css = fs.readFileSync(assetPath, "utf8");
          return `<style>${css}</style>`;
        },
      );
      if (scripts.length > 0) {
        html = html.replace(
          "</body>",
          `${scripts.map((js) => `<script>${js}</script>`).join("\n")}\n  </body>`,
        );
      }
      fs.writeFileSync(htmlPath, html);
      fs.rmSync(path.join(distDir, "assets"), { recursive: true, force: true });
    },
  };
}

const pluginConfig: UserConfig = {
  define: {
    __html__: JSON.stringify(readUiHtmlForPlugin()),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    target: "es2016",
    minify: false,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, "src/plugin.ts"),
      formats: ["iife"],
      name: "FullStackDsFigmaPlugin",
      fileName: () => "plugin.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        extend: true,
      },
    },
  },
};

const uiConfig: UserConfig = {
  root: path.resolve(__dirname, "src"),
  plugins: [svelte(), inlineUiAssets()],
  resolve: {
    alias: {
      "@full-stack-ds/svelte": path.resolve(
        __dirname,
        "../ds-svelte/src/index.ts",
      ),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: "es2017",
    minify: false,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, "src/ui.html"),
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
};

// `pnpm --filter @full-stack-ds/figma-plugin run build` runs both modes in
// sequence (`vite build --mode ui && vite build --mode plugin`, see
// package.json). The `ui` build must run first: `pluginConfig`'s `define`
// reads `dist/ui.html` synchronously at config-eval time, so the plugin
// bundle only sees a fresh `__html__` if the UI's `dist/ui.html` already
// exists on disk.
export default defineConfig(({ mode }) => (mode === "ui" ? uiConfig : pluginConfig));

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
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
});

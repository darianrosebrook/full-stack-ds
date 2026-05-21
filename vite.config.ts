import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fsdsData from "./vite-plugin-fsds-data";
import { angularPreviewPlugin } from "./src/runtime/angular-compiler/vite-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), fsdsData(), angularPreviewPlugin()],
  resolve: {
    alias: {
      "@full-stack-ds/react": path.resolve(
        __dirname,
        "packages/ds-react/src/index.ts",
      ),
    },
  },
});

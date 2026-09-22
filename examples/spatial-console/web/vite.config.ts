import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";

// One page hosts three framework runtimes: React and Vue need their compiler
// plugins; Lit needs none. Each plugin is scoped to its own file extension so
// the React JSX transform never touches `.vue` SFCs and vice versa.
export default defineConfig({
  plugins: [react({ include: /\.tsx$/ }), vue()],
  // e2e/verify-runtime.mjs targets this port by default.
  server: { port: 5188, strictPort: true },
  // Pages: the spatial console, the typing-cat desk, and the site the desk's
  // device frames load.
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        cat: fileURLToPath(new URL("./cat.html", import.meta.url)),
        site: fileURLToPath(new URL("./site.html", import.meta.url)),
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

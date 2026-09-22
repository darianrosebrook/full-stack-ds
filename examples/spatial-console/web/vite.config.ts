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
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

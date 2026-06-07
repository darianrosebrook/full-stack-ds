import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-native": new URL("./src/test-react-native.tsx", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["src/components/**/*.test.tsx"],
    exclude: ["node_modules/**"],
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The app-local data/API seam lives at examples/operations-dashboard/src and is
// imported as a relative path (../../src/api). Vite serves it directly from
// source; no extra resolver config is needed because the seam ships plain TS.
export default defineConfig({
  plugins: [react()],
});

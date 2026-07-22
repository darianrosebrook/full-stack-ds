import { defineConfig, devices } from "@playwright/test";

// Local dev servers from unrelated projects can occupy :5173; with
// reuseExistingServer playwright would silently reuse the foreign SPA and
// every preview mount times out at data-fsds-ready. FSDS_E2E_PORT (or a full
// FSDS_E2E_BASE) points the suite at a dedicated server instead. Unset, the
// behavior is unchanged.
const port = process.env.FSDS_E2E_PORT ?? "5173";
const baseURL = process.env.FSDS_E2E_BASE ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.FSDS_E2E_PORT
      ? `pnpm exec vite --port ${port} --strictPort`
      : "pnpm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});

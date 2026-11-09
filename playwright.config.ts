import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.ATLAS_TEST_PORT ?? 4178);

/** E2E runs against the production build (`pnpm build` first); `pnpm verify` does both. */
export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  reporter: process.env.CI ? "github" : "list",
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Uses the locally installed Google Chrome, so no browser download is needed.
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
    viewport: { width: 1440, height: 1050 },
    acceptDownloads: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `pnpm exec vp preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});

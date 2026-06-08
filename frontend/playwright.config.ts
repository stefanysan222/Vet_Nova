import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "e2e/audit-report.json" }]],
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    actionTimeout: 8_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.CI
    ? {
        command: "npm run start",
        url: "http://localhost:3001",
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
});

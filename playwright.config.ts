import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8082',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1200 } } },
    { name: 'phone', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run preview:test',
    url: 'http://localhost:8082',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  use: {
    browserName: 'chromium',
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-390',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'mobile-320',
      use: { viewport: { width: 320, height: 700 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'desktop-1440',
      use: { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
    },
  ],
})

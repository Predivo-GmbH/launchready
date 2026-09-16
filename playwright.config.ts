import { defineConfig, devices } from '@playwright/test'

// The test server port was hardcoded to 3001, and nothing stopped `serve` from sliding to the
// next free port. That is safe on GitHub's throwaway runners - one VM per job - but our
// self-hosted host runs ~24 runners for 14 repositories inside ONE network namespace, so a port
// is a fleet-wide resource: anything else holding 3001 (a leftover server, another product's job)
// makes this suite either fail with "already used" or test whatever else is listening. CI now
// takes a free port from the OS (E2E_PORT, set by the workflows) and --no-port-switching makes
// serve fail loudly instead of moving. 3001 stays the local default so nothing changes for local
// development. See standards/deploy-standard.md RULE 3.
const PORT = process.env.E2E_PORT || '3001'
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['./e2e/strip-runner-artifacts.reporter.ts'], ['html']] : 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    // --no-port-switching is `serve`'s equivalent of Vite's --strictPort: without it serve
    // quietly moves to the next free port while Playwright keeps polling this one and the suite
    // tests whatever else is listening there.
    // Local development is unchanged: `npm run dev` already binds 3001, which is the default
    // above. Only CI takes a handed-out port, and only CI can collide with another repository.
    command: process.env.CI ? `npx serve out -l ${PORT} --no-port-switching` : 'npm run dev',
    url: BASE_URL,
    // !CI: locally, reusing a dev server you already have running is a convenience.
    // On CI it is the bug described at the top of this file - never reuse whatever holds the port.
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})

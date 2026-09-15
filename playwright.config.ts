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
  // PINNED OFF test-results/ ITSELF, DELIBERATELY. The reporter above sweeps outputDir whole at
  // onEnd, and test-results/ in this fleet also holds json reports that CI steps read after the
  // suite and screenshots specs write themselves. Nesting keeps the sweep unconditional and
  // still confined to what Playwright wrote.
  outputDir: 'test-results/artifacts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // THE STRIPPER RUNS FIRST, AND THAT ORDER IS LOAD-BEARING. Reporters are called in array
  // order and share one TestResult, so removing an attachment here is what the reporter after
  // it sees - and the base reporter prints `Error Context: <path>` straight out of that array.
  // Registering it after would delete the file and still publish its path into the job log.
  // Playwright writes that error context - an ARIA snapshot of the signed-in page, form-field
  // contents included - for any test that ends with errors, gated on nothing but
  // `errors.length > 0`; no `use:` switch reaches it, and a FLAKY test is enough. See
  // e2e/strip-runner-artifacts.reporter.ts for the whole reasoning.
  reporter: [['./e2e/strip-runner-artifacts.reporter.ts'], ['html']],
  use: {
    baseURL: BASE_URL,
    // NOTHING IS RECORDED WHEN THIS SUITE FAILS (2026-09-15). A trace records what was typed
    // and a screenshot photographs the form it was typed into, and both are written to a
    // SELF-HOSTED runner that 19 repositories share and then uploaded as a CI artifact. The
    // fleet rule is that a secret is never rendered anywhere, and a debugging convenience is
    // not an exception to it. Debug by reading the assertion, or locally with a throwaway
    // account - never by turning these back on in CI.
    //
    // THESE THREE SWITCHES DO NOT CLOSE THE FOURTH CHANNEL. Playwright writes
    // test-results/<test>/error-context.md - an ARIA snapshot of the page, i.e. the signed-in
    // application including the contents of form fields - for any test that ends with errors,
    // gated on nothing but `errors.length > 0`. There is no `use:` option for it. It is removed
    // by the reporter registered above; drop that and this suite starts leaving photographs of
    // a signed-in page on a runner 19 repositories share.
    trace: 'off',
    screenshot: 'off',
    video: 'off',
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

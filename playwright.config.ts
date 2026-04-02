import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm dev',
		port: 5173,
		reuseExistingServer: true,
		timeout: 60_000
	},
	testDir: 'e2e',
	fullyParallel: false,
	workers: 1,
	retries: process.env.CI ? 2 : 1,
	timeout: 60_000,
	expect: {
		timeout: 15_000
	},
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		navigationTimeout: 30_000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});

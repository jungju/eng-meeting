import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 8089);

export default defineConfig({
	webServer: {
		command: `yarn dev --host 127.0.0.1 --port ${port}`,
		port,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'e2e',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'mobile-chrome',
			use: { ...devices['Pixel 5'] }
		}
	]
});

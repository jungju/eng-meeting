import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		css: true,
		alias: {
			// resolve $app/* stubs for unit tests
			'$app/stores': './src/test/mocks/$app/stores.ts',
			'$app/paths': './src/test/mocks/$app/paths.ts',
			'$app/environment': './src/test/mocks/$app/environment.ts'
		}
	}
});

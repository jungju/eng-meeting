import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit()],
	server: {
		fs: {
		  allow: [path.resolve('./static')]
		}
	}
}));

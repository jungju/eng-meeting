import { describe, expect, it } from 'vitest';
import { sanitizeMarkdownHtml } from '$lib/engine/markdown';

describe('sanitizeMarkdownHtml', () => {
	it('removes executable tags and event handlers', () => {
		const html = sanitizeMarkdownHtml('<p onclick="alert(1)">Hi<script>alert(1)</script><strong>there</strong></p>');

		expect(html).toBe('<p>Hi<strong>there</strong></p>');
	});

	it('removes unsafe links while preserving safe markdown links', () => {
		const html = sanitizeMarkdownHtml(
			'<a href="javascript:alert(1)">bad</a><a href="https://example.com" target="_blank">good</a>'
		);

		expect(html).toBe('<a>bad</a><a href="https://example.com" rel="noopener noreferrer">good</a>');
	});

	it('unwraps unsupported formatting instead of keeping raw elements', () => {
		const html = sanitizeMarkdownHtml('<p><span style="color:red">Plain</span> <em data-x="1">text</em></p>');

		expect(html).toBe('<p>Plain <em>text</em></p>');
	});
});

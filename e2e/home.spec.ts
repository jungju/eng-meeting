import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// Home Page E2E Spec
// ═══════════════════════════════════════════════════════════════

test.describe('Home Page', () => {
	test('loads and displays group sections', async ({ page }) => {
		await page.goto('/');

		// Should display group cards
		const sections = page.locator('.group-card');
		await expect(sections.first()).toBeVisible();

		// Should have at least 3 groups
		const count = await sections.count();
		expect(count).toBeGreaterThanOrEqual(3);
	});

	test('each group has a title and item count badge', async ({ page }) => {
		await page.goto('/');

		const firstGroup = page.locator('.group-card').first();
		await expect(firstGroup.locator('.group-header h2')).toBeVisible();
		await expect(firstGroup.locator('.badge-slate')).toBeVisible();
	});

	test('item cards have links to correct routes', async ({ page }) => {
		await page.goto('/');

		const firstLink = page.locator('.item-card').first();
		const href = await firstLink.getAttribute('href');
		expect(href).toMatch(/^\/(sentence|flash|flash2|blank|dialogue|sentencemd|tense)/);
	});

	test('item cards show type badges', async ({ page }) => {
		await page.goto('/');

		const badges = page.locator('.item-card .badge');
		const firstBadge = badges.first();
		await expect(firstBadge).toBeVisible();
		const text = await firstBadge.textContent();
		expect(text).toBeTruthy();
	});
});

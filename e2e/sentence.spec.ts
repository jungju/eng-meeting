import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// Sentence Page E2E Spec
// ═══════════════════════════════════════════════════════════════

test.describe('Sentence Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/sentence/uni');
	});

	test('loads sentence cards from JSON', async ({ page }) => {
		// Wait for sentences to load
		const cards = page.locator('.sentence-card');
		await expect(cards.first()).toBeVisible({ timeout: 5000 });

		const count = await cards.count();
		expect(count).toBeGreaterThan(0);
	});

	test('sentence card shows both English and Korean', async ({ page }) => {
		const firstCard = page.locator('.sentence-card').first();
		await expect(firstCard).toBeVisible({ timeout: 5000 });

		// Should contain both en and ko lines
		const enLine = firstCard.locator('.line.en');
		const koLine = firstCard.locator('.line.ko');
		await expect(enLine).toBeVisible();
		await expect(koLine).toBeVisible();
	});

	test('control bar is displayed with buttons', async ({ page }) => {
		const controlBar = page.locator('.ctrls');
		await expect(controlBar).toBeVisible();

		const buttons = controlBar.locator('.btn');
		const count = await buttons.count();
		expect(count).toBeGreaterThanOrEqual(5); // play, repeat, count, disp, audio, gap, sleep
	});

	test('clicking a sentence card highlights it', async ({ page }) => {
		const firstCard = page.locator('.sentence-card').first();
		await expect(firstCard).toBeVisible({ timeout: 5000 });
		await firstCard.click();

		// After click, card should get active class (playing state)
		await expect(firstCard).toHaveClass(/active/);
	});

	test('display toggle cycles through modes', async ({ page }) => {
		const dispBtn = page.locator('.btn', { hasText: '한/영' });
		await expect(dispBtn).toBeVisible();

		// Click → should change to 영
		await dispBtn.click();
		await expect(page.locator('.btn', { hasText: '영' }).first()).toBeVisible();
	});
});

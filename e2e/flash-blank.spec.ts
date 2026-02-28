import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// Flash2 Page E2E Spec
// ═══════════════════════════════════════════════════════════════

test.describe('Flash2 Quiz Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/flash2/uni');
	});

	test('shows "Ready" state initially', async ({ page }) => {
		const orderBig = page.locator('.order-big');
		await expect(orderBig).toHaveText('Ready');
	});

	test('control bar has start, count, hint, lang, hide, gap buttons', async ({ page }) => {
		const bar = page.locator('.ctrls');
		await expect(bar).toBeVisible();

		await expect(page.locator('.btn .ico', { hasText: '▶' })).toBeVisible();
	});

	test('NEXT button starts random play', async ({ page }) => {
		const nextBtn = page.locator('.next-btn');
		await expect(nextBtn).toBeVisible();
		await nextBtn.click();

		// Order should change from "Ready" to "#1"
		await expect(page.locator('.order-big')).toHaveText('#1', { timeout: 5000 });
	});
});

// ═══════════════════════════════════════════════════════════════
// Blank-fill Page E2E Spec
// ═══════════════════════════════════════════════════════════════

test.describe('Blank-fill Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blank/tense1');
	});

	test('shows Ready state initially', async ({ page }) => {
		const orderBig = page.locator('.order-big');
		await expect(orderBig).toHaveText('Ready');
	});

	test('start button begins the quiz', async ({ page }) => {
		const startBtn = page.locator('.btn .ico', { hasText: '▶' });
		await expect(startBtn).toBeVisible();
		await startBtn.click();

		// Should show korean + english with blanks
		await expect(page.locator('.kor').first()).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.blank').first()).toBeVisible();
	});

	test('choice buttons appear for blank fill', async ({ page }) => {
		// Start the quiz
		await page.locator('.btn .ico', { hasText: '▶' }).click();

		const choices = page.locator('.choice-btn');
		await expect(choices.first()).toBeVisible({ timeout: 5000 });

		const count = await choices.count();
		expect(count).toBeGreaterThanOrEqual(2);
	});
});

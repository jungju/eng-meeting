// ─── Flash quiz engine (pure logic, no DOM/audio) ─────────

export interface FlashState {
	total: number;
	limit: number; // -1 = all
	playedSet: Set<number>;
}

/**
 * Pick a random index not yet played.
 * Returns -1 if the quiz is finished.
 */
export function pickRandomIndex(state: FlashState): number {
	const { total, limit, playedSet } = state;
	const effectiveLimit = limit < 0 ? total : limit;
	if (playedSet.size >= effectiveLimit || playedSet.size >= total) return -1;

	let i: number;
	let guard = 0;
	do {
		i = Math.floor(Math.random() * total);
		guard++;
	} while (playedSet.has(i) && guard < total * 10);
	return playedSet.has(i) ? -1 : i;
}

/**
 * Check if the flash quiz is done.
 */
export function isFlashDone(state: FlashState): boolean {
	const { total, limit, playedSet } = state;
	const effectiveLimit = limit < 0 ? total : limit;
	return playedSet.size >= effectiveLimit || playedSet.size >= total;
}

// ─── Word masking for hint system ────────────────────────────

/**
 * Mask a single word based on hint level:
 *   0 → fully hidden (empty string — caller decides)
 *   1 → all underscores
 *   2 → first letter + underscores
 *   3+ → full word
 */
export function maskWord(word: string, level: number): string {
	if (level === 1) return '_'.repeat(word.length);
	if (level === 2) return word[0] + '_'.repeat(word.length - 1);
	return word;
}

/**
 * Apply masking to an entire sentence based on hint level:
 *   0 → empty string (fully hidden)
 *   1 → all words masked (all underscores)
 *   2 → first letter shown
 *   3 → every other word masked
 *   4 → full sentence
 */
export function maskedSentence(sentence: string, hintLevel: number): string {
	if (hintLevel === 0) return '';
	if (hintLevel === 4) return sentence;
	if (hintLevel === 3) {
		return sentence
			.split(' ')
			.map((w, i) => (i % 2 ? '_'.repeat(w.length) : w))
			.join(' ');
	}
	return sentence
		.split(' ')
		.map((w) => maskWord(w, hintLevel))
		.join(' ');
}

// ─── Flash count / gap config ────────────────────────────────

export const FLASH_COUNTS = [10, 20, 50, -1] as const;
export const FLASH_GAPS = [10_000, 20_000, 30_000, -1] as const;

export function cycleFlashCount(currentIndex: number): number {
	return (currentIndex + 1) % FLASH_COUNTS.length;
}

export function cycleFlashGap(currentIndex: number): number {
	return (currentIndex + 1) % FLASH_GAPS.length;
}

export function flashCountLabel(limit: number): string {
	return limit < 0 ? '전체' : `${limit}개`;
}

export function flashGapLabel(gap: number): string {
	return gap < 0 ? '∞' : `${gap / 1000}s`;
}

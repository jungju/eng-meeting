import { describe, it, expect } from 'vitest';
import {
	pickRandomIndex,
	isFlashDone,
	maskWord,
	maskedSentence,
	cycleFlashCount,
	cycleFlashGap,
	flashCountLabel,
	flashGapLabel,
	FLASH_COUNTS,
	FLASH_GAPS
} from '$lib/engine/flash';
import type { FlashState } from '$lib/engine/flash';

// ═══════════════════════════════════════════════════════════════
// Flash Engine Spec
// ═══════════════════════════════════════════════════════════════

describe('pickRandomIndex', () => {
	it('returns valid index within range', () => {
		const state: FlashState = { total: 10, limit: -1, playedSet: new Set() };
		const idx = pickRandomIndex(state);
		expect(idx).toBeGreaterThanOrEqual(0);
		expect(idx).toBeLessThan(10);
	});

	it('returns -1 when all are played (limit = total)', () => {
		const state: FlashState = { total: 3, limit: -1, playedSet: new Set([0, 1, 2]) };
		expect(pickRandomIndex(state)).toBe(-1);
	});

	it('returns -1 when limit is reached', () => {
		const state: FlashState = { total: 10, limit: 2, playedSet: new Set([3, 7]) };
		expect(pickRandomIndex(state)).toBe(-1);
	});

	it('never returns an already-played index', () => {
		const played = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		const state: FlashState = { total: 10, limit: -1, playedSet: played };
		const idx = pickRandomIndex(state);
		expect(idx).toBe(9);
	});
});

describe('isFlashDone', () => {
	it('returns false when not at limit', () => {
		expect(isFlashDone({ total: 10, limit: 5, playedSet: new Set([1, 2]) })).toBe(false);
	});

	it('returns true when at limit', () => {
		expect(isFlashDone({ total: 10, limit: 3, playedSet: new Set([1, 2, 5]) })).toBe(true);
	});

	it('returns true when all played (limit = -1)', () => {
		expect(isFlashDone({ total: 3, limit: -1, playedSet: new Set([0, 1, 2]) })).toBe(true);
	});
});

describe('maskWord', () => {
	it('level 1: all underscores', () => {
		expect(maskWord('hello', 1)).toBe('_____');
	});

	it('level 2: first letter + underscores', () => {
		expect(maskWord('hello', 2)).toBe('h____');
	});

	it('level 3+: full word', () => {
		expect(maskWord('hello', 3)).toBe('hello');
	});
});

describe('maskedSentence', () => {
	const sent = 'I love learning English';

	it('level 0: empty string', () => {
		expect(maskedSentence(sent, 0)).toBe('');
	});

	it('level 1: all words fully masked', () => {
		expect(maskedSentence(sent, 1)).toBe('_ ____ ________ _______');
	});

	it('level 2: first letter of each word', () => {
		expect(maskedSentence(sent, 2)).toBe('I l___ l_______ E______');
	});

	it('level 3: every other word masked', () => {
		const result = maskedSentence(sent, 3);
		const words = result.split(' ');
		expect(words[0]).toBe('I');
		expect(words[1]).toBe('____'); // 'love' → 4 underscores
		expect(words[2]).toBe('learning');
		expect(words[3]).toBe('_______'); // 'English' → 7 underscores
	});

	it('level 4: full sentence', () => {
		expect(maskedSentence(sent, 4)).toBe(sent);
	});
});

describe('cycleFlashCount', () => {
	it('cycles through FLASH_COUNTS indices', () => {
		expect(cycleFlashCount(0)).toBe(1);
		expect(cycleFlashCount(FLASH_COUNTS.length - 1)).toBe(0);
	});
});

describe('cycleFlashGap', () => {
	it('cycles through FLASH_GAPS indices', () => {
		expect(cycleFlashGap(0)).toBe(1);
		expect(cycleFlashGap(FLASH_GAPS.length - 1)).toBe(0);
	});
});

describe('flashCountLabel', () => {
	it('returns "전체" for -1', () => {
		expect(flashCountLabel(-1)).toBe('전체');
	});

	it('returns count with 개 suffix', () => {
		expect(flashCountLabel(10)).toBe('10개');
		expect(flashCountLabel(50)).toBe('50개');
	});
});

describe('flashGapLabel', () => {
	it('returns "∞" for -1', () => {
		expect(flashGapLabel(-1)).toBe('∞');
	});

	it('returns seconds', () => {
		expect(flashGapLabel(10_000)).toBe('10s');
		expect(flashGapLabel(20_000)).toBe('20s');
	});
});

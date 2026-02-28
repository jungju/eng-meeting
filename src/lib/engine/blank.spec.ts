import { describe, it, expect } from 'vitest';
import {
	cleanWord,
	shuffle,
	prepareBlanks,
	evaluateChoice,
	buildWordPool,
	calcScore,
	BLANK_COUNTS,
	BLANK_TIMES
} from '$lib/engine/blank';

// ═══════════════════════════════════════════════════════════════
// Blank-fill Engine Spec
// ═══════════════════════════════════════════════════════════════

describe('cleanWord', () => {
	it('strips periods, commas, exclamation marks, question marks', () => {
		expect(cleanWord('hello.')).toBe('hello');
		expect(cleanWord('world!')).toBe('world');
		expect(cleanWord('yes,')).toBe('yes');
		expect(cleanWord('what?')).toBe('what');
	});

	it('returns word unchanged if no punctuation', () => {
		expect(cleanWord('hello')).toBe('hello');
	});

	it('handles multiple punctuation', () => {
		expect(cleanWord('wow!!!')).toBe('wow');
	});
});

describe('shuffle', () => {
	it('returns a new array (does not mutate original)', () => {
		const arr = [1, 2, 3, 4, 5];
		const result = shuffle(arr);
		expect(result).not.toBe(arr);
		expect(result).toHaveLength(arr.length);
	});

	it('contains same elements', () => {
		const arr = [1, 2, 3, 4, 5];
		const result = shuffle(arr);
		expect(result.sort()).toEqual(arr.sort());
	});
});

describe('prepareBlanks', () => {
	const sentence = 'I like to eat apples every day';
	const wordPool = ['I', 'like', 'to', 'eat', 'apples', 'every', 'day', 'the', 'is', 'are'];

	// Simple seeded pseudo-random for deterministic tests
	function seededRandom(seed: number) {
		let s = seed;
		return () => {
			s = (s * 16807 + 0) % 2147483647;
			return s / 2147483647;
		};
	}

	it('creates nodes for every word', () => {
		const { nodes } = prepareBlanks(sentence, wordPool, seededRandom(42));
		expect(nodes).toHaveLength(7); // 7 words
	});

	it('marks some nodes as blank', () => {
		const { nodes } = prepareBlanks(sentence, wordPool, seededRandom(42));
		const blanks = nodes.filter((n) => n.isBlank);
		expect(blanks.length).toBeGreaterThanOrEqual(1);
		expect(blanks.length).toBeLessThanOrEqual(4);
	});

	it('generates blankChoices sorted by index', () => {
		const { blankChoices } = prepareBlanks(sentence, wordPool, seededRandom(42));
		for (let i = 1; i < blankChoices.length; i++) {
			expect(blankChoices[i].index).toBeGreaterThan(blankChoices[i - 1].index);
		}
	});

	it('each blankChoice has the correct answer in its choices', () => {
		const { blankChoices, nodes } = prepareBlanks(sentence, wordPool, seededRandom(123));
		for (const bc of blankChoices) {
			const correctWord = cleanWord(nodes[bc.index].text);
			expect(bc.choices).toContain(correctWord);
		}
	});

	it('first blank node is active', () => {
		const { nodes, blankChoices } = prepareBlanks(sentence, wordPool, seededRandom(42));
		if (blankChoices.length > 0) {
			const firstBlankIdx = blankChoices[0].index;
			expect(nodes[firstBlankIdx].active).toBe(true);
		}
	});
});

describe('evaluateChoice', () => {
	it('marks correct answer properly', () => {
		const nodes = [
			{ text: 'I', isBlank: false, active: false, len: 0 },
			{ text: 'like', isBlank: true, active: true, len: 4 },
			{ text: 'apples', isBlank: false, active: false, len: 0 }
		];
		const blankChoices = [{ index: 1, choices: ['like', 'hate', 'eat'] }];

		const result = evaluateChoice(nodes, blankChoices, 0, 'like');
		expect(result.correct).toBe(true);
		expect(result.nodes[1].result).toBe('correct');
		expect(result.nodes[1].isBlank).toBe(false);
		expect(result.done).toBe(true);
	});

	it('marks wrong answer properly', () => {
		const nodes = [
			{ text: 'I', isBlank: false, active: false, len: 0 },
			{ text: 'like', isBlank: true, active: true, len: 4 },
			{ text: 'apples', isBlank: false, active: false, len: 0 }
		];
		const blankChoices = [{ index: 1, choices: ['like', 'hate', 'eat'] }];

		const result = evaluateChoice(nodes, blankChoices, 0, 'hate');
		expect(result.correct).toBe(false);
		expect(result.nodes[1].result).toBe('wrong');
	});

	it('activates next blank when not done', () => {
		const nodes = [
			{ text: 'I', isBlank: true, active: true, len: 1 },
			{ text: 'like', isBlank: false, active: false, len: 0 },
			{ text: 'apples', isBlank: true, active: false, len: 6 }
		];
		const blankChoices = [
			{ index: 0, choices: ['I', 'We'] },
			{ index: 2, choices: ['apples', 'oranges'] }
		];

		const result = evaluateChoice(nodes, blankChoices, 0, 'I');
		expect(result.done).toBe(false);
		expect(result.nextBlankPtr).toBe(1);
		expect(result.nodes[2].active).toBe(true);
	});
});

describe('buildWordPool', () => {
	it('extracts unique cleaned words from sentences', () => {
		const sentences = ['I like apples.', 'I eat apples!'];
		const pool = buildWordPool(sentences);
		expect(pool).toContain('I');
		expect(pool).toContain('like');
		expect(pool).toContain('apples');
		expect(pool).toContain('eat');
		// No duplicates
		expect(pool.filter((w) => w === 'apples')).toHaveLength(1);
		expect(pool.filter((w) => w === 'I')).toHaveLength(1);
	});
});

describe('calcScore', () => {
	it('returns 0 for 0 total', () => {
		expect(calcScore(0, 0)).toBe(0);
	});

	it('returns 100 for perfect score', () => {
		expect(calcScore(5, 5)).toBe(100);
	});

	it('rounds correctly', () => {
		expect(calcScore(1, 3)).toBe(33);
		expect(calcScore(2, 3)).toBe(67);
	});
});

describe('config constants', () => {
	it('BLANK_COUNTS has expected values', () => {
		expect(BLANK_COUNTS).toEqual([10, 20, 50, -1]);
	});

	it('BLANK_TIMES has expected values', () => {
		expect(BLANK_TIMES).toEqual([10, 30, -1]);
	});
});

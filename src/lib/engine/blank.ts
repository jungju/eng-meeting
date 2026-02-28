// ─── Blank-fill quiz engine (pure logic) ─────────────────────

const REG_PUNCT = /[.,!?]/g;

/** Strip punctuation for comparison */
export function cleanWord(word: string): string {
	return word.replace(REG_PUNCT, '');
}

/** Fisher-Yates shuffle (returns new array) */
export function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// ─── Types ───────────────────────────────────────────────────

export type RevealState = 'correct' | 'wrong' | undefined;

export interface WordNode {
	text: string;
	isBlank: boolean;
	active: boolean;
	len: number;
	result?: RevealState;
}

export interface BlankChoice {
	index: number;
	choices: string[];
}

// ─── Prepare a blank sentence ────────────────────────────────

export interface PrepareResult {
	nodes: WordNode[];
	blankChoices: BlankChoice[];
}

/**
 * Given a sentence, pick random words to blank out
 * and generate multiple-choice options from a word pool.
 */
export function prepareBlanks(
	sentence: string,
	wordPool: string[],
	randomFn: () => number = Math.random
): PrepareResult {
	const words = sentence.split(' ');
	const picks = new Set<number>();
	const want = Math.min(4, 3 + Math.floor(randomFn() * 2));

	let guard = 0;
	while (picks.size < Math.min(want, words.length) && guard < 1000) {
		picks.add(Math.floor(randomFn() * words.length));
		guard++;
	}

	const blankChoices: BlankChoice[] = [...picks]
		.map((index) => {
			const correct = cleanWord(words[index]);
			const pool = new Set<string>([correct]);
			let g = 0;
			while (pool.size < Math.min(10, wordPool.length + 1) && g < 1000) {
				pool.add(wordPool[Math.floor(randomFn() * wordPool.length)]);
				g++;
			}
			return { index, choices: shuffle([...pool]) };
		})
		.sort((a, b) => a.index - b.index);

	const nodes: WordNode[] = words.map((w, idx) => {
		const isBlank = picks.has(idx);
		return {
			text: w,
			isBlank,
			active: isBlank && idx === blankChoices[0]?.index,
			len: isBlank ? Math.max(cleanWord(w).length, 3) : 0,
			result: undefined
		};
	});

	return { nodes, blankChoices };
}

// ─── Evaluate a choice ──────────────────────────────────────

export interface EvalResult {
	correct: boolean;
	nodes: WordNode[];
	nextBlankPtr: number;
	done: boolean;
}

/**
 * Evaluate a user's choice for the current blank.
 * Returns updated nodes and next pointer.
 */
export function evaluateChoice(
	nodes: WordNode[],
	blankChoices: BlankChoice[],
	blankPtr: number,
	choice: string
): EvalResult {
	const updated = nodes.map((n) => ({ ...n }));
	const { index } = blankChoices[blankPtr];
	const correct = cleanWord(updated[index].text);
	const ok = choice === correct;

	updated[index].isBlank = false;
	updated[index].active = false;
	updated[index].result = ok ? 'correct' : 'wrong';

	const nextPtr = blankPtr + 1;
	const done = nextPtr >= blankChoices.length;

	if (!done) {
		updated[blankChoices[nextPtr].index].active = true;
	}

	return { correct: ok, nodes: updated, nextBlankPtr: nextPtr, done };
}

// ─── Build word pool from sentences ─────────────────────────

export function buildWordPool(sentences: string[]): string[] {
	return [...new Set(sentences.flatMap((t) => t.split(' ').map(cleanWord)))];
}

// ─── Score calculation ──────────────────────────────────────

export function calcScore(correct: number, total: number): number {
	return total ? Math.round((correct / total) * 100) : 0;
}

// ─── Config constants ───────────────────────────────────────

export const BLANK_COUNTS = [10, 20, 50, -1] as const;
export const BLANK_TIMES = [10, 30, -1] as const;

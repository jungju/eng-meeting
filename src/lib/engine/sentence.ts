// ─── Types ───────────────────────────────────────────────────

export interface SentenceData {
	sentences: string[];
	korean: string[];
}

export type RepeatMode = 'none' | 'one' | 'all';
export type DisplayMode = 'both' | 'hideKor' | 'hideEng';
export type AudioLang = 'eng' | 'kor' | 'both';

// ─── Audio queue builder ─────────────────────────────────────

/** Build the audio queue based on audio language setting */
export function buildAudioQueue(audio: AudioLang): string[] {
	switch (audio) {
		case 'both':
			return ['audio', 'audiok'];
		case 'kor':
			return ['audiok'];
		default:
			return ['audio'];
	}
}

/** Build the file path for an audio clip */
export function audioFilePath(base: string, folder: string, index: number): string {
	return `${base}/${folder}/${String(index + 1).padStart(2, '0')}.mp3`;
}

// ─── Repeat cycle ────────────────────────────────────────────

export function cycleRepeat(current: RepeatMode): RepeatMode {
	const order: RepeatMode[] = ['none', 'one', 'all'];
	return order[(order.indexOf(current) + 1) % order.length];
}

// ─── Display cycle ───────────────────────────────────────────

export function cycleDisplay(current: DisplayMode): DisplayMode {
	const order: DisplayMode[] = ['both', 'hideKor', 'hideEng'];
	return order[(order.indexOf(current) + 1) % order.length];
}

// ─── Audio language cycle ────────────────────────────────────

export function cycleAudioLang(current: AudioLang): AudioLang {
	const order: AudioLang[] = ['eng', 'kor', 'both'];
	return order[(order.indexOf(current) + 1) % order.length];
}

// ─── Gap cycle ───────────────────────────────────────────────

export const GAP_VALUES = [0, 1000, 3000, 5000] as const;

export function cycleGap(currentIndex: number): number {
	return (currentIndex + 1) % GAP_VALUES.length;
}

// ─── Repeat count options ────────────────────────────────────

export const REPEAT_COUNT_OPTIONS = [1, 3, 5, 10] as const;

export function cycleRepeatCount(currentIndex: number): number {
	return (currentIndex + 1) % REPEAT_COUNT_OPTIONS.length;
}

// ─── Should continue playing logic ──────────────────────────

export interface PlaybackState {
	repeatMode: RepeatMode;
	repCount: number;
	maxRep: number;
	currentIndex: number;
	totalSentences: number;
	allLoopCount: number;
	maxAllLoop: number;
}

export type PlaybackAction =
	| { type: 'play'; index: number }
	| { type: 'stop' };

/**
 * Determine the next action after an audio clip finishes playing
 * and all queued audio clips are exhausted.
 */
export function nextPlaybackAction(state: PlaybackState): PlaybackAction {
	const { repeatMode, repCount, maxRep, currentIndex, totalSentences, allLoopCount, maxAllLoop } =
		state;

	if (repeatMode === 'all') {
		if (repCount < maxRep) {
			return { type: 'play', index: currentIndex };
		}
		const next = (currentIndex + 1) % totalSentences;
		if (next === 0 && allLoopCount + 1 >= maxAllLoop) {
			return { type: 'stop' };
		}
		return { type: 'play', index: next };
	}

	if (repeatMode === 'one') {
		if (repCount < maxRep) {
			return { type: 'play', index: currentIndex };
		}
		return { type: 'stop' };
	}

	// repeatMode === 'none'
	if (repCount < maxRep) {
		return { type: 'play', index: currentIndex };
	}
	return { type: 'stop' };
}

// ─── Label helpers ───────────────────────────────────────────

export function gapLabel(gapIndex: number): string {
	const v = GAP_VALUES[gapIndex];
	return v ? `${v / 1000}s` : '즉시';
}

export function displayLabel(mode: DisplayMode): string {
	return mode === 'both' ? '한/영' : mode === 'hideKor' ? '영' : '한';
}

export function audioLabel(lang: AudioLang): string {
	return lang === 'eng' ? '영' : lang === 'kor' ? '한' : '모두';
}

export function repeatLabel(mode: RepeatMode): string {
	return mode === 'none' ? '없음' : mode === 'one' ? '문장' : '전체';
}

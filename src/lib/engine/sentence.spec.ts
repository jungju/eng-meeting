import { describe, it, expect } from 'vitest';
import {
	buildAudioQueue,
	audioFilePath,
	cycleRepeat,
	cycleDisplay,
	cycleAudioLang,
	cycleGap,
	cycleRepeatCount,
	nextPlaybackAction,
	gapLabel,
	displayLabel,
	audioLabel,
	repeatLabel,
	GAP_VALUES,
	REPEAT_COUNT_OPTIONS
} from '$lib/engine/sentence';
import type { PlaybackState } from '$lib/engine/sentence';

// ═══════════════════════════════════════════════════════════════
// Sentence Engine Spec
// ═══════════════════════════════════════════════════════════════

describe('buildAudioQueue', () => {
	it('returns ["audio"] for eng', () => {
		expect(buildAudioQueue('eng')).toEqual(['audio']);
	});

	it('returns ["audiok"] for kor', () => {
		expect(buildAudioQueue('kor')).toEqual(['audiok']);
	});

	it('returns ["audio","audiok"] for both', () => {
		expect(buildAudioQueue('both')).toEqual(['audio', 'audiok']);
	});
});

describe('audioFilePath', () => {
	it('builds zero-padded file path', () => {
		expect(audioFilePath('/base', 'audio', 0)).toBe('/base/audio/01.mp3');
		expect(audioFilePath('/base', 'audiok', 9)).toBe('/base/audiok/10.mp3');
		expect(audioFilePath('/base', 'audio', 99)).toBe('/base/audio/100.mp3');
	});
});

describe('cycleRepeat', () => {
	it('cycles none → one → all → none', () => {
		expect(cycleRepeat('none')).toBe('one');
		expect(cycleRepeat('one')).toBe('all');
		expect(cycleRepeat('all')).toBe('none');
	});
});

describe('cycleDisplay', () => {
	it('cycles both → hideKor → hideEng → both', () => {
		expect(cycleDisplay('both')).toBe('hideKor');
		expect(cycleDisplay('hideKor')).toBe('hideEng');
		expect(cycleDisplay('hideEng')).toBe('both');
	});
});

describe('cycleAudioLang', () => {
	it('cycles eng → kor → both → eng', () => {
		expect(cycleAudioLang('eng')).toBe('kor');
		expect(cycleAudioLang('kor')).toBe('both');
		expect(cycleAudioLang('both')).toBe('eng');
	});
});

describe('cycleGap', () => {
	it('cycles through GAP_VALUES indices', () => {
		expect(cycleGap(0)).toBe(1);
		expect(cycleGap(GAP_VALUES.length - 1)).toBe(0);
	});
});

describe('cycleRepeatCount', () => {
	it('cycles through REPEAT_COUNT_OPTIONS indices', () => {
		expect(cycleRepeatCount(0)).toBe(1);
		expect(cycleRepeatCount(REPEAT_COUNT_OPTIONS.length - 1)).toBe(0);
	});
});

describe('nextPlaybackAction', () => {
	const base: PlaybackState = {
		repeatMode: 'all',
		repCount: 0,
		maxRep: 3,
		currentIndex: 0,
		totalSentences: 5,
		allLoopCount: 0,
		maxAllLoop: 100
	};

	describe('repeat mode: all', () => {
		it('replays same sentence when repCount < maxRep', () => {
			const result = nextPlaybackAction({ ...base, repCount: 1 });
			expect(result).toEqual({ type: 'play', index: 0 });
		});

		it('advances to next sentence when repCount reaches maxRep', () => {
			const result = nextPlaybackAction({ ...base, repCount: 3 });
			expect(result).toEqual({ type: 'play', index: 1 });
		});

		it('wraps around to index 0 at the end', () => {
			const result = nextPlaybackAction({ ...base, repCount: 3, currentIndex: 4 });
			expect(result).toEqual({ type: 'play', index: 0 });
		});

		it('stops when allLoopCount reaches maxAllLoop with wrap-around', () => {
			const result = nextPlaybackAction({
				...base,
				repCount: 3,
				currentIndex: 4,
				allLoopCount: 99,
				maxAllLoop: 100
			});
			expect(result).toEqual({ type: 'stop' });
		});
	});

	describe('repeat mode: one', () => {
		it('replays when repCount < maxRep', () => {
			const result = nextPlaybackAction({ ...base, repeatMode: 'one', repCount: 1 });
			expect(result).toEqual({ type: 'play', index: 0 });
		});

		it('stops when repCount reaches maxRep', () => {
			const result = nextPlaybackAction({ ...base, repeatMode: 'one', repCount: 3 });
			expect(result).toEqual({ type: 'stop' });
		});
	});

	describe('repeat mode: none', () => {
		it('replays within maxRep', () => {
			const result = nextPlaybackAction({ ...base, repeatMode: 'none', repCount: 0 });
			expect(result).toEqual({ type: 'play', index: 0 });
		});

		it('stops when repCount reaches maxRep', () => {
			const result = nextPlaybackAction({ ...base, repeatMode: 'none', repCount: 3 });
			expect(result).toEqual({ type: 'stop' });
		});
	});
});

describe('label helpers', () => {
	it('gapLabel returns human-readable gap string', () => {
		expect(gapLabel(0)).toBe('즉시');
		expect(gapLabel(1)).toBe('1s');
		expect(gapLabel(2)).toBe('3s');
		expect(gapLabel(3)).toBe('5s');
	});

	it('displayLabel returns correct labels', () => {
		expect(displayLabel('both')).toBe('한/영');
		expect(displayLabel('hideKor')).toBe('영');
		expect(displayLabel('hideEng')).toBe('한');
	});

	it('audioLabel returns correct labels', () => {
		expect(audioLabel('eng')).toBe('영');
		expect(audioLabel('kor')).toBe('한');
		expect(audioLabel('both')).toBe('모두');
	});

	it('repeatLabel returns correct labels', () => {
		expect(repeatLabel('none')).toBe('없음');
		expect(repeatLabel('one')).toBe('문장');
		expect(repeatLabel('all')).toBe('전체');
	});
});

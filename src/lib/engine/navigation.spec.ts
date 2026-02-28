import { describe, it, expect } from 'vitest';
import { buildSections, linkFor, TYPE_META } from '$lib/engine/navigation';
import type { NavItem, GroupInfo } from '$lib/engine/navigation';

// ═══════════════════════════════════════════════════════════════
// Navigation Engine Spec
// ═══════════════════════════════════════════════════════════════

describe('buildSections', () => {
	const items: NavItem[] = [
		{ id: 'a1', label: 'Alpha', type: 'sentence', group: 'G1' },
		{ id: 'b1', label: 'Beta', type: 'flash', group: 'G2' },
		{ id: 'a2', label: 'Gamma', type: 'sentence', group: 'G1' },
		{ id: 'c1', label: 'Delta', type: 'dialogue', group: 'G3' }
	];

	const groupInfo: Record<string, GroupInfo> = {
		G1: { title: 'Group One', description: 'First group' },
		G2: { title: 'Group Two', description: 'Second group' }
	};

	const groupOrder = ['G1', 'G2', 'G3'];

	it('groups items correctly', () => {
		const sections = buildSections(items, groupInfo, groupOrder);
		expect(sections).toHaveLength(3);
		expect(sections[0].groupName).toBe('G1');
		expect(sections[0].items).toHaveLength(2);
		expect(sections[1].groupName).toBe('G2');
		expect(sections[1].items).toHaveLength(1);
	});

	it('sorts items within groups alphabetically by label', () => {
		const sections = buildSections(items, groupInfo, groupOrder);
		const g1 = sections.find((s) => s.groupName === 'G1')!;
		expect(g1.items[0].label).toBe('Alpha');
		expect(g1.items[1].label).toBe('Gamma');
	});

	it('respects group ordering', () => {
		const sections = buildSections(items, groupInfo, groupOrder);
		expect(sections[0].groupName).toBe('G1');
		expect(sections[1].groupName).toBe('G2');
		expect(sections[2].groupName).toBe('G3');
	});

	it('uses groupInfo titles and descriptions when available', () => {
		const sections = buildSections(items, groupInfo, groupOrder);
		expect(sections[0].title).toBe('Group One');
		expect(sections[0].description).toBe('First group');
	});

	it('falls back to groupName when groupInfo is missing', () => {
		const sections = buildSections(items, groupInfo, groupOrder);
		const g3 = sections.find((s) => s.groupName === 'G3')!;
		expect(g3.title).toBe('G3');
		expect(g3.description).toBe('');
	});

	it('puts unordered groups at the end', () => {
		const extra: NavItem[] = [
			...items,
			{ id: 'z1', label: 'Zeta', type: 'sentence', group: 'ZZZ' }
		];
		const sections = buildSections(extra, groupInfo, groupOrder);
		expect(sections[sections.length - 1].groupName).toBe('ZZZ');
	});
});

describe('linkFor', () => {
	it('builds link with id', () => {
		expect(linkFor({ id: 'uni', label: 'Uni', type: 'sentence', group: 'G' })).toBe(
			'/sentence/uni'
		);
	});

	it('builds link without id', () => {
		expect(linkFor({ label: 'Tense', type: 'tense', group: 'G' })).toBe('/tense');
	});

	it('respects basePath', () => {
		expect(
			linkFor({ id: 'abc', label: 'Test', type: 'flash', group: 'G' }, '/myapp')
		).toBe('/myapp/flash/abc');
	});
});

describe('TYPE_META', () => {
	it('has entries for all known types', () => {
		const expectedTypes = ['sentence', 'sentencemd', 'dialogue', 'flash', 'flash2', 'blank', 'tense'];
		for (const t of expectedTypes) {
			expect(TYPE_META[t]).toBeDefined();
			expect(TYPE_META[t].label).toBeTruthy();
			expect(TYPE_META[t].badge).toBeTruthy();
		}
	});
});

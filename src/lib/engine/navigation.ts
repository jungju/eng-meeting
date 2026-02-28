// ─── Navigation / Item list logic ────────────────────────────

export interface NavItem {
	id?: string;
	label: string;
	type: string;
	group: string;
}

export interface GroupInfo {
	title: string;
	description: string;
}

export interface Section {
	groupName: string;
	title: string;
	description: string;
	items: NavItem[];
}

/**
 * Group items into sections, sorted by group order.
 */
export function buildSections(
	items: NavItem[],
	groupInfo: Record<string, GroupInfo>,
	groupOrder: string[]
): Section[] {
	const grouped: Record<string, NavItem[]> = {};
	for (const item of items) {
		(grouped[item.group] ||= []).push(item);
	}

	return Object.entries(grouped)
		.map(([groupName, groupItems]) => ({
			groupName,
			title: groupInfo[groupName]?.title ?? groupName,
			description: groupInfo[groupName]?.description ?? '',
			items: groupItems.slice().sort((a, b) => a.label.localeCompare(b.label))
		}))
		.sort((a, b) => {
			const orderA = groupOrder.indexOf(a.groupName);
			const orderB = groupOrder.indexOf(b.groupName);
			if (orderA === -1 && orderB === -1) return a.groupName.localeCompare(b.groupName);
			if (orderA === -1) return 1;
			if (orderB === -1) return -1;
			return orderA - orderB;
		});
}

/**
 * Generate the href link for a NavItem.
 */
export function linkFor(item: NavItem, basePath: string = ''): string {
	return `${basePath}/${item.type}${item.id ? `/${item.id}` : ''}`;
}

// ─── Type meta ───────────────────────────────────────────────

export interface TypeMeta {
	label: string;
	badge: string;
}

export const TYPE_META: Record<string, TypeMeta> = {
	sentence: { label: 'Sentence', badge: 'badge badge-blue' },
	sentencemd: { label: 'Doc', badge: 'badge badge-slate' },
	dialogue: { label: 'Dialogue', badge: 'badge badge-purple' },
	flash: { label: 'Flash', badge: 'badge badge-amber' },
	flash2: { label: 'Flash+', badge: 'badge badge-amber' },
	blank: { label: 'Blank', badge: 'badge badge-rose' },
	tense: { label: 'Tense', badge: 'badge badge-emerald' }
};

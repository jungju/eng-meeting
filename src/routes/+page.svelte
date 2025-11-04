<script>
	import { base as b } from "$app/paths";

	const itemsList = [
		{ id: "uni", label: "Sentence Group uni", type: "sentence", group: "JJ" },
		{ id: "uni", label: "uni homework", type: "sentencemd", group: "JJ" },
		{ id: "wirye", label: "Wirye", type: "sentence", group: "JJ" },
		{ id: "wirye0705", label: "Wirye 0705", type: "sentence", group: "JJ" },
		{ id: "jj-daily", label: "JJ-Daily", type: "sentence", group: "JJ" },
		{ id: "story_s1", label: "story_s1", type: "sentence", group: "JJ" },
		{ id: "story_s2", label: "story_s2", type: "sentence", group: "JJ" },
		{ id: "story_s3", label: "story_s3", type: "sentence", group: "JJ" },
		{ id: "story_s4", label: "story_s4", type: "sentence", group: "JJ" },
		{ id: "story_s5", label: "story_s5", type: "sentence", group: "JJ" },
		{ id: "story_s6", label: "story_s6", type: "sentence", group: "JJ" },
		{ id: "story_s7", label: "story_s7", type: "sentence", group: "JJ" },
		{ id: "jj-ex", label: "JJ-EX", type: "sentence", group: "JJ" },
		{ id: "einstein", label: "Albert Einstein", type: "sentence", group: "YS" },
		{ id: "ysword1", label: "YS Vocabulary Practice 6/3", type: "sentence", group: "YS" },
		{ id: "ysword1e", label: "YS Vocabulary Practice Ex 6/3", type: "sentence", group: "YS" },
		{ id: "ysword1", label: "YS Vocabulary Practice 6/3 Test", type: "flash", group: "YS" },
		{ id: "ysword2", label: "YS Vocabulary Practice 6/8", type: "sentence", group: "YS" },
		{ id: "ysword2e", label: "YS Vocabulary Practice Ex 6/8", type: "sentence", group: "YS" },
		{ id: "ysword2", label: "YS Vocabulary Practice 6/8 Test", type: "flash", group: "YS" },
		{ id: "ysword3", label: "YS Vocabulary Practice 6/15", type: "sentence", group: "YS" },
		{ id: "ysword3e", label: "YS Vocabulary Practice Ex 6/15", type: "sentence", group: "YS" },
		{ id: "ysword3", label: "YS Vocabulary Practice 6/15 Test", type: "flash", group: "YS" },
		{ id: "yunsol-v1", label: "YS Vacation 1", type: "sentence", group: "YS" },
		{ id: "yunsol-v1", label: "YS Vacation 1-flash", type: "flash", group: "YS" },
		{ id: "yunsol-v1", label: "YS Vacation 1-flash2", type: "flash2", group: "YS" },
		{ id: "meet1", label: "Dialogue Example meet1", type: "dialogue", group: "My" },
		{ id: "question", label: "Question", type: "sentence", group: "My" },
		{ id: "wh-question-word", label: "wh-question-word", type: "sentence", group: "My" },
		{ id: "ididntexpect", label: "I didn't expect to V~", type: "sentence", group: "Grammar Patterns" },
		{ id: "iknewyou", label: "I knew you'd V", type: "sentence", group: "Grammar Patterns" },
		{ id: "imusedto", label: "I'm used to Ving", type: "sentence", group: "Grammar Patterns" },
		{ id: "itshardformeto", label: "It's hard for me to V", type: "sentence", group: "Grammar Patterns" },
		{ id: "ivealwayswanted", label: "I've always wanted to V", type: "sentence", group: "Grammar Patterns" },
		{ label: "Tense", type: "tense", group: "Grammar Patterns" },
		{ id: "pp1", label: "attempt to, decide to, succeed to", type: "sentence", group: "Grammar Patterns" },
		{ id: "pp-gerund", label: "Past Participle, Gerund", type: "sentence", group: "Grammar Patterns" },
		...Array.from({ length: 20 }, (_, i) => ({
			id: `tense${i + 1}`, label: `Tense Sentence${i + 1}`, type: "sentence", group: "koreng"
		})),
		...Array.from({ length: 20 }, (_, i) => ({
			id: `tense${i + 1}`, label: `Tense Flash${i + 1}`, type: "flash2", group: "koreng"
		})),
		...Array.from({ length: 20 }, (_, i) => ({
			id: `tense${i + 1}`, label: `Tense Blank${i + 1}`, type: "blank", group: "koreng"
		}))
	];

	const groupInfo = {
		JJ: { title: "JJ 세트", description: "대학 과제, 스토리 세트, 일상 문장 모음" },
		YS: { title: "Yunsol 세트", description: "어휘 연습 · 방학 과제 · 플래시 퀴즈" },
		"My": { title: "My Practice", description: "직접 만든 문장/대화" },
		"Grammar Patterns": { title: "Grammar Patterns", description: "패턴 학습, 시제, 분사 연습" },
		koreng: { title: "Kor-Eng Drill", description: "시제별 문장 · 플래시 · 빈칸 연습" }
	};

	const typeMeta = {
		sentence: { label: "Sentence", badge: "badge badge-blue" },
		sentencemd: { label: "Doc", badge: "badge badge-slate" },
		dialogue: { label: "Dialogue", badge: "badge badge-purple" },
		flash: { label: "Flash", badge: "badge badge-amber" },
		flash2: { label: "Flash+", badge: "badge badge-amber" },
		blank: { label: "Blank", badge: "badge badge-rose" },
		tense: { label: "Tense", badge: "badge badge-emerald" }
	};

	const groupOrder = ["JJ", "YS", "My", "Grammar Patterns", "koreng"];

	const groupedItems = itemsList.reduce((acc, item) => {
		(acc[item.group] ||= []).push(item);
		return acc;
	}, {});

	const sections = Object.entries(groupedItems)
		.map(([groupName, items]) => ({
			groupName,
			title: groupInfo[groupName]?.title ?? groupName,
			description: groupInfo[groupName]?.description ?? "",
			items: items.slice().sort((a, b) => a.label.localeCompare(b.label))
		}))
		.sort((a, b) => {
			const orderA = groupOrder.indexOf(a.groupName);
			const orderB = groupOrder.indexOf(b.groupName);
			if (orderA === -1 && orderB === -1) return a.groupName.localeCompare(b.groupName);
			if (orderA === -1) return 1;
			if (orderB === -1) return -1;
			return orderA - orderB;
		});

	const linkFor = (item) => `${b}/${item.type}${item.id ? `/${item.id}` : ""}`;
</script>

<div class="page">
	{#each sections as section}
		<section class="group-card">
			<header class="group-header">
				<div>
					<h2>{section.title}</h2>
					{#if section.description}<p>{section.description}</p>{/if}
				</div>
				<span class="badge badge-slate">{section.items.length} sets</span>
			</header>

			<div class="item-grid">
				{#each section.items as item}
					<a class="item-card" href={linkFor(item)}>
						<div>
							<p class="item-label">{item.label}</p>
							<p class="item-id">{item.id ?? "custom"}</p>
						</div>
						<span class={typeMeta[item.type]?.badge ?? "badge"}>{typeMeta[item.type]?.label ?? item.type}</span>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
:global(body){background:#f7f7fb}
.page{max-width:960px;margin:0 auto;padding:1.5rem}
.group-card{background:white;border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 15px 35px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.05)}
.group-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem}
.group-header h2{font-size:1.4rem;font-weight:700;margin:0;color:#111827}
.group-header p{margin:.2rem 0 0;color:#6b7280;font-size:.95rem}
.item-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.item-card{display:flex;flex-direction:column;justify-content:space-between;padding:1rem;border-radius:.75rem;border:1px solid rgba(15,23,42,.08);background:#fff;min-height:120px;text-decoration:none;transition:transform .15s ease,box-shadow .15s ease,color .15s ease;border-left:4px solid transparent}
.item-card:hover{transform:translateY(-3px);box-shadow:0 12px 20px rgba(15,23,42,.12);border-left-color:#3b82f6}
.item-label{margin:0 0 .5rem;font-size:1.05rem;font-weight:600;color:#0f172a}
.item-id{margin:0;color:#9ca3af;font-size:.9rem}
.badge{display:inline-flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:600;padding:.15rem .55rem;border-radius:999px;background:#e5e7eb;color:#374151;text-transform:uppercase;letter-spacing:.04em}
.badge-blue{background:#dbeafe;color:#1d4ed8}
.badge-slate{background:#e2e8f0;color:#475569}
.badge-purple{background:#e9d5ff;color:#6b21a8}
.badge-amber{background:#fde68a;color:#b45309}
.badge-rose{background:#ffe4e6;color:#be123c}
.badge-emerald{background:#d1fae5;color:#047857}
@media (max-width:640px){
	.page{padding:1rem}
	.group-card{padding:1.25rem}
	.item-card{min-height:100px}
}
</style>

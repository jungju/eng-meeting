<script>
	import { base as b } from "$app/paths";

	const l = [
		// Academy 그룹
		{ id: "uni", label: "Sentence Group uni", type: "sentence", group: "JJ" },
		{ id: "uni", label: "uni homework", type: "sentencemd", group: "JJ" },
		// { id: "uni-may", label: "Sentence Group uni May", type: "sentence", group: "JJ" },
		// { id: "uni-june", label: "Sentence Group uni June", type: "sentence", group: "JJ" },
		{ id: "wirye", label: "Wirye", type: "sentence", group: "JJ" },
		{ id: "wirye0705", label: "Wirye 0705", type: "sentence", group: "JJ" },
		{ id: "jj-daily", label: "JJ-Daily", type: "sentence", group: "JJ" },
		{ id: "jj-ex", label: "JJ-EX", type: "sentence", group: "JJ" },

		// YS 그룹
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

		// Dialogues
		{ id: "meet1", label: "Dialogue Example meet1", type: "dialogue", group: "My" },
        { id: "question", label: "Question", type: "sentence", group: "My" },
		{ id: "wh-question-word", label: "wh-question-word", type: "sentence", group: "My" },

		// Grammar Patterns
		{ id: "ididntexpect", label: "I didn't expect to V~", type: "sentence", group: "Grammar Patterns" },
		{ id: "iknewyou", label: "I knew you'd V", type: "sentence", group: "Grammar Patterns" },
		{ id: "imusedto", label: "I'm used to Ving", type: "sentence", group: "Grammar Patterns" },
		{ id: "itshardformeto", label: "It's hard for me to V", type: "sentence", group: "Grammar Patterns" },
		{ id: "ivealwayswanted", label: "I've always wanted to V", type: "sentence", group: "Grammar Patterns" },
		{ label: "Tense", type: "tense", group: "Grammar Patterns" },
		{ id: "pp1", label: "attempt to, decide to, succeed to", type: "sentence", group: "Grammar Patterns" },
		{ id: "pp-gerund", label: "Past Participle, Gerund", type: "sentence", group: "Grammar Patterns" },
		

		...Array.from({ length: 20 }, (_, i) => ({
		id: `tense${i + 1}`,
		label: `Tense Sentence${i + 1}`,
		type: "sentence",
		group: "koreng"
		})),

		...Array.from({ length: 20 }, (_, i) => ({
		id: `tense${i + 1}`,
		label: `Tense Flash${i + 1}`,
		type: "flash2",
		group: "koreng"
		})),

		...Array.from({ length: 20 }, (_, i) => ({
		id: `tense${i + 1}`,
		label: `Tense Blank${i + 1}`,
		type: "blank",
		group: "koreng"
		}))
	];

	// 그룹별로 항목 분류
  const grouped = {};
  l.forEach(item => {
    const g = item.group || "Others";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(item);
  });
</script>

{#each Object.entries(grouped) as [groupName, items]}
	<h2 class="text-xl font-bold mt-6 mb-2">{groupName}</h2>

	<!-- ① 한 줄 ↓ 수정 : mb-4 → mb-4 grid grid-cols-2 gap-x-4 -->
	<ul class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
		{#each items as x}
			<li class="mb-1 text-lg">
				<a
					href={`${b}/${x.type}${x.id ? `/${x.id}` : ""}`}
					class="text-blue-500 hover:underline"
				>
					{x.label}
				</a>
			</li>
		{/each}
	</ul>
{/each}

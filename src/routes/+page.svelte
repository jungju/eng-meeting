<script>
    import { base as b } from "$app/paths";
    const l = [
        { id: "uni", label: "Sentence Group uni", type: "sentence" },
        { id: "uni-may", label: "Sentence Group uni may", type: "sentence" },
        { id: "question", label: "Question", type: "sentence" },
        { id: "meet1", label: "Dialogue Example meet1", type: "dialogue" },
        { id: "uni", label: "uni homework", type: "sentencemd" },
        { label: "Tense", type: "tense" },
    ];
</script>

<ul>
    {#each l as x}<li>
            <a
                href={`${b}/${x.type}${x.id ? `/${x.id}` : ""}`}
                class="text-blue-500 hover:underline">{x.label}</a
            >
        </li>{/each}
</ul>

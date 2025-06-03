<script>
    import { base as b } from "$app/paths";
    const l = [
        { id: "uni", label: "Sentence Group uni", type: "sentence" },
        // { id: "uni-may", label: "Sentence Group uni may", type: "sentence" },
        { id: "question", label: "Question", type: "sentence" },
        { id: "wh-question-word", label: "wh-question-word", type: "sentence" },
        { id: "wirye", label: "wirye", type: "sentence" },
        { id: "meet1", label: "Dialogue Example meet1", type: "dialogue" },
        { id: "uni", label: "uni homework", type: "sentencemd" },
        { label: "Tense", type: "tense" },
        { id: "einstein", label: "Albert Einstein", type: "sentence" },

        { id: "ididntexpect", label: "I didn't expect to V~", type: "sentence" },
        { id: "iknewyou", label: "I knew you'd V", type: "sentence" },
        { id: "imusedto", label: "I'm used to Ving", type: "sentence" },
        { id: "itshardformeto", label: "It's hard for me to V", type: "sentence" },
        { id: "ivealwayswanted", label: "I've always wanted to V", type: "sentence" },

        { id: "ysword1", label: "YunSol Vocabulary Practice 6/3", type: "sentence" },
        { id: "ysword1e", label: "YunSol Vocabulary Practice Ex 6/3", type: "sentence" },
        
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

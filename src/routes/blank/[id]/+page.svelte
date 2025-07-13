<script lang="ts">
import { onMount } from 'svelte';
import { base } from '$app/paths';
import { page } from '$app/stores';
import ControlBar from '$lib/components/ControlBar.svelte';

const COUNTS = [10, 20, 50, -1];
const TIMES = [10, 30, -1];
const REG_PUNCT = /[.,!?]/g;

$: id = $page.params.id;
$: ASSET_BASE = `${base}/assets/sentence/${id}`;
$: AUDIO_ENG = `${ASSET_BASE}/audio`;

let cntIdx = 0;
$: limit = COUNTS[cntIdx];
let timeIdx = 0;
$: timeLimit = TIMES[timeIdx];

let s: string[] = [], k: string[] = [], wordPool: string[] = [], nodes: WordNode[] = [], blankChoices: BlankChoice[] = [], player: HTMLAudioElement;
let idx = -1, order = 0, finished = false, blankPtr = 0, correctCnt = 0, totalBlanks = 0;
$: score = totalBlanks ? Math.round((correctCnt / totalBlanks) * 100) : 0;

let remaining = 0, timer: ReturnType<typeof setInterval> | undefined;
$: showTime = timeLimit < 0 ? "∞" : `${remaining}s`;

const playedSet = new Set<number>(), playedOrder: number[] = [];

type RevealState = "correct" | "wrong" | undefined;
interface WordNode { text: string, isBlank: boolean, active: boolean, len: number, result?: RevealState }
interface BlankChoice { index: number, choices: string[] }

const clean = (w: string) => w.replace(REG_PUNCT, "");
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a; };
const randIdx = () => { if ((limit >= 0 && playedSet.size >= limit) || playedSet.size === s.length) return -1; let i: number; do i = Math.floor(Math.random() * s.length); while (playedSet.has(i)); return i; };

onMount(async () => {
  const r = await fetch(`${ASSET_BASE}/sentences.json`);
  if (!r.ok) return;
  const d = await r.json();
  s = d.sentences;
  k = d.korean;
  wordPool = [...new Set(s.flatMap((t: string) => t.split(" ").map(clean)))];
});

function startTimer() {
  clearTimer();
  if (timeLimit < 0) return;
  remaining = timeLimit;
  timer = setInterval(() => { remaining--; if (remaining <= 0) { clearTimer(); next(); } }, 1000);
}

function clearTimer() { if (timer) clearInterval(timer); timer = undefined; }

function prepare(i: number) {
  const words = s[i].split(" "), picks = new Set<number>(), want = Math.min(4, 3 + Math.floor(Math.random() * 2));
  while (picks.size < Math.min(want, words.length)) picks.add(Math.floor(Math.random() * words.length));
  blankChoices = [...picks].map(index => {
    const correct = clean(words[index]), pool = new Set<string>([correct]);
    while (pool.size < 10) pool.add(wordPool[Math.floor(Math.random() * wordPool.length)]);
    return { index, choices: shuffle([...pool]) };
  }).sort((a, b) => a.index - b.index);

  nodes = words.map((w, idx) => {
    const asBlank = picks.has(idx);
    return {
      text: w,
      isBlank: asBlank,
      active: asBlank && idx === blankChoices[0].index,
      len: asBlank ? Math.max(clean(w).length, 3) : 0,
      result: undefined
    };
  });

  blankPtr = 0;
  startTimer();
}

function next() {
  const i = randIdx();
  if (i === -1) { finished = true; clearTimer(); return; }
  idx = i;
  order++;
  playedSet.add(i);
  playedOrder.push(i);
  prepare(i);
  totalBlanks += blankChoices.length;
}

function choose(opt: string) {
  const { index } = blankChoices[blankPtr], correct = clean(nodes[index].text), ok = opt === correct;
  if (ok) correctCnt++;
  nodes[index].isBlank = false;
  nodes[index].active = false;
  nodes[index].result = ok ? "correct" : "wrong";
  blankPtr++;
  if (blankPtr < blankChoices.length) nodes[blankChoices[blankPtr].index].active = true;
  else next();
}

function restart() {
  clearTimer();
  idx = -1; order = correctCnt = totalBlanks = remaining = 0;
  finished = false;
  playedSet.clear();
  playedOrder.length = 0;
  nodes = [];
  blankChoices = [];
}

$: buttons = [
  { id: "start", icon: idx === -1 ? "▶" : "⏹" },
  { id: "count", text: limit < 0 ? "전체" : `${limit}개` },
  { id: "time", text: timeLimit < 0 ? "∞" : `${timeLimit}s` }
];

function handleBar(e: CustomEvent<{ id: string }>) {
  const { id } = e.detail;
  if (id === "start") idx === -1 ? next() : restart();
  if (id === "count") { cntIdx = (cntIdx + 1) % COUNTS.length; restart(); }
  if (id === "time") { timeIdx = (timeIdx + 1) % TIMES.length; restart(); }
}
</script>

<style>
.wrapper{position:absolute;top:50px;bottom:120px;left:0;right:0;display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding-top:1rem}
.sentence-box{width:85vw;max-width:900px;min-width:260px;height:clamp(9rem,38vh,18rem);padding:1.6rem 1rem;border:3px solid #ccc;border-radius:1rem;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;user-select:none;overflow-y:auto}
.sentence-box p{word-break:keep-all;white-space:normal;letter-spacing:0px}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,0.6)}70%{box-shadow:0 0 0 18px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}
.playing{animation:pulse 1.4s infinite}
.order-big{position:absolute;top:0.3rem;left:50%;transform:translateX(-50%);font-size:clamp(1.8rem,4.5vw,2.8rem);font-weight:800;color:#2563eb}
.remain-big{position:absolute;bottom:0.3rem;left:50%;transform:translateX(-50%);font-size:clamp(1rem,2.8vw,1.6rem);font-weight:700;color:#16a34a}
.eng,.kor,.placeholder{font-size:clamp(0.95rem,2.8vw,1.6rem);line-height:1.35;margin:0.2rem 0}
.kor{color:#374151}.placeholder{color:#9ca3af}
.next-btn{margin:1rem 0;padding:0.6rem 2rem;font-size:clamp(0.95rem,2.8vw,1.4rem);border-radius:50px;background:#1d4ed8;color:#fff;border:none;cursor:pointer}
.next-btn:hover{background:#2563eb}.result-list{width:92%;max-width:900px;margin:1.5rem auto 2rem;border-top:2px solid #ddd;padding-top:0.7rem}
.result-list h2{text-align:center;font-size:1.15rem;margin-bottom:0.7rem}
.result-item{display:flex;flex-wrap:wrap;gap:0.22rem 0.4rem;margin-bottom:0.4rem;font-size:clamp(0.7rem,1.7vw,0.9rem);cursor:pointer}.num{font-weight:600;color:#2563eb}.txt{word-break:keep-all;white-space:normal}.result-item .eng{flex:1 1 55%}.result-item .kor{flex:1 1 40%;color:#374151}audio{display:none}.timer{position:absolute;top:0;right:0;font-weight:600;color:#f97316}
.blank{display:inline-block;height:1.35em;margin:0 2px;border:2px dashed #cbd5e1;border-radius:4px;background:#f8fafc}
.blank.highlight{border-style:solid;border-color:#1d4ed8;animation:pulseBox 1s infinite}
@keyframes pulseBox{0%,100%{box-shadow:0 0 0 0 rgba(29,78,216,.6)}50%{box-shadow:0 0 0 6px rgba(29,78,216,0)}}
.revealed{font-weight:600}.correct-word{color:#2563eb}.wrong-word{color:#dc2626}
.choices{width:85vw;max-width:900px;min-width:260px;margin:.8rem auto 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.6rem}
.choice-btn{padding:.55rem .4rem;font-size:.95rem;border:1px solid #d1d5db;border-radius:.375rem;background:#fff;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s}
.choice-btn:hover{background:#f3f4f6;border-color:#9ca3af}
.act{background:#d0ebff;font-weight:bold}.ln{display:flex;align-items:center}.idx{margin-right:0.5rem;color:#6b7280;font-weight:bold}
</style>

<main class="wrapper">
  {#if !finished}
    <div class="sentence-box">
      <div class="order-big">{idx === -1 ? "Ready" : `#${order}`}</div>
      {#if timeLimit >= 0 && idx !== -1}
        <div class="timer">⏱ {showTime}</div>
      {/if}
      {#if idx !== -1}
        <p class="kor">{k[idx]}</p>
        <p class="eng">
          {#each nodes as n}
            {#if n.isBlank}
              <span class="blank {n.active ? 'highlight' : ''}" style="width:{n.len}ch;"></span>{' '}
            {:else if n.result === "correct"}
              <span class="revealed correct-word">{n.text}</span>{' '}
            {:else if n.result === "wrong"}
              <span class="revealed wrong-word">{n.text}</span>{' '}
            {:else}{n.text}{' '}
            {/if}
          {/each}
        </p>
      {/if}
    </div>
    {#if idx !== -1 && blankPtr < blankChoices.length}
      <div class="choices">
        {#each blankChoices[blankPtr].choices as w}
          <button class="choice-btn" on:click={() => choose(w)}>{w}</button>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="result-list">
      <h2>정답 : {correctCnt} / {totalBlanks}</h2>
      <h2>점수 : {score}점</h2>
    </div>
  {/if}
</main>

<ControlBar {buttons} on:click={handleBar} />
<audio bind:this={player} playsinline preload="auto" />

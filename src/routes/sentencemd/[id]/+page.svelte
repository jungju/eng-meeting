<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte';
import { page } from '$app/stores';
import { base } from '$app/paths';
import { marked } from 'marked';

interface AudioItem { text: string; file: string }

let lines: {
  text: string;
  file?: string;
  html: string;
  isMatched: boolean;
}[] = [];

let audioList: AudioItem[] = [];
let audio: HTMLAudioElement;
let current = -1;
let isPlaying = false;
let repeatMode: 'none' | 'all' | 'one' = 'none';
let largeText = false;
let hideKorean = false;

const id = $page.params.id;
const ASSET_BASE = `${base}/assets/sentencemd/${id}`;

onMount(async () => {
  const [mdRes, jsonRes] = await Promise.all([
    fetch(`${ASSET_BASE}/main.md`),
    fetch(`${ASSET_BASE}/sentences.json`)
  ]);
  const raw = await mdRes.text();
  audioList = await jsonRes.json();

  const rawLines = raw.split('\n');
  lines = rawLines.map(t => {
    const trimmed = t.trim();
    const found = audioList.find(s => trimmed.startsWith(s.text.trim()));
    return {
      text: trimmed,
      file: found?.file,
      isMatched: !!found,
      html: marked(trimmed)
    };
  });
});

onDestroy(() => audio?.pause());

function nextPlayable(from: number) {
  for (let i = from; i < lines.length; i++) if (lines[i].file) return i;
  return -1;
}

async function play(i: number) {
  i = nextPlayable(i);
  if (i === -1) { isPlaying = false; return; }

  current = i;
  await tick();
  document
    .querySelector(`#s-${i}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  audio?.pause();
  audio = new Audio(`${ASSET_BASE}/audio/${lines[i].file}`);
  try { await audio.play(); } catch { isPlaying = false; return; }
  isPlaying = true;

  audio.onended = () => {
    if (repeatMode === 'one') play(i);
    else if (repeatMode === 'all') play(nextPlayable(i + 1) !== -1 ? nextPlayable(i + 1) : nextPlayable(0));
    else {                       // repeatMode === 'none'
      const n = nextPlayable(i + 1);
      n !== -1 ? play(n) : (isPlaying = false);
    }
  };
}

function togglePlay() {
  if (!audio || audio.ended) {
    play(current === -1 ? 0 : current);
  } else {
    isPlaying ? audio.pause() : audio.play();
    isPlaying = !isPlaying;
  }
}

function toggleRepeat() {
  repeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
}

function toggleSize() { largeText = !largeText; }
const koRegex = /[\u3131-\u318E\uAC00-\uD7A3]+/g;
const stripKo = (t: string) => t.replace(koRegex, '');
</script>

<div>
  {#each lines as s, i}
    <p
      id={"s-" + i}
      class="{current===i?'highlight':s.isMatched?'matched':''} {largeText?'large':'normal'}"
      on:click={() => play(i)}
    >
      {@html hideKorean ? marked(stripKo(s.text)) : s.html}
    </p>
  {/each}
</div>

<div class="controls">
  <button on:click={togglePlay}>{isPlaying?'⏸️':'▶️'}</button>
  <button on:click={toggleRepeat}>
    {repeatMode==='none'?'🔁 없음':repeatMode==='all'?'🔁 전체':'🔂 한 문장'}
  </button>
  <button on:click={toggleSize}>{largeText?'기본':'크게'}</button>
  <button on:click={() => hideKorean=!hideKorean}>{hideKorean?'한글 보기':'영어만 보기'}</button>
</div>

<style>
p{margin:0;padding:2px 4px;cursor:pointer;line-height:1.1}
.normal{font-size:18px}.large{font-size:24px}
.highlight{background:#fffae6}.matched{background:#e0f7fa}
.controls{position:fixed;bottom:0;left:0;right:0;padding:8px;display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
          background:#f5f5f5;border-top:1px solid #ccc}
.controls button{padding:6px 12px;font-size:15px}
</style>

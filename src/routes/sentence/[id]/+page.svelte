<script lang="ts">
import { onMount, tick, onDestroy } from 'svelte';
import { page } from '$app/stores';
import { base } from '$app/paths';

/* ──── 경로 & 상수 ──── */
$: id = $page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1] || '';
$: BASE = `${base}/assets/sentence/${id}`;

/* ──── 상태 ──── */
let s: string[] = [], k: string[] = [], idx = -1;
let player: HTMLAudioElement, p = false;
let r: 'none' | 'one' | 'all' = 'none';
let b = false, o: string[] = [], gapT: ReturnType<typeof setTimeout> | null = null;
const gaps = [0, 1e3, 3e3, 5e3]; let gap = 0;
let display: 'both' | 'hideKor' | 'hideEng' = 'both', audio: 'eng' | 'kor' | 'both' = 'eng', show = true;
const MAX_ALL = 100, opts = [1, 2, 3, 5]; let opt = 0, rep = opts[0];
let repCnt = 0, allCnt = 0, q: string[] = [];

/* ──── 파생 값 ──── */
$: rep = opts[opt];
$: listBtm = show ? `calc(60px + env(safe-area-inset-bottom))` : `env(safe-area-inset-bottom)`;
$: dispLbl = display === 'both' ? '한/영' : display === 'hideKor' ? '영' : '한';
$: audLbl = audio === 'eng' ? '영' : audio === 'kor' ? '한' : '모두';
$: if (r !== 'all') allCnt = 0;

/* ──── 데이터 로드 ──── */
onMount(async () => {
  if (!id) return;
  const res = await fetch(`${BASE}/sentences.json`);
  if (res.ok) { const d = await res.json(); s = d.sentences; k = d.korean; }
});

onDestroy(() => { player?.pause(); gapT && clearTimeout(gapT); });

/* ──── 재생 ──── */
async function play(i: number) {
  if (i < 0 || i >= s.length) return;
  if (i !== idx) repCnt = 0;
  idx = i;
  await tick();
  document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  q = audio === 'both' ? ['audio', 'audiok'] : audio === 'kor' ? ['audiok'] : ['audio'];
  await next();
}

async function next() {
  if (!q.length) { p = false; return; }
  const folder = q.shift()!;
  player.pause();
  player.src = `${BASE}/${folder}/${String(idx + 1).padStart(2, '0')}.mp3`;
  try { await player.play(); p = true; } catch { p = false; }
}

function onEnd() {
  gapT = setTimeout(async () => {
    if (q.length) { await next(); return; }
    if (r === 'one') { await play(idx); return; }
    if (r === 'all') {
      if (++repCnt < rep) { await play(idx); return; }
      repCnt = 0; const n = (idx + 1) % s.length;
      if (!n && ++allCnt >= MAX_ALL) { p = false; r = 'none'; return; }
      await play(n); return;
    }
    if (++repCnt < rep) await play(idx); else p = false;
  }, gaps[gap]);
}
$: player && (player.onended = onEnd);

/* ──── UI 핸들러 ──── */
const tPlay = () => p ? (player.pause(), p = false, q = [], gapT && clearTimeout(gapT)) : play(idx === -1 ? 0 : idx);
const tRepeat = () => r = r === 'none' ? 'one' : r === 'one' ? 'all' : 'none';
const tOpt = () => { if (r !== 'one') opt = (opt + 1) % opts.length; };
const tAudio = () => audio = audio === 'eng' ? 'kor' : audio === 'kor' ? 'both' : 'eng';
const tBlank = () => {
  b = !b;
  if (b) {
    o = [...s];
    s = s.map(t => {
      const w = t.split(' '), len = w.length, hide = len <= 2 ? 1 : len >= 10 ? 3 : 2;
      const set = new Set<number>();
      while (set.size < hide) set.add(Math.floor(Math.random() * len));
      return w.map((word, i) => set.has(i) ? '____' : word).join(' ');
    });
  } else s = [...o];
};
const tDisp = () => display = display === 'both' ? 'hideKor' : display === 'hideKor' ? 'hideEng' : 'both';
const tGap = () => gap = (gap + 1) % gaps.length;
const tShow = () => show = !show;
</script>

<div class="list" style={`bottom:${listBtm}`}>  
  {#if s.length}
    {#each s as t, i}
      <div id={`s-${i}`} class="sent {i===idx ? 'act' : ''}" on:click={() => play(i)}>
        <div class="ln"><span class="idx">{i + 1}.</span>
          <div><div class="en" class:hidden={display === 'hideEng'}>{t}</div>
               <div class="ko" class:hidden={display === 'hideKor'}>{k[i]}</div></div>
        </div>
      </div>
    {/each}
  {:else}<p>로딩...</p>{/if}
</div>

{#if show}
  <div class="ctrls">
    <button class="play" on:click={tPlay}>{p ? '⏸' : '▶'}</button>
    <button on:click={tRepeat}>반복:{r === 'none' ? '없음' : r === 'one' ? '문장' : '전체'}</button>
    <button on:click={tOpt} disabled={r === 'one'} class:dis={r === 'one'}>횟수:{rep}x</button>
    <button on:click={tDisp}>{dispLbl}</button>
    <button on:click={tBlank}>{b ? '원문' : '빈칸'}</button>
    <button on:click={tAudio}>음성:{audLbl}</button>
    <button on:click={tGap}>간격:{gap ? gaps[gap] / 1000 + 's' : '즉시'}</button>
  </div>
{/if}
<button class="bar" on:click={tShow}>{show ? '▽' : '▲'}</button>
<audio bind:this={player} playsinline preload="auto" style="display:none"></audio>

<style>
.list{position:absolute;top:50px;left:0;right:0;bottom:env(safe-area-inset-bottom);overflow-y:auto}
.sent{padding:1rem;margin:.5rem 0;border-radius:.5rem;background:#f9f9f9;cursor:pointer}
.act{background:#d0ebff;font-weight:bold}
.ln{display:flex;align-items:center}
.idx{margin-right:.5rem;color:#6b7280;font-weight:bold}
.en,.ko{font-size:3.2rem}
.ko{color:#374151;margin-top:.25rem}
.hidden{display:none}
.ctrls{position:fixed;left:0;right:0;bottom:env(safe-area-inset-bottom);display:flex;flex-wrap:wrap;gap:.5rem;padding:.5rem .75rem;height:60px;background:#fff;border-top:1px solid #ccc;z-index:10}
.ctrls button{font-size:1.4rem;padding:.6rem 1rem;width:130px}
.play{width:150px;font-size:2.2rem}
.dis,button:disabled{opacity:.35;pointer-events:none}
.bar{position:fixed;right:.75rem;bottom:calc(env(safe-area-inset-bottom)+.75rem);width:60px;height:40px;font-size:1.6rem;text-align:center;background:#fff;border:1px solid #ccc;border-radius:.375rem;z-index:11}
</style>
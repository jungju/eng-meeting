<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';

  /* ────────────────────────── 경로 ────────────────────────── */
  $: id = $page.params.id;
  $: ASSET_BASE = `${base}/assets/sentence/${id}`;

  /* ────────────────────────── 상태 ────────────────────────── */
  let s: string[] = [], k: string[] = [];
  let idx = -1, order = 0;
  let player: HTMLAudioElement;
  let playing = false, waiting = false, pendingNext = false;
  const gaps = [10_000, 20_000, -1];
  let gap = gaps[0];
  let remain = 0, timer: number;

  const playedSet = new Set<number>();
  let playedOrder: number[] = [];
  let finished = false;

  /* ───────────── 데이터 로드 & 키 리스너 ───────────── */
  onMount(async () => {
    const res = await fetch(`${ASSET_BASE}/sentences.json`);
    if (res.ok) {
      const d = await res.json();
      s = d.sentences;
      k = d.korean;
    }
    if (typeof window !== 'undefined') window.addEventListener('keydown', onKey);
  });
  onDestroy(() => {
    player?.pause();
    clearInterval(timer);
    if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey);
  });

  /* ───────────── 키보드 컨트롤 ───────────── */
  function onKey(e: KeyboardEvent) {
    if (finished) return;
    if (['Space', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
      nextRandom();
    } else if (e.code === 'ArrowLeft' && playedOrder.length > 1) {
      e.preventDefault();
      playedOrder.pop();
      play(playedOrder[playedOrder.length - 1], false);
    }
  }

  /* ───────────── 재생 로직 ───────────── */
  function randIdx() {
    if (playedSet.size === s.length) return -1;
    let i: number;
    do i = Math.floor(Math.random() * s.length); while (playedSet.has(i));
    return i;
  }
  async function play(i: number, inc = true) {
    if (i < 0 || i >= s.length) return;
    if (inc) order++;
    idx = i;
    playedSet.add(i);
    if (inc) playedOrder.push(i);
    await tick();

    player.pause();
    player.src = `${ASSET_BASE}/audio/${String(i + 1).padStart(2, '0')}.mp3`;
    try { await player.play(); playing = true; } catch { pendingNext = true; }
  }
  function bindEnded() {
    if (!player) return;
    player.onended = () => {
      playing = false;
      if (pendingNext) { pendingNext = false; nextRandom(); return; }
      if (gap >= 0 && playedSet.size < s.length) { startWaiting(); return; }
      if (playedSet.size === s.length) finished = true;
    };
  }
  $: player && bindEnded();
  function startWaiting() {
    waiting = true;
    remain = Math.ceil(gap / 1000);
    timer = setInterval(() => {
      if (--remain <= 0) { clearInterval(timer); waiting = false; playing ? (pendingNext = true) : nextRandom(); }
    }, 1000);
  }
  function nextRandom() {
    player.pause(); clearInterval(timer);
    playing = waiting = pendingNext = false; remain = 0;
    const i = randIdx();
    if (i === -1) { finished = true; return; }
    play(i);
  }

  /* ───────────── 컨트롤 ───────────── */
  function centerClick() { idx === -1 ? nextRandom() : play(idx, false); }
  function stop() {
    player.pause(); clearInterval(timer);
    playing = waiting = pendingNext = false; idx = -1; order = 0; remain = 0;
    playedSet.clear(); playedOrder = []; finished = false;
  }

  let show: 'none' | 'eng' | 'kor' = 'none';
  function toggleShow() { show = show === 'none' ? 'eng' : show === 'eng' ? 'kor' : 'none'; }
  function setGap(ms: number) { gap = ms; if (waiting) { clearInterval(timer); waiting = false; remain = 0; } }
</script>

<main class="wrapper">
  {#if !finished}
    <div class="sentence-box {(playing||waiting)?'playing':''}" role="button" tabindex="0" on:click={centerClick} on:keydown={(e)=>{if(['Enter',' '].includes(e.key)){e.preventDefault();centerClick();}}}>
      <div class="order-big">{idx===-1?'Ready':`#${order}`}</div>
      {#if gap>=0 && remain>0}<div class="remain-big">{remain}</div>{/if}
      {#if idx!==-1}
        {#if show==='eng'}<p class="eng">{s[idx]}</p>{:else if show==='kor'}<p class="kor">{k[idx]}</p>{:else}<p class="placeholder">•••</p>{/if}
      {/if}
    </div>
    <button class="next-btn" on:click={nextRandom}>NEXT ⏭</button>
  {/if}

  {#if finished}
    <div class="result-list">
      <h2>재생 순서 (클릭·Enter로 다시 듣기)</h2>
      {#each playedOrder as i,n}
        <div class="result-item" role="button" tabindex="0" on:click={()=>play(i,false)} on:keydown={(e)=>{if(['Enter',' '].includes(e.key)){e.preventDefault();play(i,false);}}}>
          <span class="num">{n+1}.</span>
          <span class="eng txt">{s[i]}</span>
          <span class="kor txt">{k[i]}</span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<div class="controls">
  <button on:click={stop}>⏹ 멈춤</button>
  <button on:click={toggleShow}>{show==='none'?'표시:없음':show==='eng'?'표시:영어':'표시:한글'}</button>
  <div class="gap-group">
    {#each gaps as g}
      <button class:selected={gap===g} on:click={()=>setGap(g)}>{g<0?'시간 제한 없음':`${g/1000}s`}</button>
    {/each}
  </div>
</div>

<audio bind:this={player} playsinline preload="auto"></audio>
<style>
  /* ───── 기본 레이아웃 ───── */
  .wrapper {
    position: absolute;
    top: 50px;
    bottom: 120px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    padding-top: 1rem;
  }

  /* ───── 문장 상자 ───── */
  .sentence-box {
    width: 85vw;
    max-width: 900px;
    min-width: 260px;
    height: clamp(9rem, 38vh, 18rem);
    padding: 1.6rem 1rem;
    border: 3px solid #ccc;
    border-radius: 1rem;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    user-select: none;
    overflow-y: auto;          /* 긴 문장 내부 스크롤 */
  }
  .sentence-box p {
    word-break: keep-all;
    white-space: normal;
  }

  /* 플레이 애니메이션 */
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0   rgba(59,130,246,.6); }
    70%  { box-shadow: 0 0 0 18px rgba(59,130,246,0); }
    100% { box-shadow: 0 0 0 0   rgba(59,130,246,0); }
  }
  .playing { animation: pulse 1.4s infinite; }

  /* 순번(위) · 타이머(아래) */
  .order-big  {
    position: absolute;
    top: 0.3rem;
    left: 50%; transform: translateX(-50%);
    font-size: clamp(1.8rem, 4.5vw, 2.8rem);
    font-weight: 800;
    color: #2563eb;
  }
  .remain-big {
    position: absolute;
    bottom: 0.3rem;
    left: 50%; transform: translateX(-50%);
    font-size: clamp(1rem, 2.8vw, 1.6rem);
    font-weight: 700;
    color: #16a34a;
  }

  /* 문장·번역 */
  .eng, .kor, .placeholder {
    font-size: clamp(0.95rem, 2.8vw, 1.6rem);
    line-height: 1.35;
    margin: 0;
  }
  .kor         { color: #374151; }
  .placeholder { color: #9ca3af; }

  /* NEXT 버튼 */
  .next-btn {
    margin: 1rem 0;
    padding: 0.6rem 2rem;
    font-size: clamp(0.95rem, 2.8vw, 1.4rem);
    border-radius: 50px;
    background: #1d4ed8;
    color: #fff;
    border: none;
    cursor: pointer;
  }
  .next-btn:hover { background: #2563eb; }

  /* 하단 컨트롤 바 */
  .controls {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    padding: 0.7rem;
    background: #fff;
    border-top: 1px solid #d1d5db;
    flex-wrap: wrap;
  }
  .gap-group { display: flex; gap: 0.32rem; }
  button.selected {
    font-weight: 700;
    border: 2px solid #1d4ed8;
  }

  /* 결과 리스트 */
  .result-list {
    width: 92%;
    max-width: 900px;
    margin: 1.5rem auto 2rem;
    border-top: 2px solid #ddd;
    padding-top: 0.7rem;
  }
  .result-list h2 {
    text-align: center;
    font-size: 1.15rem;
    margin-bottom: 0.7rem;
  }
  .result-item {
    display: flex;
    flex-wrap: wrap;
    gap: 0.22rem 0.4rem;
    margin-bottom: 0.4rem;
    font-size: clamp(0.7rem, 1.7vw, 0.9rem);
    cursor: pointer;
  }
  .num { font-weight: 600; color: #2563eb; }
  .txt { word-break: keep-all; white-space: normal; }
  .result-item .eng { flex: 1 1 55%; }
  .result-item .kor { flex: 1 1 40%; color: #374151; }

  /* 오디오 태그 숨김 */
  audio { display: none; }
</style>

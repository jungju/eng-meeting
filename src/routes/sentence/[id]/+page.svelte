<script lang="ts">
import { onMount, tick, onDestroy } from 'svelte';
import { page } from '$app/stores';
import { base } from '$app/paths';

// ────────────── 경로 & 리액티브 상수 ──────────────
$: id         = $page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1] || '';
$: ASSET_BASE = `${base}/assets/sentence/${id}`;

// ────────────── 상태 변수 ──────────────
let s: string[] = [], k: string[] = [];
let idx  = -1;                       // 현재 문장 인덱스
let player: HTMLAudioElement;
let p    = false;                    // 재생 중?
let r: 'none' | 'one' | 'all' = 'none'; // 반복 모드
let b    = false;                    // 빈칸 모드
let o: string[] = [];                // 원본 백업
let gapTimer: ReturnType<typeof setTimeout> | null = null;

// 지연 간격 토글
const gaps = [0, 1000, 3000, 5000];
let gapIdx = 0;                      // gaps 배열 인덱스

// 문장/번역 표시 모드
let display: 'both' | 'hideKor' | 'hideEng' = 'both';
$: displayLabel =
  display === 'both'    // 🇰🇷·🇺🇸 모두 보이기
    ? '한/영'
  : display === 'hideKor'  // 한글 숨기기
    ? '영'
  :                         // 영어 숨기기
    '한';

// 🔊 음성(재생 파일) 모드 – 영어 / 한국어 / 모두
let audioMode: 'eng' | 'kor' | 'both' = 'eng';
$: audioModeLabel =
  audioMode === 'eng' ? '영' : audioMode === 'kor' ? '한' : '모두';

// 컨트롤바 표시 여부
let showControls = true;

// ────────────── 라이프사이클 ──────────────
onMount(async () => {
  if (!id) return;
  const res = await fetch(`${ASSET_BASE}/sentences.json`);
  if (res.ok) {
    const d = await res.json();
    s = d.sentences;
    k = d.korean;
  }
});

onDestroy(() => {
  player?.pause();
  if (gapTimer) clearTimeout(gapTimer);
});

// ────────────── 오디오 재생 로직 ──────────────
let langQueue: string[] = [];

async function play(i: number) {
  if (i < 0 || i >= s.length) return;
  idx = i;
  await tick();
  document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  langQueue =
    audioMode === 'both' ? ['audio', 'audiok']
    : audioMode === 'kor' ? ['audiok']
    : ['audio'];

  await playNextLang();
}

async function playNextLang() {
  if (!langQueue.length) { p = false; return; }
  const folder = langQueue.shift()!;
  player.pause();
  player.src = `${ASSET_BASE}/${folder}/${String(idx + 1).padStart(2, '0')}.mp3`;
  try {
    await player.play();
    p = true;
  } catch { p = false; }
}

function handleEnded() {
  player.onended = () => {
    const afterGap = async () => {
      if (langQueue.length) {           // 같은 문장 다른 언어
        await playNextLang();
        return;
      }
      if (r === 'one')          play(idx);          // 같은 문장 반복
      else if (r === 'all')     play((idx + 1) % s.length); // 전체 반복
      else                      p = false;         // 없음 → 종료
    };
    gapTimer = setTimeout(afterGap, gaps[gapIdx]);
  };
}
$: player && handleEnded();

// ────────────── 버튼 핸들러 ──────────────
function tPlay() {
  if (p) {                   // 정지
    player.pause(); p = false; langQueue = [];
    if (gapTimer) { clearTimeout(gapTimer); gapTimer = null; }
  } else {                   // 재생
    play(idx === -1 ? 0 : idx);
  }
}
function tRepeat() {
  r = r === 'none' ? 'one' : r === 'one' ? 'all' : 'none';
}
function cycleAudioMode() {
  audioMode = audioMode === 'eng' ? 'kor' : audioMode === 'kor' ? 'both' : 'eng';
}
function toggleBlankMode() {
  b = !b;
  if (b) {
    o = [...s];
    s = s.map(t => {
      const w = t.split(' ');
      const len = w.length;
      const blanks = len <= 2 ? 1 : len >= 10 ? 3 : 2;
      const picks: number[] = [];
      while (picks.length < blanks) {
        const ri = Math.floor(Math.random() * len);
        if (!picks.includes(ri)) picks.push(ri);
      }
      picks.forEach(j => (w[j] = '____'));
      return w.join(' ');
    });
  } else {
    s = [...o];
  }
}
function cycleDisplay() {
  display = display === 'both' ? 'hideKor'
         : display === 'hideKor' ? 'hideEng' : 'both';
}
function nextGap() { gapIdx = (gapIdx + 1) % gaps.length; }
function toggleControls() { showControls = !showControls; }
</script>

<!-- ────────────── 뷰 ────────────── -->
<div class="list">
  {#if s.length}
    {#each s as text, i}
      <div id={`s-${i}`} class="sent {i===idx?'active':''}" on:click={() => play(i)}>
        <div class="line">
          <div class="idx">{i + 1}.</div>
          <div class="content">
            <!-- 글자 크기는 기본적으로 큼 -->
            <div class="text" class:hidden={display === 'hideEng'}>{text}</div>
            <div class="kor" class:hidden={display === 'hideKor'}>{k[i]}</div>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <p class="loading">문장 데이터를 불러오는 중입니다...</p>
  {/if}
</div>

<!-- ────────────── 컨트롤 바 ────────────── -->
{#if showControls}
  <div class="controls">
    <button class="play-btn" on:click={tPlay}>{p ? '⏸' : '▶'}</button>
    <button on:click={tRepeat}>
      반복:{r === 'none' ? '없음' : r === 'one' ? '문장' : '전체'}
    </button>
    <button on:click={cycleDisplay}>{displayLabel}</button>
    <button on:click={toggleBlankMode}>{b ? '원문 보기' : '빈칸'}</button>
    <button on:click={cycleAudioMode}>음성:{audioModeLabel}</button>
    <button on:click={nextGap}>
      간격:{gapIdx === 0 ? '즉시' : `${gaps[gapIdx]/1000}초`}
    </button>
  </div>
{/if}
<!-- 컨트롤바 유무와 상관없이 항상 렌더링 -->
<button class="bar-toggle" on:click={toggleControls}>
  {showControls ? '▽' : '▲'}
</button>


<audio bind:this={player} playsinline preload="auto" style="display:none"></audio>

<style>
.list{
  position:absolute; top:50px;

  /* 기존: bottom:calc(50px + env(safe-area-inset-bottom)); → 변경 ↓ */
  bottom:calc(60px + env(safe-area-inset-bottom));  /* 컨트롤 + 안전 영역만큼 */
  left:0; right:0; overflow-y:auto;
}

.sent {
  padding:1rem; margin:0.5rem 0;
  background:#f9f9f9; border-radius:0.5rem; cursor:pointer;
}
.active { background:#d0ebff; font-weight:bold; }
.line { display:flex; align-items:center; }
.idx { margin-right:0.5rem; color:#6b7280; font-weight:bold; }
.content { flex:1; }
.text, .kor { font-size:3.2rem; }           /* 항상 큰 글자 */
.kor { color:#374151; margin-top:0.25rem; }
.hidden { display:none; }

/* 컨트롤 바 */
.controls{
  position:fixed;
  left:0; right:0;

  /* 기존: bottom:0; → 변경 ↓ */
  bottom:env(safe-area-inset-bottom);   /* ⬅︎ 홈 인디케이터 위에 얹힘 */

  height:60px;
  /* padding-bottom 은 더 이상 safe-area 계산 안 해도 됨 */
  padding:0.5rem 0.75rem;
  /* …나머지 기존 속성 동일… */
}

.controls button{
  font-size:1.4rem;      /* 글자 더 큼   */
  padding:0.6rem 1rem;   /* 패딩 더 넉넉 */
  width:130px;           /* ★ 폭 고정   */
  min-width:130px;       /*   (브라우저별 안전) */
  text-align:center;
}

/* 재생 버튼은 조금 더 넓게 – 선택사항 */
.play-btn{
  width:150px;           /* ★ 고정폭 */
  font-size:2.2rem;
}
.toggle { margin-left:auto; }              /* 우측 끝으로 */
.show-btn {
  position:fixed; right:0.75rem; bottom:0.75rem;
  padding:0.3rem 0.6rem; font-size:1.2rem;
  background:#fff; border:1px solid #ccc; border-radius:0.375rem;
  z-index:10;
}
.loading { padding:1rem; }

.bar-toggle{
  position:fixed;
  right:0.75rem;
  bottom:calc(env(safe-area-inset-bottom) + 0.75rem);
  width:60px; min-width:60px;
  height:40px;
  font-size:1.6rem;
  text-align:center;
  background:#fff;
  border:1px solid #ccc;
  border-radius:0.375rem;
  z-index:11;          /* 컨트롤바(10)보다 위 */
}
</style>

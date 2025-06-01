<script>
import { onMount, tick, onDestroy } from 'svelte';
import { page } from '$app/stores';
import { base } from '$app/paths';

// ────────────────────────────────────────────────────────────────
// state ----------------------------------------------------------------------
$: id = $page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1] || '';
$: ASSET_BASE = `${base}/assets/sentence/${id}`;

let s = [],           // 영어 문장 목록
    k = [],           // 한글 번역 목록
    idx = -1,         // 현재 재생 중인 문장 인덱스
    a,                // 오디오 객체
    p = false,        // 재생 여부 (playing?)
    r = 'none',       // 반복 모드  none | one | all
    l = false,        // 글자 크기 (large?)
    b = false,        // 빈칸 모드 여부
    o = [];           // 원본 문장 백업 (blank-mode 해제 시 사용)

// 표시 모드: both | hideKor | hideEng ----------------------------------------
let display = 'both';
$: displayLabel = display === 'both' ? '한글 숨기기'
                    : display === 'hideKor' ? '영어 숨기기' : '기본 보기';

function cycleDisplay() {
  display = display === 'both' ? 'hideKor' : display === 'hideKor' ? 'hideEng' : 'both';
}

// 사운드 간 간격(ms) 옵션 ------------------------------------------------------
const gaps = [0, 1000, 3000, 5000];    // 즉시, 1초, 3초, 5초
let gap = gaps[0];                     // 현재 선택된 간격 (default: 즉시)

// ────────────────────────────────────────────────────────────────
// lifecycle ------------------------------------------------------------------
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
  a?.pause();
});

// ────────────────────────────────────────────────────────────────
// helpers --------------------------------------------------------------------
async function play(i) {
  if (i < 0 || i >= s.length) return;
  idx = i;
  await tick();
  document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  a?.pause();
  a = new Audio(`${ASSET_BASE}/audio/${String(i + 1).padStart(2, '0')}.mp3`);
  a.onended = () => {
    const next = () => {
      if (r === 'one') {
        play(idx);
      } else if (idx < s.length - 1) {
        play(idx + 1);
      } else if (r === 'all') {
        play(0);
      } else {
        p = false;
      }
    };
    setTimeout(next, gap);   // 선택된 간격만큼 딜레이
  };
  p = true;
  a.play();
}

function tPlay() {
  a ? (a.paused ? (a.play(), (p = true)) : (a.pause(), (p = false))) : play(0);
}
function tRepeat() {
  r = r === 'none' ? 'one' : r === 'one' ? 'all' : 'none';
}
function tSize() {
  l = !l;
}

function toggleBlankMode() {
  b = !b;
  if (b) {
    o = [...s];
    s = s.map((t) => {
      const w = t.split(' ');
      const len = w.length;
      const c = len <= 2 ? 1 : len >= 10 ? 3 : 2; // 빈칸 개수
      const idxs = [];
      while (idxs.length < c) {
        const ri = Math.floor(Math.random() * len);
        if (!idxs.includes(ri)) idxs.push(ri);
      }
      idxs.forEach((i) => (w[i] = '____'));
      return w.join(' ');
    });
  } else {
    s = [...o];
  }
}

function setGap(ms) {
  gap = ms;
}
</script>

<!-- ────────────────────────────────────────────────────────────────
     view -------------------------------------------------------------------- -->
<div class="list">
  {#if s.length}
    {#each s as text, i}
      <div id={`s-${i}`} class="sent {i === idx ? 'active' : ''}" on:click={() => play(i)}>
        <div class="line">
          <div class="idx">{i + 1}.</div>
          <div class="content">
            <div class="text" class:large={l} class:hidden={display==='hideEng'}>{text}</div>
            <div class="kor" class:hidden={display==='hideKor'}>{k[i]}</div>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <p class="loading">문장 데이터를 불러오는 중입니다...</p>
  {/if}
</div>

<!-- 컨트롤 영역 -->
<div class="controls">
  <button on:click={tPlay}>{p ? '⏸' : '▶'}</button>
  <button on:click={tRepeat}>반복:{r === 'none' ? '없음' : r === 'one' ? '한 문장' : '전체'}</button>
  <button on:click={tSize}>{l ? '기본크기' : '글자 크게'}</button>
  <button on:click={cycleDisplay}>{displayLabel}</button>
  <button on:click={toggleBlankMode}>{b ? '원문 보기' : '빈칸 만들기'}</button>

  <!-- 사운드 간격 버튼 그룹 -->
  <div class="gap-group">
    {#each gaps as g}
      <button class:selected={gap === g} on:click={() => setGap(g)}>
        {g === 0 ? '즉시' : `${g / 1000}초`}
      </button>
    {/each}
  </div>
</div>

<style>
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3rem;
  z-index: 20;
}

.list {
  position: absolute;
  top: 50px;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  overflow-y: auto;
}

.controls {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem calc(env(safe-area-inset-left) + 0.5rem)
    calc(0.5rem + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #ccc;
  z-index: 10;
  width: 100%;
}

.gap-group {
  display: flex;
  gap: 0.25rem;
}

button.selected {
  font-weight: bold;
  border: 1px solid #1d4ed8;
}

.sent {
  padding: 1rem;
  margin: 0.5rem 0;
  background: #f9f9f9;
  border-radius: 0.5rem;
  cursor: pointer;
}

.active {
  background: #d0ebff;
  font-weight: bold;
}

.line {
  display: flex;
  align-items: center;
}

.idx {
  margin-right: 0.5rem;
  color: #6b7280;
  font-weight: bold;
}

.content {
  flex: 1;
}

.text {
  font-size: 1rem;
}

.text.large {
  font-size: 3.2rem;
}

.hidden {
  display: none;
}

.text.hidden {
  display: none;
}

.kor.hidden {
  display: none;
}

.kor {
  font-size: 1rem;
  color: #374151;
  margin-top: 0.25rem;
}

.loading {
  padding: 1rem;
}
</style>

<script lang="ts">
import { onMount, tick, onDestroy } from 'svelte';
import { page } from '$app/stores';
import { base } from '$app/paths';

// ────────────── 경로 & 리액티브 상수 ──────────────
$: id          = $page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1] || '';
$: ASSET_BASE  = `${base}/assets/sentence/${id}`;

// ────────────── 상태 변수 ──────────────
let s: string[] = [], k: string[] = [];
let idx = -1;                           // 현재 문장 인덱스
let player: HTMLAudioElement;           // 재사용 오디오 태그
let p = false;                          // 재생 중?
let r: 'none' | 'one' | 'all' = 'none'; // 반복 모드
let l = false;                          // 글자 크게
let b = false;                          // 빈칸 모드
let o: string[] = [];                   // 원본 문장 백업

// 지연 간격(다음 재생까지 기다릴 시간)
const gaps = [0, 1000, 3000, 5000];
let gap = gaps[0];

// 문장/번역 표시 모드
let display: 'both' | 'hideKor' | 'hideEng' = 'both';
$: displayLabel = display === 'both' ? '한글 숨기기'
                   : display === 'hideKor' ? '영어 숨기기' : '기본 보기';

// 🔊 음성(재생 파일) 모드 – 영어 / 한국어 / 모두
let audioMode: 'eng' | 'kor' | 'both' = 'eng';
$: audioModeLabel = audioMode === 'eng' ? '영어' : audioMode === 'kor' ? '한국어' : '모두';

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

onDestroy(() => player?.pause());

// ────────────── 오디오 재생 로직 ──────────────
let langQueue: string[] = [];           // 현재 문장에 대해 재생할 폴더 큐

async function play(i: number) {
  if (i < 0 || i >= s.length) return;
  idx = i;
  await tick();
  document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // 음성 모드에 따라 큐 준비
  if (audioMode === 'both')      langQueue = ['audio', 'audiok'];
  else if (audioMode === 'kor')  langQueue = ['audiok'];
  else                           langQueue = ['audio']; // 영어(default)

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
  } catch {
    p = false;
  }
}

function handleEnded() {
  player.onended = () => {
    const afterGap = async () => {
      if (langQueue.length > 0) {
        await playNextLang();              // 같은 문장 다른 언어 재생
        return;
      }
      // 다음 문장 결정
      if (r === 'one')             play(idx);
      else if (idx < s.length - 1) play(idx + 1);
      else if (r === 'all')        play(0);
      else                         p = false;
    };
    setTimeout(afterGap, gap);
  };
}

$: player && handleEnded();

// ────────────── 버튼 토글 함수 ──────────────
function tPlay()   { p ? player.pause() : play(idx === -1 ? 0 : idx); p = !p; }
function tRepeat() { r = r === 'none' ? 'one' : r === 'one' ? 'all' : 'none'; }
function tSize()   { l = !l; }

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
  display = display === 'both' ? 'hideKor' : display === 'hideKor' ? 'hideEng' : 'both';
}
function setGap(ms: number) { gap = ms; }
</script>

<!-- ────────────── 뷰 ────────────── -->
<div class="list">
  {#if s.length}
    {#each s as text, i}
      <div id={`s-${i}`} class="sent {i===idx?'active':''}" on:click={() => play(i)}>
        <div class="line">
          <div class="idx">{i + 1}.</div>
          <div class="content">
            <div class="text" class:large={l} class:hidden={display === 'hideEng'}>{text}</div>
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
<div class="controls">
  <button on:click={tPlay}>{p ? '⏸' : '▶'}</button>
  <button on:click={tRepeat}>반복:{r === 'none' ? '없음' : r === 'one' ? '한 문장' : '전체'}</button>
  <button on:click={tSize}>{l ? '기본크기' : '글자 크게'}</button>
  <button on:click={cycleDisplay}>{displayLabel}</button>
  <button on:click={toggleBlankMode}>{b ? '원문 보기' : '빈칸 만들기'}</button>
  <!-- 🔊 음성 모드 토글 -->
  <button on:click={cycleAudioMode}>음성:{audioModeLabel}</button>

  <div class="gap-group">
    {#each gaps as g}
      <button class:selected={gap === g} on:click={() => setGap(g)}>
        {g === 0 ? '즉시' : `${g / 1000}초`}
      </button>
    {/each}
  </div>
</div>

<audio bind:this={player} playsinline preload="auto" style="display:none"></audio>

<style>
.list {
  position: absolute;
  top: 50px;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  overflow-y: auto;
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
.kor {
  font-size: 1rem;
  color: #374151;
  margin-top: 0.25rem;
}
.hidden {
  display: none;
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
  padding: 0.5rem calc(env(safe-area-inset-left) + 0.5rem) calc(0.5rem + env(safe-area-inset-bottom));
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
.loading {
  padding: 1rem;
}
</style>

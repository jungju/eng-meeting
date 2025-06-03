<script lang="ts">
import { onMount, tick, onDestroy } from 'svelte';
import { page } from '$app/stores';
import { base } from '$app/paths';

type Repeat = 'none' | 'all' | 'segment';

let conv: any[] = [];
let persons: Record<string, { name: string; hideEnglish?: boolean }> = {};

let idx = -1;
let playing = false;
let repeatMode: Repeat = 'none';

let txtSize = '1.2em';
let showKorean = true;
let showPhoto = true;

let player: HTMLAudioElement;

$: id = $page.url.pathname.match(/\/dialogue\/([^\/]+)/)?.[1] || '';
$: ASSET_BASE = `${base}/assets/dialogue/${id}`;

onMount(async () => {
  if (!id) return;
  const res = await fetch(`${ASSET_BASE}/dialogue.json`);
  if (!res.ok) return;
  const data = await res.json();
  persons = data.persons;
  conv = data.conversation.map((s: any, i: number) => ({
    ...s,
    file: `${ASSET_BASE}/audio/${String(i + 1).padStart(2, '0')}.mp3`
  }));
});

onDestroy(() => player?.pause());

async function playSeg(i: number, addOrder = true) {
  if (i < 0 || i >= conv.length) {
    playing = false;
    return;
  }
  idx = i;
  await tick();
  document.getElementById(`segment-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  player.pause();
  player.src = conv[i].file;
  player.muted = !!persons[conv[i].speaker]?.hideEnglish;

  try {
    await player.play();
  } catch {
    playing = false;
    return;
  }
  playing = true;
}

function handleEnded() {
  if (repeatMode === 'segment')            playSeg(idx, false);
  else if (idx < conv.length - 1)          playSeg(idx + 1);
  else if (repeatMode === 'all')           playSeg(0);
  else                                     playing = false;
}

function togglePlay() {
  if (playing) { player.pause(); playing = false; }
  else          { idx === -1 ? playSeg(0) : playSeg(idx, false); }
}

function toggleRepeat() {
  repeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'segment' : 'none';
}

function handleImgError(e: Event) {
  (e.target as HTMLImageElement).src = `${ASSET_BASE}/ready.webp`;
}
</script>

<div class="wrap">
  <div class="main">
    {#if showPhoto}
      <div class="photo">
        <div class="label">{persons[conv[idx]?.speaker]?.name || ''}</div>
        <img
          src={conv[idx]?.speaker ? `${ASSET_BASE}/${conv[idx].speaker}.webp` : `${ASSET_BASE}/ready.webp`}
          on:error={handleImgError}
        />
      </div>
    {/if}

    <div class="dialogue">
      {#each conv as s, i}
        <div
          id={`segment-${i}`}
          class="seg {i === idx ? 'active' : ''}"
          on:click={() => playSeg(i)}>
          <div class="speaker">{persons[s.speaker]?.name}:</div>
          <div class="text" style="font-size:{txtSize}">{s.text}</div>
          {#if showKorean}<div class="kor" style="font-size:{txtSize}">{s.korean}</div>{/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="ctl">
    <button on:click={togglePlay}>{playing ? '⏸' : '▶'}</button>
    <button on:click={toggleRepeat}>
      반복:{repeatMode === 'none' ? '없음' : repeatMode === 'all' ? '전체' : '구간'}
    </button>
    <button on:click={() => (showKorean = !showKorean)}>
      {showKorean ? '한글 ON' : '한글 OFF'}
    </button>
    <button on:click={() => (txtSize = txtSize === '1.2em' ? '2em' : '1.2em')}>크기</button>
    <button on:click={() => (showPhoto = !showPhoto)}>
      {showPhoto ? '사진 ON' : '사진 OFF'}
    </button>
  </div>
</div>

<audio bind:this={player} playsinline preload="auto" on:ended={handleEnded} style="display:none"></audio>

<style>
html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: Arial, sans-serif; }
.wrap  { position: absolute; top: 50px; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; }
.main  { flex: 1; display: flex; overflow: hidden; }
.photo { width: 40%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; position: relative; }
.photo img   { max-width: 90%; max-height: 90%; border-radius: 10px; }
.photo .label{ position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.3); color: #fff;
               padding: 5px 10px; border-radius: 5px; font-weight: bold; }
.dialogue    { flex: 1; overflow-y: auto; padding: 20px; }
.seg         { margin-bottom: 15px; padding: 10px; cursor: pointer; border-bottom: 1px solid #ddd; }
.seg.active  { background: #d0f0d0; font-weight: bold; }
.speaker     { color: #2a3d66; font-weight: bold; margin-bottom: 5px; font-size: 1.2em; }
.kor         { color: #555; }
.ctl         { background: #fff; padding: 10px; border-top: 1px solid #ccc; display: flex; justify-content: center; gap: 8px; }
button       { width: 110px; height: 48px; font-size: 0.8em; }
</style>

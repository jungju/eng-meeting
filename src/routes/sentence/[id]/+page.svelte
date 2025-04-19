<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';

  // derive id and asset base
  $: id = $page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1] || '';
  $: ASSET_BASE = `${base}/assets/sentence/${id}`;

  let sentences = [], idx = -1, audio = null, playing = false, repeatMode = 'none';
  let largeText = false;

  onMount(async () => {
    if (!id) return;
    const res = await fetch(`${ASSET_BASE}/sentences.json`);
    if (res.ok) {
      const data = await res.json();
      sentences = data.sentences;
    }
  });

  async function play(i) {
    if (i < 0 || i >= sentences.length) return;
    idx = i; await tick();
    document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    audio?.pause();
    audio = new Audio(`${ASSET_BASE}/audio/${String(i+1).padStart(2,'0')}.mp3`);
    audio.onended = () => {
      if (repeatMode === 'one') play(idx);
      else if (idx < sentences.length - 1) play(idx+1);
      else if (repeatMode === 'all') play(0);
      else playing = false;
    };
    playing = true;
    audio.play();
  }

  function togglePlay() {
    if (audio) {
      if (audio.paused) { audio.play(); playing = true; }
      else { audio.pause(); playing = false; }
    } else play(0);
  }

  function toggleRepeat() {
    repeatMode = repeatMode === 'none' ? 'one' : repeatMode === 'one' ? 'all' : 'none';
  }

  function toggleTextSize() {
    largeText = !largeText;
  }
</script>

{#if sentences.length}
  {#each sentences as text, i}
    <div id={`s-${i}`} class="sent {i===idx?'active':''}" on:click={() => play(i)}>
      <div class="idx">{i+1}</div>
      <div class="text" class:large={largeText}>{text}</div>
    </div>
  {/each}
{:else}
  <p class="loading">문장 데이터를 불러오는 중입니다...</p>
{/if}

<div class="controls">
  <button on:click={togglePlay}>{playing ? '⏸' : '▶'}</button>
  <button on:click={toggleRepeat}>반복: {repeatMode === 'none' ? '없음' : repeatMode === 'one' ? '한 문장' : '전체'}</button>
  <button on:click={toggleTextSize}>{largeText ? '기본크기' : '글자 크게'}</button>
</div>

<style>
  .sent { display: flex; align-items: center; padding: 1rem; margin: 0.5rem 0; background: #f9f9f9; border-radius: 0.5rem; cursor: pointer; }
  .active { background: #d0ebff; font-weight: bold; }
  .idx { width: 2rem; text-align: right; margin-right: 1rem; color: #6b7280; font-weight: bold; }
  .text { flex: 1; font-size: 1rem; }
  .text.large { font-size: 1.5rem; }
  .controls { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; gap: 0.5rem; padding: 0.5rem; background: #fff; border-top: 1px solid #ccc; }
  .controls button { padding: 0.5rem 1rem; font-size: 1rem; }
  .loading { padding: 1rem; }
</style>

<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';

  let sentences = [];
  let current = -1;
  let audio;
  let isPlaying = false;
  let repeat = 'none'; // 'none' | 'one' | 'all'
  const id = $page.url.searchParams.get('id') || '';

  onMount(async () => {
    const res = await fetch(`/sentence/${id}/sentences.json`);
    const data = await res.json();
    sentences = data.sentences;
  });

  async function play(i) {
    if (i < 0 || i >= sentences.length) return;
    current = i;
    await tick();
    document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    audio?.pause();
    audio = new Audio(`/sentence/${id}/${String(i + 1).padStart(2, '0')}.mp3`);
    audio.play();
    isPlaying = true;
    audio.onended = () => {
      if (repeat === 'one') play(current);
      else if (repeat === 'all') play((current + 1) % sentences.length);
      else isPlaying = false;
    };
  }

  function togglePlay() {
    if (audio) {
      if (audio.paused) {
        audio.play();
        isPlaying = true;
      } else {
        audio.pause();
        isPlaying = false;
      }
    } else if (sentences.length > 0) {
      play(0);
    }
  }

  function toggleRepeat() {
    repeat = repeat === 'none' ? 'one' : repeat === 'one' ? 'all' : 'none';
  }
</script>

<style>
  .page-header {
    background-color: #f0f4f8;
    padding: 1.5rem 2rem;
    border-radius: 0.75rem;
    text-align: center;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .page-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #1f2937;
  }

  .sentence {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-radius: 0.5rem;
    background: #f9f9f9;
    cursor: pointer;
    margin-bottom: 0.5rem;
  }

  .sentence:hover {
    background: #e0e0e0;
  }

  .active {
    background: #d0ebff;
    font-weight: bold;
  }

  .index {
    width: 2rem;
    text-align: right;
    margin-right: 1rem;
    color: #6b7280;
    font-weight: bold;
  }

  .controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #ccc;
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem;
    z-index: 1000;
  }

  .controls button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
</style>

{#if sentences.length}
  {#each sentences as s, i}
    <div id={`s-${i}`} class="sentence {i === current ? 'active' : ''}" on:click={() => play(i)}>
      <div class="index">{i + 1}</div>
      <div>{s}</div>
    </div>
  {/each}
{:else}
  <p>문장 데이터를 불러오는 중입니다...</p>
{/if}

<div class="controls">
  <button on:click={togglePlay}>{isPlaying ? '⏸️ 일시정지' : '▶️ 재생'}</button>
  <button on:click={toggleRepeat}>
    🔁 반복 모드: {repeat === 'none' ? '없음' : repeat === 'one' ? '한 문장' : '전체'}
  </button>
</div>

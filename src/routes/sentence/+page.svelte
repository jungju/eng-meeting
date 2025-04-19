<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';

  let s = [], i = -1, a, p = false, r = 'none';
  const id = $page.url.searchParams.get('id') || '';

  onMount(async () => {
    s = (await (await fetch(`/sentence/${id}/sentences.json`)).json()).sentences;
  });

  async function play(x) {
    if (x < 0 || x >= s.length) return;
    i = x; await tick();
    document.getElementById(`s-${x}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    a?.pause();
    a = new Audio(`/sentence/${id}/audio/${String(x + 1).padStart(2, '0')}.mp3`);
    a.play(); p = true;
    a.onended = () => {
      if (r === 'one') play(i);
      else if (r === 'all') play((i + 1) % s.length);
      else if (i < s.length - 1) play(i + 1);
      else p = false;
    };
  }

  function togglePlay() {
    if (a) p = a.paused ? (a.play(), true) : (a.pause(), false);
    else if (s.length) play(0);
  }

  function toggleRepeat() {
    r = r === 'none' ? 'one' : r === 'one' ? 'all' : 'none';
  }
</script>

{#if s.length}
  {#each s as t, j}
    <div id={`s-${j}`} class="sent {j===i ? 'active' : ''}" on:click={() => play(j)}>
      <div class="idx">{j+1}</div><div>{t}</div>
    </div>
  {/each}
{:else}
  <p class="loading">문장 데이터를 불러오는 중입니다...</p>
{/if}

<div class="ctrls">
  <button on:click={togglePlay}>{p ? '⏸️ 일시정지' : '▶️ 재생'}</button>
  <button on:click={toggleRepeat}>🔁 반복 모드: {r==='none'?'없음':r==='one'?'한 문장':'전체'}</button>
</div>

<style>
  .sent {display:flex;align-items:center;padding:1rem;margin:.3rem 0;border-radius:.5rem;cursor:pointer;background:#f9f9f9;}
  .sent:hover {background:#e0e0e0;}
  .active {background:#d0ebff;font-weight:bold;}
  .idx {width:2rem;text-align:right;margin-right:1rem;color:#6b7280;font-weight:bold;}
  .ctrls {position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #ccc;display:flex;justify-content:center;gap:.5rem;padding:.5rem;z-index:1000;}
  .ctrls button {padding:.5rem 1rem;font-size:1rem;}
  .loading {padding:1rem;}
</style>

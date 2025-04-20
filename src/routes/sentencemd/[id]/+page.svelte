<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { marked } from 'marked';

  let rawLines = [], lines = [], audioList = [], current = -1, audio;
  let isPlaying = false, repeatMode = 'none', largeText = false, hideKorean = false;

  const id = $page.params.id;
  const ASSET_BASE = `${base}/assets/sentencemd/${id}`;

  onMount(async () => {
    const [mdRes, jsonRes] = await Promise.all([
      fetch(`${ASSET_BASE}/main.md`),
      fetch(`${ASSET_BASE}/sentences.json`)
    ]);
    const raw = await mdRes.text();
    audioList = await jsonRes.json();
    rawLines = raw.split('\n');

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

  function play(i) {
  const nextPlayable = (start) => {
    for (let j = start; j < lines.length; j++) {
      if (lines[j]?.file) return j;
    }
    return -1;
  };

  i = nextPlayable(i); // 현재 위치에서 재생 가능한 문장 찾기
  if (i === -1) {
    isPlaying = false;
    return;
  }

  current = i;
  isPlaying = true;

  audio?.pause();
  audio = new Audio(`${ASSET_BASE}/audio/${lines[i].file}`);
  audio.play();

  // 스크롤 이동
  setTimeout(() => {
    document.querySelector(`#s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 0);

  audio.onended = () => {
    if (repeatMode === 'one') {
      play(i);
    } else if (repeatMode === 'all') {
      const next = nextPlayable(i + 1);
      play(next !== -1 ? next : 0); // 끝이면 처음으로
    } else if (repeatMode === 'none') {
      const next = nextPlayable(i + 1);
      if (next !== -1) play(next);
      else isPlaying = false;
    }
  };
}

  function togglePlay() {
    if (audio) {
      isPlaying ? audio.pause() : audio.play();
      isPlaying = !isPlaying;
    } else if (current >= 0) {
      play(current);
    }
  }

  function toggleRepeat() {
    repeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
  }

  function toggleSize() {
    largeText = !largeText;
  }

  function removeKorean(text) {
    return text.replace(/[\u3131-\u318E\uAC00-\uD7A3]+/g, '');
  }
</script>

<div>
  {#each lines as s, i}
    <p
  id={"s-" + i}
  class="{current === i ? 'highlight' : s.isMatched ? 'matched' : ''} {largeText ? 'large' : 'normal'}"
  on:click={() => play(i)}
>
      {@html hideKorean ? marked(removeKorean(s.text)) : s.html}
    </p>
  {/each}
</div>

<div class="controls">
  <button on:click={togglePlay}>{isPlaying ? '⏸️' : '▶️'}</button>
  <button on:click={toggleRepeat}>
    {repeatMode === 'none' ? '🔁 없음' : repeatMode === 'all' ? '🔁 전체' : '🔂 한 문장'}
  </button>
  <button on:click={toggleSize}>{largeText ? '기본' : '크게'}</button>
  <button on:click={() => hideKorean = !hideKorean}>{hideKorean ? '한글 보기' : '영어만 보기'}</button>
</div>

<style>
  p {
  margin: 0;
  padding: 2px 4px;
  cursor: pointer;
  line-height: 1.1; /* ✅ 줄간격 줄이기 */
}
  .normal { font-size: 18px; }
  .large { font-size: 24px; }
  .highlight { background: #fffae6 }
  .matched { background: #e0f7fa }
  .controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    background: #f5f5f5;
    border-top: 1px solid #ccc;
  }
  .controls button {
    padding: 6px 12px;
    font-size: 15px;
  }
</style>

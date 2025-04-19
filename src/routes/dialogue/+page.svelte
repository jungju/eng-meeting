<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';

  let persons = {};
  let conv = [];
  let idx = 0;
  let playing = false;
  let repeatMode = 'none'; // none | all | segment
  let left = true;
  let txtSize = '1.2em';
  let showKorean = true;
  let highlightEnabled = false;
  let audio;
  let curT = 0;
  const id = $page.url.searchParams.get('id') || '';

  onMount(async () => {
    const res = await fetch(`/dialogue/${id}/dialogue.json`);
    const data = await res.json();
    persons = data.persons;
    for (let k in persons) {
      if (persons[k].hideEnglish === undefined) persons[k].hideEnglish = false;
    }
    conv = data.conversation;
    conv.forEach((s, i) => s.filePath = `/dialogue/${id}/${String(i + 1).padStart(2, '0')}.mp3`);
    await tick();
    audio = new Audio();
    audio.addEventListener('timeupdate', () => curT = audio.currentTime);
    audio.onended = () => {
      if (repeatMode === 'segment') playSeg(idx);
      else if (idx < conv.length - 1) playSeg(idx + 1);
      else if (repeatMode === 'all') { idx = 0; playSeg(0); }
      else playing = false;
    };
  });

  async function playSeg(i) {
    if (i >= conv.length) { playing = false; return; }
    idx = i;
    await tick();
    document.getElementById(`segment-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    let s = conv[i];
    audio.src = s.filePath;
    audio.muted = persons[s.speaker].muted || persons[s.speaker].hideEnglish;
    playing = true;
    audio.play();
  }

  $: hl = conv[idx] ? (() => {
    const s = conv[idx];
    if (!highlightEnabled) return s.text;
    if (!audio.duration) return s.text;
    let f = Math.min((curT + 0.2) / audio.duration, 1),
        w = s.text.split(" "), c = Math.floor(w.length * f);
    return `<span style=\"color:red;\">${w.slice(0, c).join(" ")}</span> ${w.slice(c).join(" ")}`;
  })() : "";

  function toggleSpeaker(k) { persons[k].hideEnglish = !persons[k].hideEnglish; }
  function toggleHighlight() { highlightEnabled = !highlightEnabled; }

  function handleImgError(event) {
    event.target.src = 'ready.webp';
  }

  function toggleRepeat() {
    repeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'segment' : 'none';
  }
</script>

<main class="main-container">
  <div class="top-container">
    {#if left}
      <div class="left-panel">
        <div class="speaker-name-overlay">
          {conv[idx] ? persons[conv[idx].speaker].name : ''}
        </div>
        <img
          src={conv[idx] ? `/dialogue/${id}/${conv[idx].speaker}.webp` : 'ready.webp'}
          alt="Speaker Image"
          on:error={handleImgError}
        />
      </div>
    {/if}
    <div class="right-panel" style="width:{left ? '60%' : '100%'}">
      {#each conv as s, i}
        <div id={`segment-${i}`} class="segment {i === idx ? 'active' : ''}" on:click={() => { audio.pause(); playSeg(i); }}>
          <div class="speaker-name">{persons[s.speaker]?.name}:</div>
          <div class="dialogue-text" style="font-size:{txtSize}">
            {@html i === idx ? hl : s.text}
          </div>
          {#if showKorean}
            <div class="korean-text" style="font-size:{txtSize}">{s.korean}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
  <div class="right-controls" style="gap: 10px">
    <button on:click={() => { playing ? (audio.pause(), playing = false) : playSeg(idx); }} style="font-size: 1.1em; padding: 10px 16px; height: 48px;">
      {playing ? "재생 중" : "재생"}
    </button>
    <button class="toggle-btn" on:click={toggleRepeat} style="font-size: 1.1em; padding: 10px 16px; height: 48px;">
      🔁 반복 모드: {repeatMode === 'none' ? '없음' : repeatMode === 'all' ? '전체' : '구간'}
    </button>
    <button class="toggle-btn" on:click={() => showKorean = !showKorean} style="font-size: 1.1em; padding: 10px 16px; height: 48px;">
      {showKorean ? "한글발음 ON" : "한글발음 OFF"}
    </button>
    <button class="toggle-btn" on:click={() => txtSize = txtSize === '1.2em' ? '2em' : '1.2em'} style="font-size: 1.1em; padding: 10px 16px; height: 48px;">
      {txtSize === '1.2em' ? "글씨크게 OFF" : "글씨크게 ON"}
    </button>
    <button class="toggle-btn" on:click={() => left = !left} style="font-size: 1.1em; padding: 10px 16px; height: 48px;">
      {left ? "사진 보임" : "사진 숨김"}
    </button>
    <button class="toggle-btn" on:click={toggleHighlight} style="font-size: 1.1em; padding: 10px 16px; height: 48px;">
      {highlightEnabled ? "하이라이트 ON" : "하이라이트 OFF"}
    </button>
  </div>
</main>

<style>
  html,body { margin:0; padding:0; overflow:hidden; height:100%; font-family:Arial,sans-serif; }
  .main-container { display:flex; flex-direction:column; height:100vh; }
  .top-container { display:flex; flex:1; overflow:hidden; }
  .left-panel { width:40%; background:#f0f0f0; position:relative; display:flex; align-items:center; justify-content:center; transition:width .3s; }
  .speaker-name-overlay { position:absolute; top:10px; left:50%; transform:translateX(-50%); width:80%; font-size:1em; font-weight:bold; color:#fff; text-shadow:2px 2px 4px rgba(0,0,0,0.7); background:rgba(0,0,0,0.3); padding:5px 10px; border-radius:5px; z-index:10; }
  .left-panel img { max-width:90%; max-height:90%; border-radius:10px; display:block; }
  .right-panel { padding:20px; overflow-y:auto; transition:width .3s; }
  .segment { margin-bottom:15px; padding:10px; cursor:pointer; border-bottom:1px solid #ddd; line-height:1.5; }
  .segment.active { background:#d0f0d0; font-weight:bold; }
  .speaker-name { font-weight:bold; color:#2a3d66; font-size:1.4em; margin-bottom:5px; }
  .dialogue-text { font-family:Helvetica,sans-serif; color:#000; margin-bottom:5px; }
  .korean-text { color:#555; }
  .right-controls { position:sticky; bottom:0; background:#fff; padding:10px; border-top:1px solid #ccc; display:flex; justify-content:center; gap:6px; z-index:20; }
  .right-controls button { display:flex; justify-content:center; align-items:center; font-size:1.3em; padding:8px 12px; border:none; border-radius:5px; background:#2a3d66; color:#fff; cursor:pointer; width:110px; height:40px; }
  .right-controls button:hover { background:#1f2a4a; }
  .right-controls .toggle-btn { font-size:1em; }
  .modal { position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; }
  .modal-content { background:#fefefe; padding:20px; border:1px solid #888; width:80%; max-width:400px; border-radius:8px; position:relative; }
  .close-button { position:absolute; top:10px; right:10px; font-size:28px; cursor:pointer; }
  ul.option-list { list-style:none; padding:0; }
  ul.option-list li { margin-bottom:8px; }
</style>

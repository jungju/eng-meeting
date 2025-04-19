<script>
  import { onMount } from 'svelte';
  let persons = {}, conv = [], idx = 0, playing = false,
      globalRepeat = false, segmentRepeat = false, sett = false,
      left = true, txtSize = '1.2em', showKorean = true,
      highlightEnabled = false, // 기본적으로 하이라이트 비활성화
      audio = new Audio(), curT = 0;
      
  onMount(async () => {
    const r = await fetch('meet1.json');
    const d = await r.json();
    persons = d.persons;
    for (let k in persons)
      if (persons[k].hideEnglish === undefined) persons[k].hideEnglish = false;
    conv = d.conversation;
    conv.forEach((s, i) => s.filePath = `./meet1/${String(i+1).padStart(2, '0')}.mp3`);
  });
  
  audio.addEventListener('timeupdate', () => curT = audio.currentTime);
  
  function playSeg(i) {
    if (i >= conv.length) { playing = false; return; }
    idx = i;
    let s = conv[i];
    audio.src = s.filePath;
    audio.muted = persons[s.speaker].muted || persons[s.speaker].hideEnglish;
    playing = true; audio.play();
  }
  
  audio.onended = () => {
    if (segmentRepeat) playSeg(idx);
    else if (idx < conv.length - 1) playSeg(idx + 1);
    else if (globalRepeat) { idx = 0; playSeg(0); }
    else playing = false;
  };
  
  $: hl = conv[idx] ? (() => {
    const s = conv[idx];
    if (!highlightEnabled) return s.text;
    if (!audio.duration) return s.text;
    let f = Math.min((curT + 0.2) / audio.duration, 1),
        w = s.text.split(" "), c = Math.floor(w.length * f);
    return `<span style="color:red;">${w.slice(0, c).join(" ")}</span> ${w.slice(c).join(" ")}`;
  })() : "";
  
  function toggleSpeaker(k) { persons[k].hideEnglish = !persons[k].hideEnglish; }
  function toggleHighlight() { highlightEnabled = !highlightEnabled; }
</script>

<main class="main-container">
  <div class="top-container">
    {#if left}
      <div class="left-panel">
        <div class="speaker-name-overlay">
          {conv[idx] ? persons[conv[idx].speaker].name : ''}
        </div>
        <img src={conv[idx] ? `./meet1/${conv[idx].speaker}.webp` : 'ready.webp'} alt="Speaker Image" onerror="this.src='ready.webp'">
      </div>
    {/if}
    <div class="right-panel" style="width:{left ? '60%' : '100%'}">
      {#each conv as s, i}
        <div class="segment {i === idx ? 'active' : ''}" on:click={() => { audio.pause(); playSeg(i); }}>
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
  <div class="right-controls">
    <button on:click={() => { playing ? (audio.pause(), playing = false) : playSeg(idx); }}>
      {playing ? "재생 중" : "재생"}
    </button>
    <button class="toggle-btn" on:click={() => globalRepeat = !globalRepeat}>
      {globalRepeat ? "전체 반복 ON" : "전체 반복 OFF"}
    </button>
    <button class="toggle-btn" on:click={() => segmentRepeat = !segmentRepeat}>
      {segmentRepeat ? "구간 반복 ON" : "구간 반복 OFF"}
    </button>
    <button class="toggle-btn" on:click={() => showKorean = !showKorean}>
      {showKorean ? "한글발음 ON" : "한글발음 OFF"}
    </button>
    <button class="toggle-btn" on:click={() => txtSize = txtSize === '1.2em' ? '2em' : '1.2em'}>
      {txtSize === '1.2em' ? "글씨크게 OFF" : "글씨크게 ON"}
    </button>
    <button class="toggle-btn" on:click={() => left = !left}>
      {left ? "사진 보임" : "사진 숨김"}
    </button>
    <button class="toggle-btn" on:click={() => toggleHighlight()}>
      {highlightEnabled ? "하이라이트 ON" : "하이라이트 OFF"}
    </button>
    <button on:click={() => sett = true}>설정</button>
  </div>
  {#if sett}
    <div class="modal" on:click={() => sett = false}>
      <div class="modal-content" on:click|stopPropagation>
        <span class="close-button" on:click={() => sett = false}>&times;</span>
        <h3>설정</h3>
        <h4>대화자 옵션</h4>
        <ul class="option-list">
          {#each Object.entries(persons) as [k, p]}
            <li>
              <label>
                <input type="checkbox" checked={p.hideEnglish} on:change={() => toggleSpeaker(k)}>
                {p.name} (음소거 및 영어 숨김)
              </label>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
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

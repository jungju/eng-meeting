<script>
  import { onMount } from 'svelte';
  let persons = {}, conversation = [];
  let currentSegmentIndex = 0, isPlaying = false, repeat = false, showSettings = false, showLeftPanel = true;
  let textSize = '1.2em', globalAudio = new Audio();
  
  onMount(async () => {
    const res = await fetch('meet1.json');
    const data = await res.json();
    persons = data.persons;
    conversation = data.conversation;
    conversation.forEach((seg, i) => {
      seg.filePath = "./meet1/" + String(i + 1).padStart(2, '0') + ".mp3";
    });
  });
  
  function playSegment(i) {
    if (i >= conversation.length) { isPlaying = false; return; }
    currentSegmentIndex = i;
    const seg = conversation[i];
    globalAudio.src = seg.filePath;
    globalAudio.muted = persons[seg.speaker].muted || persons[seg.speaker].hideEnglish;
    globalAudio.play();
    isPlaying = true;
  }
  
  globalAudio.addEventListener('timeupdate', () => {
    // Svelte의 reactive 선언($:)에서 highlightedText를 갱신하므로 별도 처리 없음
  });
  
  globalAudio.onended = () => {
    if (currentSegmentIndex < conversation.length - 1) playSegment(currentSegmentIndex + 1);
    else if (repeat) { currentSegmentIndex = 0; playSegment(0); }
    else isPlaying = false;
  }
  
  function playConversation() { if (!isPlaying) playSegment(currentSegmentIndex); }
  function pauseConversation() { globalAudio.pause(); isPlaying = false; }
  function restartConversation() { globalAudio.pause(); currentSegmentIndex = 0; playSegment(0); }
  
  $: highlightedText = conversation[currentSegmentIndex]
    ? (() => {
        const seg = conversation[currentSegmentIndex];
        if (!globalAudio.duration) return seg.text;
        let frac = Math.min((globalAudio.currentTime + 0.2) / globalAudio.duration, 1),
            words = seg.text.split(" "),
            cnt = Math.floor(words.length * frac);
        return `<span style="color:red;">${words.slice(0, cnt).join(" ")}</span> ${words.slice(cnt).join(" ")}`;
      })()
    : "";
    
  function toggleSpeakerOption(key) {
    persons[key].hideEnglish = !persons[key].hideEnglish;
  }
  
  function changeTextSize(e) {
    textSize = e.target.value === 'veryLarge' ? '2em' : '1.2em';
  }
</script>

<main class="main-container">
  <div class="top-container">
    {#if showLeftPanel}
      <div class="left-panel">
        <div class="speaker-name-overlay">
          {conversation[currentSegmentIndex] ? persons[conversation[currentSegmentIndex].speaker].name : ''}
        </div>
        <img src="{conversation[currentSegmentIndex] ? `./meet1/${conversation[currentSegmentIndex].speaker}.webp` : 'ready.webp'}" alt="Speaker Image" onerror="this.src='ready.webp'">
      </div>
    {/if}
    <div class="right-panel" style="width: {showLeftPanel ? '60%' : '100%'}">
      {#each conversation as seg, i}
        <div class="segment {i === currentSegmentIndex ? 'active' : ''}" on:click={() => { globalAudio.pause(); playSegment(i) }}>
          <div class="speaker-name">{persons[seg.speaker]?.name}:</div>
          <div class="dialogue-text" style="font-size:{textSize}" 
               innerHTML={i === currentSegmentIndex ? highlightedText : seg.text}>
          </div>
          <div class="korean-text" style="font-size:{textSize}">{seg.korean}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="right-controls">
    <button on:click={playConversation}>재생</button>
    <button on:click={pauseConversation}>중지</button>
    <button on:click={restartConversation}>처음으로</button>
    <label><input type="checkbox" bind:checked={repeat}> 전체 반복</label>
    <button on:click={() => showSettings = true}>설정</button>
    {#if isPlaying}<span class="play-indicator">재생 중...</span>{/if}
  </div>
  {#if showSettings}
    <div class="modal" on:click={() => showSettings = false}>
      <div class="modal-content" on:click|stopPropagation>
        <span class="close-button" on:click={() => showSettings = false}>&times;</span>
        <h3>설정</h3>
        <ul class="option-list">
          <li>
            <label>
              글자 크기:
              <select on:change={changeTextSize}>
                <option value="default">기본</option>
                <option value="veryLarge">매우 크게</option>
              </select>
            </label>
          </li>
        </ul>
        <h4>대화자 옵션</h4>
        <ul class="option-list">
          {#each Object.entries(persons) as [key, person]}
            <li>
              <label>
                <input type="checkbox" checked={person.hideEnglish} on:change={() => toggleSpeakerOption(key)}>
                {person.name} (음소거 및 영어 숨김)
              </label>
            </li>
          {/each}
        </ul>
        <h4>레이아웃 옵션</h4>
        <ul class="option-list">
          <li>
            <label>
              <input type="checkbox" bind:checked={showLeftPanel}>
              왼쪽 사진 숨김
            </label>
          </li>
        </ul>
      </div>
    </div>
  {/if}
</main>

<style>
  html, body { margin:0; padding:0; overflow:hidden; height:100%; font-family:Arial,sans-serif; }
  .main-container { display:flex; flex-direction:column; height:100vh; }
  .top-container { display:flex; flex:1; overflow:hidden; }
  .left-panel { width:40%; background:#f0f0f0; position:relative; display:flex; align-items:center; justify-content:center; transition:width .3s ease; }
  .speaker-name-overlay { position:absolute; top:10px; left:50%; transform:translateX(-50%); width:80%; font-size:1em; font-weight:bold; color:#fff; text-shadow:2px 2px 4px rgba(0,0,0,0.7); background:rgba(0,0,0,0.3); padding:5px 10px; border-radius:5px; z-index:10; }
  .left-panel img { max-width:90%; max-height:90%; border-radius:10px; display:block; }
  .right-panel { padding:20px; overflow-y:auto; transition:width .3s ease; }
  .segment { margin-bottom:15px; padding:10px; cursor:pointer; border-bottom:1px solid #ddd; line-height:1.5; }
  .segment.active { background:#d0f0d0; font-weight:bold; }
  .speaker-name { font-weight:bold; color:#2a3d66; font-size:1.4em; margin-bottom:5px; }
  .dialogue-text { font-family:Helvetica,sans-serif; color:#000; margin-bottom:5px; }
  .korean-text { color:#555; }
  .right-controls { position:sticky; bottom:0; background:#fff; padding:10px; border-top:1px solid #ccc; display:flex; align-items:center; justify-content:center; gap:10px; z-index:20; }
  .right-controls button { font-size:1.5em; padding:10px 20px; border:none; border-radius:5px; background:#2a3d66; color:#fff; cursor:pointer; }
  .right-controls button:hover { background:#1f2a4a; }
  .play-indicator { font-size:1.2em; font-weight:bold; color:green; margin-left:20px; }
  .modal { position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; }
  .modal-content { background:#fefefe; padding:20px; border:1px solid #888; width:80%; max-width:400px; border-radius:8px; position:relative; }
  .close-button { position:absolute; top:10px; right:10px; font-size:28px; cursor:pointer; }
  ul.option-list { list-style:none; padding:0; }
  ul.option-list li { margin-bottom:8px; }
</style>

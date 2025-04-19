<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';

  let conv = [], idx = 0, audio = null, playing = false, repeatMode = 'none';
  let txtSize = '1.2em', showKorean = true, left = true, persons = {};

  // derive id and asset base
  $: id = $page.url.pathname.match(/\/dialogue\/([^\/]+)/)?.[1] || '';
  $: ASSET_BASE = `${base}/assets/dialogue/${id}`;

  onMount(async () => {
    if (!id) return;
    const res = await fetch(`${ASSET_BASE}/dialogue.json`);
    if (res.ok) {
      const data = await res.json();
      persons = data.persons;
      conv = data.conversation.map((s,i) => ({
        ...s,
        filePath: `${ASSET_BASE}/audio/${String(i+1).padStart(2,'0')}.mp3`
      }));
    }
  });

  async function playSeg(i) {
    if (i<0||i>=conv.length){playing=false;return;}
    audio?.pause(); idx=i; await tick();
    document.getElementById(`segment-${i}`)?.scrollIntoView({behavior:'smooth',block:'center'});
    const s=conv[i]; audio=new Audio(s.filePath);
    audio.muted=persons[s.speaker]?.hideEnglish;
    audio.onended=()=>{
      if(repeatMode==='segment')playSeg(idx);
      else if(idx<conv.length-1)playSeg(idx+1);
      else if(repeatMode==='all')playSeg(0);
      else playing=false;
    };
    playing=true; audio.play();
  }

  function togglePlay() {
    if(audio) {
      if(audio.paused){audio.play();playing=true;} else {audio.pause();playing=false;}
    } else playSeg(0);
  }
  function toggleRepeat() { repeatMode = repeatMode==='none'?'all':repeatMode==='all'?'segment':'none'; }
  function handleImgError(e){ e.target.src = `${ASSET_BASE}/ready.webp`; }
</script>

<div style="position:absolute;top:50px;left:0;right:0;bottom:0;display:flex;flex-direction:column;overflow:hidden;">
  <div style="flex:1;display:flex;overflow:hidden;">
    {#if left}
    <div style="width:40%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;position:relative;">
      <div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.3);color:#fff;padding:5px 10px;border-radius:5px;font-weight:bold;">
        {persons[conv[idx]?.speaker]?.name||''}
      </div>
      <img
        src={conv[idx]?.speaker?`${ASSET_BASE}/${conv[idx].speaker}.webp`:`${ASSET_BASE}/ready.webp`}
        on:error={handleImgError}
        style="max-width:90%;max-height:90%;border-radius:10px;"
      />
    </div>
    {/if}
    <div style="flex:1;overflow-y:auto;padding:20px;">
      {#each conv as s,i}
      <div
        id={`segment-${i}`} on:click={()=>playSeg(i)}
        style="margin-bottom:15px;padding:10px;cursor:pointer;border-bottom:1px solid #ddd;background:{i===idx?'#d0f0d0':'transparent'};font-weight:{i===idx?'bold':'normal'};"
      >
        <div style="color:#2a3d66;font-weight:bold;margin-bottom:5px;font-size:1.2em;">{persons[s.speaker]?.name}:</div>
        <div style="font-size:{txtSize};margin-bottom:5px;">{s.text}</div>
        {#if showKorean}<div style="font-size:{txtSize};color:#555;">{s.korean}</div>{/if}
      </div>
      {/each}
    </div>
  </div>
  <div style="background:#fff;padding:10px;border-top:1px solid #ccc;display:flex;justify-content:center;gap:8px;">
    <button on:click={togglePlay} style="width:110px;height:48px;font-size:0.8em;">{playing?'⏸':'▶'}</button>
    <button on:click={toggleRepeat} style="width:110px;height:48px;font-size:0.8em;">반복:{repeatMode==='none'?'없음':repeatMode==='all'?'전체':'구간'}</button>
    <button on:click={()=>showKorean=!showKorean} style="width:110px;height:48px;font-size:0.8em;">{showKorean?'한글 ON':'한글 OFF'}</button>
    <button on:click={()=>txtSize=txtSize==='1.2em'?'2em':'1.2em'} style="width:110px;height:48px;font-size:0.8em;">크기</button>
    <button on:click={()=>left=!left} style="width:110px;height:48px;font-size:0.8em;">{left?'사진 ON':'사진 OFF'}</button>
  </div>
</div>

<style>html,body{margin:0;padding:0;overflow:hidden;height:100%;font-family:Arial,sans-serif;}</style>

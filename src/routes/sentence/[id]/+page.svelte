<script>
import {onMount,tick, onDestroy} from 'svelte'
import {page} from '$app/stores'
import {base} from '$app/paths'
$: id=$page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1]||''
$: ASSET_BASE=`${base}/assets/sentence/${id}`
let sentences=[],idx=-1,audio,playing=false,repeatMode='none',largeText=false
onMount(async()=>{
  if(!id)return
  const res=await fetch(`${ASSET_BASE}/sentences.json`)
  if(res.ok)sentences=(await res.json()).sentences
})
onDestroy(() => {
  audio?.pause()
})
async function play(i){
  if(i<0||i>=sentences.length)return
  idx=i;await tick()
  document.getElementById(`s-${i}`)?.scrollIntoView({behavior:'smooth',block:'center'})
  audio?.pause()
  audio=new Audio(`${ASSET_BASE}/audio/${String(i+1).padStart(2,'0')}.mp3`)
  audio.onended=()=>repeatMode==='one'?play(idx):idx<sentences.length-1?play(idx+1):repeatMode==='all'?play(0):(playing=false)
  playing=true;audio.play()
}
function togglePlay(){audio?audio.paused?(audio.play(),playing=true):(audio.pause(),playing=false):play(0)}
function toggleRepeat(){repeatMode=repeatMode==='none'?'one':repeatMode==='one'?'all':'none'}
function toggleTextSize(){largeText=!largeText}
</script>

<div class="list">
  {#if sentences.length}
    {#each sentences as text,i}
      <div id={`s-${i}`} class="sent {i===idx?'active':''}" on:click={()=>play(i)}>
        <div class="idx">{i+1}</div>
        <div class="text" class:large={largeText}>{text}</div>
      </div>
    {/each}
  {:else}
    <p class="loading">문장 데이터를 불러오는 중입니다...</p>
  {/if}
</div>

<div class="controls">
  <button on:click={togglePlay}>{playing?'⏸':'▶'}</button>
  <button on:click={toggleRepeat}>반복:{repeatMode==='none'?'없음':repeatMode==='one'?'한 문장':'전체'}</button>
  <button on:click={toggleTextSize}>{largeText?'기본크기':'글자 크게'}</button>
</div>

<style>
header{position:fixed;top:0;left:0;right:0;height:3rem;z-index:20}
.list {position: absolute;top: 50px;bottom: calc(50px + env(safe-area-inset-bottom));left: 0;right: 0;overflow-y: auto;}
.controls {position: fixed;left: 0;right: 0;bottom: 0;height: 50px;display: flex;justify-content: center;gap: .5rem;padding: .5rem calc(env(safe-area-inset-left) + .5rem) calc(.5rem + env(safe-area-inset-bottom));background: #fff;border-top: 1px solid #ccc;z-index: 10;width: 100%;}
.sent{display:flex;align-items:center;padding:1rem;margin:.5rem 0;background:#f9f9f9;border-radius:.5rem;cursor:pointer}
.active{background:#d0ebff;font-weight:bold}
.idx{width:2rem;text-align:right;margin-right:1rem;color:#6b7280;font-weight:bold}
.text{flex:1;font-size:1rem}
.text.large{font-size:3.2rem}
.loading{padding:1rem}
</style>

<script>
import {onMount,tick,onDestroy} from 'svelte'
import {page} from '$app/stores'
import {base} from '$app/paths'
$: id=$page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1]||''
$: ASSET_BASE=`${base}/assets/sentence/${id}`
let s=[],k=[],idx=-1,a,p=false,r='none',l=false,h=false,b=false,o=[]

onMount(async()=>{
  if(!id)return
  const res=await fetch(`${ASSET_BASE}/sentences.json`)
  if(res.ok){
    const d=await res.json()
    s=d.sentences
    k=d.korean
  }
})
onDestroy(()=>{a?.pause()})
async function play(i){
  if(i<0||i>=s.length)return
  idx=i;await tick()
  document.getElementById(`s-${i}`)?.scrollIntoView({behavior:'smooth',block:'center'})
  a?.pause()
  a=new Audio(`${ASSET_BASE}/audio/${String(i+1).padStart(2,'0')}.mp3`)
  a.onended=()=>r==='one'?play(idx):idx<s.length-1?play(idx+1):r==='all'?play(0):(p=false)
  p=true;a.play()
}
function tPlay(){a?a.paused?(a.play(),p=true):(a.pause(),p=false):play(0)}
function tRepeat(){r=r==='none'?'one':r==='one'?'all':'none'}
function tSize(){l=!l}
function tHideEng(){h=!h}

function toggleBlankMode(){
  b=!b
  if(b){
    o=[...s]
    s=s.map(t=>{
      const w=t.split(' '),l=w.length,c=l<=2?1:l>=10?3:2,idxs=[]
      while(idxs.length<c){
        const ri=Math.floor(Math.random()*l)
        if(!idxs.includes(ri))idxs.push(ri)
      }
      idxs.forEach(i=>w[i]='____')
      return w.join(' ')
    })
  }else{
    s=[...o]
  }
}
</script>

<div class="list">
  {#if s.length}
    {#each s as text,i}
      <div id={`s-${i}`} class="sent {i===idx?'active':''}" on:click={()=>play(i)}>
        <div class="line">
          <div class="idx">{i+1}.</div>
          <div class="content">
            <div class="text" class:large={l} class:hidden={h}>{text}</div>
            <div class="kor">{k[i]}</div>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <p class="loading">문장 데이터를 불러오는 중입니다...</p>
  {/if}
</div>

<div class="controls">
  <button on:click={tPlay}>{p?'⏸':'▶'}</button>
  <button on:click={tRepeat}>반복:{r==='none'?'없음':r==='one'?'한 문장':'전체'}</button>
  <button on:click={tSize}>{l?'기본크기':'글자 크게'}</button>
  <button on:click={tHideEng}>{h?'영어 보이기':'영어 숨기기'}</button>
  <button on:click={toggleBlankMode}>{b?'원문 보기':'빈칸 만들기'}</button>
</div>

<style>
header{position:fixed;top:0;left:0;right:0;height:3rem;z-index:20}
.list{position:absolute;top:50px;bottom:calc(50px + env(safe-area-inset-bottom));left:0;right:0;overflow-y:auto}
.controls{position:fixed;left:0;right:0;bottom:0;height:50px;display:flex;justify-content:center;gap:.5rem;padding:.5rem calc(env(safe-area-inset-left) + .5rem) calc(.5rem + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #ccc;z-index:10;width:100%}
.sent{padding:1rem;margin:.5rem 0;background:#f9f9f9;border-radius:.5rem;cursor:pointer}
.active{background:#d0ebff;font-weight:bold}
.line{display:flex;align-items:center}
.idx{margin-right:.5rem;color:#6b7280;font-weight:bold}
.content{flex:1}
.text{font-size:1rem}
.text.large{font-size:3.2rem}
.text.hidden{display:none}
.kor{font-size:1rem;color:#374151;margin-top:.25rem}
.loading{padding:1rem}
</style>


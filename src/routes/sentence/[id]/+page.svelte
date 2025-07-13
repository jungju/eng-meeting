<script lang="ts">
import{onMount,onDestroy,tick}from"svelte";import{page}from"$app/stores";import{base}from"$app/paths";import ControlBar from"$lib/components/ControlBar.svelte"
$:id=$page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1]||"";$:BASE=`${base}/assets/sentence/${id}`
let s:string[]=[],k:string[]=[],e:string[]=[],idx=-1,player:HTMLAudioElement,p=false,r:"none"|"one"|"all"="none",b=false,o:string[]=[],gapT:ReturnType<typeof setTimeout>|null=null
const gaps=[0,1e3,3e3,5e3];let gap=0,display:"both"|"hideKor"|"hideEng"="both",audio:"eng"|"kor"|"both"="eng",show=true,showExp=true,MAX_ALL=100,opts=[1,2,3,5];let opt=0,rep=opts[0],repCnt=0,allCnt=0,q:string[]=[]
$:rep=opts[opt];$:listBtm=show?`calc(60px + env(safe-area-inset-bottom))`:`env(safe-area-inset-bottom)`;$:if(r!=="all")allCnt=0
onMount(async()=>{if(!id)return;const res=await fetch(`${BASE}/sentences.json`);if(res.ok){const d=await res.json();s=d.sentences;k=d.korean;e=d.explanations??[]}})
onDestroy(()=>{player?.pause();gapT&&clearTimeout(gapT)})
async function play(i:number){if(i<0||i>=s.length)return;if(i!==idx)repCnt=0;idx=i;await tick();document.getElementById(`s-${i}`)?.scrollIntoView({behavior:"smooth",block:"center"});q=audio==="both"?["audio","audiok"]:audio==="kor"?["audiok"]:["audio"];await next()}
async function next(){if(!q.length){p=false;return}const f=q.shift()!;player.pause();player.src=`${BASE}/${f}/${String(idx+1).padStart(2,"0")}.mp3`;try{await player.play();p=true}catch{p=false}}
function onEnd(){gapT=setTimeout(async()=>{if(q.length)return await next();if(r==="one")return await play(idx);if(r==="all"){if(++repCnt<rep)return await play(idx);repCnt=0;const n=(idx+1)%s.length;if(!n&&++allCnt>=MAX_ALL){p=false;r="none";return}return await play(n)}if(++repCnt<rep)await play(idx);else p=false},gaps[gap])}
$:player&&(player.onended=onEnd)
const tPlay=()=>p?(player.pause(),p=false,q=[],gapT&&clearTimeout(gapT)):play(idx===-1?0:idx)
const tRepeat=()=>r=r==="none"?"one":r==="one"?"all":"none"
const tOpt=()=>{if(r!=="one")opt=(opt+1)%opts.length}
const tAudio=()=>audio=audio==="eng"?"kor":audio==="kor"?"both":"eng"
const tBlank=()=>{b=!b;if(b){o=[...s];s=s.map(t=>{const w=t.split(" "),len=w.length,hide=len<=2?1:len>=10?3:2,set=new Set<number>();while(set.size<hide)set.add(Math.floor(Math.random()*len));return w.map((w,i)=>set.has(i)?"____":w).join(" ")})}else s=[...o]}
const tDisp=()=>display=display==="both"?"hideKor":display==="hideKor"?"hideEng":"both"
const tGap=()=>gap=(gap+1)%gaps.length
const tShow=()=>show=!show
const tExp=()=>showExp=!show
$:gapLabel=gap?gaps[gap]/1e3+"s":"즉시"
$:dispLbl=display==="both"?"한/영":display==="hideKor"?"영":"한"
$:audLbl=audio==="eng"?"영":audio==="kor"?"한":"모두"
$:expLbl=showExp?"설명ON":"설명OFF"
$:buttons=[
{id:"play",icon:p?"⏸":"▶"},
{id:"repeat",text:"반복:"+(r==="none"?"없음":r==="one"?"문장":"전체")},
{id:"count",text:"횟수:"+rep+"x",active:r!=="one"},
{id:"disp",text:dispLbl},
{id:"blank",text:b?"원문":"빈칸"},
{id:"audio",text:"음성:"+audLbl},
{id:"gap",text:"간격:"+gapLabel},
{id:"exp",text:expLbl}
]
function onBarClick(e:CustomEvent<{id:string}>){switch(e.detail.id){case"play":tPlay();break;case"repeat":tRepeat();break;case"count":tOpt();break;case"disp":tDisp();break;case"blank":tBlank();break;case"audio":tAudio();break;case"gap":tGap();break;case"exp":tExp();break}}
</script>

<div class="list" style={`bottom:${listBtm}`}>
{#if s.length}
  {#each s as t,i}
  <div id={`s-${i}`} class="sent {i===idx?'act':''}" role="button" tabindex="0" on:click={()=>play(i)} on:keydown={(e)=>["Enter"," "].includes(e.key)&&play(i)}>
    <div class="ln">
      <span class="idx">{i+1}.</span>
      <div>
        <div class="en" class:hidden={display==="hideEng"}>{t}</div>
        <div class="ko" class:hidden={display==="hideKor"}>{k[i]}</div>
        {#if e[i]}<div class="ex" class:hidden={!showExp}>{e[i]}</div>{/if}
      </div>
    </div>
  </div>
  {/each}
{:else}<p>로딩...</p>{/if}
</div>

<ControlBar {buttons} on:click={onBarClick} on:toggle={(e)=>show=e.detail.visible}/>
<audio bind:this={player} playsinline preload="auto" style="display:none"/>

<style>
.list{position:absolute;top:50px;left:0;right:0;bottom:env(safe-area-inset-bottom);overflow-y:auto}
.sent{padding:1rem;margin:0.5rem 0;border-radius:0.5rem;background:#f9f9f9;cursor:pointer}
.act{background:#d0ebff;font-weight:bold}
.ln{display:flex;align-items:center}
.idx{margin-right:0.5rem;color:#6b7280;font-weight:bold}
.en,.ko{font-size:3.2rem}
.ko{color:#374151;margin-top:.25rem}
.ex{font-size:2.6rem;color:#6b7280;margin-top:.25rem}
.hidden{display:none}
</style>

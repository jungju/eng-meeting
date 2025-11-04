<script lang="ts">
import{onMount,onDestroy,tick}from"svelte";import{page}from"$app/stores";import{base}from"$app/paths";import ControlBar from"$lib/components/ControlBar.svelte";
$:id=$page.url.pathname.match(/\/sentence\/([^\/]+)/)?.[1]||"";$:BASE=`${base}/assets/sentence/${id}`;
let s:string[]=[],k:string[]=[],idx=-1,player:HTMLAudioElement,p=false,r:"none"|"one"|"all"="all",gapT:ReturnType<typeof setTimeout>|null=null,sleep=false,sleepT:ReturnType<typeof setTimeout>|null=null,prevRepeat:"none"|"one"|"all"="all";
const gaps=[0,1e3,3e3,5e3];let gap=0,display:"both"|"hideKor"|"hideEng"="both",audio:"eng"|"kor"|"both"="eng",show=true,MAX_ALL=100,opts=[1,3,5,10];let opt=0,rep=opts[0],repCnt=0,allCnt=0,q:string[]=[];
$:rep=opts[opt];$:listBtm=show?`calc(60px + env(safe-area-inset-bottom))`:`env(safe-area-inset-bottom)`;$:if(r!=="all")allCnt=0;
onMount(async()=>{if(!id)return;const res=await fetch(`${BASE}/sentences.json`);if(res.ok){const d=await res.json();s=d.sentences;k=d.korean}});onDestroy(()=>{player?.pause();gapT&&clearTimeout(gapT);sleepT&&clearTimeout(sleepT)});
async function play(i:number){if(i<0||i>=s.length)return;if(i!==idx)repCnt=0;idx=i;await tick();document.getElementById(`s-${i}`)?.scrollIntoView({behavior:"smooth",block:"center"});q=audio==="both"?["audio","audiok"]:audio==="kor"?["audiok"]:["audio"];await next()}
async function next(){if(!q.length){p=false;return}const f=q.shift()!;player.pause();player.src=`${BASE}/${f}/${String(idx+1).padStart(2,"0")}.mp3`;try{await player.play();p=true}catch{p=false}}
function onEnd(){gapT=setTimeout(async()=>{if(q.length)return await next();repCnt++;if(r==="all"){if(repCnt<rep)return await play(idx);repCnt=0;const n=(idx+1)%s.length;if(!n&&++allCnt>=MAX_ALL){p=false;r="none";return}return await play(n)}if(r==="one"){if(repCnt<rep)return await play(idx);p=false;return}if(repCnt<rep)return await play(idx);p=false},gaps[gap])}
$:player&&(player.onended=onEnd);
const tPlay=()=>p?(player.pause(),p=false,q=[],gapT&&clearTimeout(gapT)):play(idx===-1?0:idx);
const tRepeat=()=>{if(sleep)return;r=r==="none"?"one":r==="one"?"all":"none";repCnt=0};
const tOpt=()=>{opt=(opt+1)%opts.length;repCnt=0};
const tAudio=()=>{audio=audio==="eng"?"kor":audio==="kor"?"both":"eng"};
const tDisp=()=>display=display==="both"?"hideKor":display==="hideKor"?"hideEng":"both";
const tGap=()=>gap=(gap+1)%gaps.length;
const tShow=()=>show=!show;
const stopPlayback=()=>{player?.pause();p=false;q=[];gapT&&clearTimeout(gapT)};
const tSleep=()=>{if(!sleep){prevRepeat=r;r="all";sleep=true;sleepT&&clearTimeout(sleepT);sleepT=setTimeout(()=>{stopPlayback();sleep=false;sleepT=null;r=prevRepeat},18e5)}else{sleep=false;sleepT&&clearTimeout(sleepT);sleepT=null;r=prevRepeat}};
$:gapLabel=gap?gaps[gap]/1e3+"s":"즉시";$:dispLbl=display==="both"?"한/영":display==="hideKor"?"영":"한";$:audLbl=audio==="eng"?"영":audio==="kor"?"한":"모두";$:sleepLbl=sleep?"슬립ON":"슬립OFF";
$:buttons=[{id:"play",icon:p?"⏸":"▶"},{id:"repeat",text:"반복:"+(r==="none"?"없음":r==="one"?"문장":"전체")},{id:"count",text:"횟수:"+rep+"x",active:true},{id:"disp",text:dispLbl},{id:"audio",text:"음성:"+audLbl},{id:"gap",text:"간격:"+gapLabel},{id:"sleep",text:sleepLbl,active:sleep}];
function onBarClick(e:CustomEvent<{id:string}>){switch(e.detail.id){case"play":tPlay();break;case"repeat":tRepeat();break;case"count":tOpt();break;case"disp":tDisp();break;case"audio":tAudio();break;case"gap":tGap();break;case"sleep":tSleep();break}}
</script>

<div class="list" style={`position:absolute;top:50px;left:0;right:0;bottom:${listBtm};overflow-y:auto`}>{#if s.length}{#each s as t,i}<div id={`s-${i}`} role="button" tabindex="0" on:click={()=>play(i)} on:keydown={(e)=>["Enter"," "].includes(e.key)&&play(i)} style={`position:relative;padding:1rem;margin:.5rem 0;border-radius:.5rem;cursor:pointer;background:${p&&i===idx?(repCnt+1===rep?"#ffe3e3":"#d0ebff"):"#f9f9f9"};${p&&i===idx?"font-weight:bold;":""}`}><div style="display:flex;align-items:center"><span style="margin-right:.5rem;color:#6b7280;font-weight:bold">{i+1}.</span><div style="flex:1 1 auto"><div style={`font-size:3.2rem;display:${display==="hideEng"?"none":"block"}`}>{t}</div><div style={`font-size:3.2rem;color:#374151;margin-top:.25rem;display:${display==="hideKor"?"none":"block"}`}>{k[i]}</div></div></div>{#if (p&&i===idx)}<span style="position:absolute;right:8px;top:8px;font-size:1.2rem;opacity:.7">{repCnt+1}</span>{/if}</div>{/each}{:else}<p style="padding:1rem">로딩...</p>{/if}</div>

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

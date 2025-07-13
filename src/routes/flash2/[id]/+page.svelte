<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import ControlBar from '$lib/components/ControlBar.svelte';
  import './Page.css';

  /* ───────────────── 경로 ───────────────── */
  $: id         = $page.params.id;
  $: ASSET_BASE = `${base}/assets/sentence/${id}`;
  $: AUDIO_ENG  = `${ASSET_BASE}/audio`;
  $: AUDIO_KOR  = `${ASSET_BASE}/audiok`;

  /* ───────────────── 상태 ───────────────── */
  const gaps   = [10_000, 20_000, 30_000, -1];
  const counts = [10, 20, 50, -1];   // -1 ▶ 전체
  let gapIdx = 0;         $: gap   = gaps[gapIdx];
  let cntIdx = 0;         $: limit = counts[cntIdx];

  let s: string[] = [], k: string[] = [];
  let idx = -1, order = 0;
  let player: HTMLAudioElement;
  let playing=false, waiting=false, pendingNext=false;
  let remain=0, timer:number;
  const playedSet = new Set<number>();
  let playedOrder:number[] = [];
  let curLang:'kor'|'eng'='kor';
  let finished=false;

  /* ─────────── 힌트 & 자막 ─────────── */
  let hintLevel = 0;                 // 0‒4
  let caption:'kor'|'eng' = 'kor';   // 한/영 표시 상태

  /* ─────────── 마운트 ─────────── */
  onMount(()=>{
    if(!browser) return;
    fetch(`${ASSET_BASE}/sentences.json`)
      .then(r=>r.ok && r.json())
      .then((d:any)=>{ if(d){ s=d.sentences; k=d.korean; }});
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  });
  onDestroy(()=>{ player?.pause(); clearInterval(timer); });

  /* ─────────── 키보드 ─────────── */
  function onKey(e:KeyboardEvent){
    if(finished) return;
    if(['Space','ArrowRight'].includes(e.code)){ e.preventDefault(); nextRandom(); }
    else if(e.code==='ArrowLeft' && playedOrder.length>1){
      e.preventDefault();
      const last = playedOrder.pop();
      if(last!==undefined) playedSet.delete(last);
      order = playedOrder.length;
      play(playedOrder.at(-1)!, false, 'eng');
    }
  }

  /* ─────────── 재생 로직 ─────────── */
  function randIdx(){
    if(limit>=0 && playedSet.size>=limit) return -1;
    if(playedSet.size===s.length)         return -1;
    let i:number;
    do i=Math.floor(Math.random()*s.length); while(playedSet.has(i));
    return i;
  }

  async function play(i:number, inc=true, lang:'kor'|'eng'='kor'){
    curLang=lang;
    if(!browser || i<0 || i>=s.length) return;
    if(inc) order++;
    idx=i; playedSet.add(i); if(inc) playedOrder.push(i);
    await tick();
    player.pause();
    player.src =
      `${lang==='kor'?AUDIO_KOR:AUDIO_ENG}/${String(i+1).padStart(2,'0')}.mp3`;
    try{ await player.play(); playing=true; }catch{ pendingNext=true; }
  }

  function bindEnded(){
    player.onended = ()=>{
      playing=false;
      if(pendingNext){ pendingNext=false; nextRandom(); return; }
      if(curLang==='eng') return;

      const reached =
        (limit>=0 && playedSet.size>=limit) ||
        (limit<0  && playedSet.size===s.length);

      if(reached) return;
      if(gap>=0) startWaiting();
    };
  }
  $: browser && player && bindEnded();

  function startWaiting(){
    if(gap<0) return;
    waiting && clearInterval(timer);
    waiting=true; remain=Math.ceil(gap/1000);
    timer=setInterval(()=>{
      if(--remain<=0){
        clearInterval(timer); waiting=false;
        playing ? pendingNext=true : nextRandom();
      }
    },1000);
  }

  function nextRandom(){
    if(!browser) return;
    player.pause(); clearInterval(timer);
    playing=waiting=pendingNext=false; remain=0;
    const i = randIdx();
    if(i===-1){ finished=true; return; }
    play(i, true, caption);
  }

  /* ─────────── UI 헬퍼 ─────────── */
  const maskWord = (w:string,lv:number)=>
    lv===1 ? '_'.repeat(w.length) :
    lv===2 ? w[0] + '_'.repeat(w.length-1) : w;

  const maskedSentence = (sent:string)=>
    hintLevel===4 ? sent :
    hintLevel===3 ? sent.split(' ').map((w,i)=>i%2?'_'.repeat(w.length):w).join(' ') :
    hintLevel>0   ? sent.split(' ').map(w=>maskWord(w,hintLevel)).join(' ') : '';

  /* ─────────── 토글들 ─────────── */
  const stop = ()=>{
    player.pause(); clearInterval(timer);
    playing=waiting=pendingNext=false;
    idx=-1; order=remain=0; playedSet.clear(); playedOrder=[]; finished=false;
  };
  const toggleStartStop = ()=> playing||waiting ? stop() : finished ? stop() : nextRandom();
  const toggleHint  = (back=false)=> hintLevel = (hintLevel + (back?-1:1) + 5) % 5;
  const toggleCaption = ()=> {
    caption = caption==='kor' ? 'eng' : 'kor';

    if (idx !== -1 && !finished) {
      play(idx, false, caption);   // inc=false → order 그대로
    }
  }
  const toggleCount = ()=>{ cntIdx=(cntIdx+1)%counts.length; stop(); };
  const toggleGap   = ()=>{
    gapIdx=(gapIdx+1)%gaps.length;
    if(waiting){ clearInterval(timer); waiting=false; startWaiting(); }
  };
  const replay = (i:number)=> play(i,false,'eng');

  /* ─────────── ControlBar 버튼 ─────────── */
  $: cntLabel = limit<0 ? '전체' : `${limit}개`;
  $: isActive = playing||waiting;
  $: gapLabel = gap<0 ? '∞' : `${gap/1000}s`;
  $: hintLabel = `H${hintLevel}`;
  $: buttons = [
    { id:'start',   icon: isActive ? '⏹' : '▶' },
    { id:'count',   text:`출제:${cntLabel}` },
    { id:'hint',    text:hintLabel, active: hintLevel>0 },
    { id:'caption', text:caption==='kor' ? '한' : '영' },
    { id:'gap',     text:gapLabel },
  ];

  function onBarClick(e:CustomEvent<{id:string;backward?:boolean}>){
    const {id, backward=false} = e.detail;
    switch(id){
      case 'count': cntIdx=(cntIdx+(backward?-1:1)+counts.length)%counts.length; stop(); break;
      case 'gap'  : gapIdx=(gapIdx+(backward?-1:1)+gaps.length)%gaps.length;
                    waiting&&(clearInterval(timer),waiting=false,startWaiting()); break;
      case 'start': toggleStartStop(); break;
      case 'hint' : toggleHint(backward); break;
      case 'caption': toggleCaption(); break;
    }
  }
</script>

<main class="wrapper">
  {#if !finished}
    <div
      class="sentence-box {isActive ? 'playing' : ''}"
      role="button"
      tabindex="0"
      on:click={idx===-1 ? nextRandom : () => play(idx,false,'eng')}
      on:keydown={(e)=>
        ['Enter',' '].includes(e.key) &&
        (e.preventDefault(),
         idx===-1 ? nextRandom() : play(idx,false,'eng'))}>
      <div class="order-big">{idx===-1 ? 'Ready' : `#${order}`}</div>
      {#if gap>=0 && remain>0}<div class="remain-big">{remain}</div>{/if}

      {#if idx !== -1}
        {#if caption === 'kor'}
          <p class="kor">{k[idx]}</p>

          {#if hintLevel > 0}
            <p class="eng">{maskedSentence(s[idx])}</p>
          {:else}
            <p class="placeholder">•••</p>
          {/if}
        {:else}
          <!-- 영어 전체 문장 -->
          <p class="eng full">{s[idx]}</p>
        {/if}
      {/if}
    </div>

    <button class="next-btn" on:click={nextRandom}>NEXT ⏭</button>
  {/if}

  {#if finished}
    <div class="result-list">
      <h2>재생 순서 (클릭·Enter로 다시 듣기)</h2>
      {#each playedOrder as i, n}
        <div
          class="result-item"
          role="button"
          tabindex="0"
          on:click={() => replay(i)}
          on:keydown={(e)=>
            ['Enter',' '].includes(e.key) &&
            (e.preventDefault(), replay(i))}>
          <span class="num">{n+1}.</span>
          <span class="eng txt">{s[i]}</span>
          <span class="kor txt">{k[i]}</span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<ControlBar {buttons} on:click={onBarClick}/>
<audio bind:this={player} playsinline preload="auto"></audio>

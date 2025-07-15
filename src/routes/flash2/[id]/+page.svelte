<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import ControlBar from "$lib/components/ControlBar.svelte";

  /* ───── 경로 ───── */
  $: id         = $page.params.id;
  $: ASSET_BASE = `${base}/assets/sentence/${id}`;
  $: AUDIO_ENG  = `${ASSET_BASE}/audio`;
  $: AUDIO_KOR  = `${ASSET_BASE}/audiok`;

  /* ───── 설정 값 ───── */
  const gaps   = [10_000, 20_000, 30_000, -1];
  const counts = [10, 20, 50, -1];
  let gapIdx = 0, cntIdx = 0;
  $: gap   = gaps[gapIdx];
  $: limit = counts[cntIdx];

  /* ───── 상태 값 ───── */
  let s: string[] = [], k: string[] = [];
  let idx = -1, order = 0;
  let player: HTMLAudioElement;
  let playing = false, waiting = false, pendingNext = false;
  let remain = 0, timer: number;
  let finished = false;

  /* 새 기능 ─ 언어/표시 토글 */
  let useKor = true;                     // true=한글, false=영어
  $: curLang   = useKor ? "kor" : "eng"; // reactive
  let hideSentence = false;              // true=문장 숨김

  /* 힌트(기존 유지) */
  let hintLevel = 0;

  /* ───── 재생 관리용 ───── */
  const playedSet   = new Set<number>();
  let   playedOrder: number[] = [];

  /* ───── 초기 로드 ───── */
  onMount(() => {
    if (!browser) return;
    fetch(`${ASSET_BASE}/sentences.json`)
      .then(r => r.ok && r.json())
      .then((d: any) => { if (d) { s = d.sentences; k = d.korean; }});
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  onDestroy(() => {
    player?.pause();
    clearInterval(timer);
  });

  /* ───── 키보드 단축키 ───── */
  function onKey(e: KeyboardEvent) {
    if (finished) return;
    if (["Space", "ArrowRight"].includes(e.code)) {
      e.preventDefault(); nextRandom();
    } else if (e.code === "ArrowLeft" && playedOrder.length > 1) {
      e.preventDefault();
      const last = playedOrder.pop();
      if (last !== undefined) playedSet.delete(last);
      order = playedOrder.length;
      play(playedOrder.at(-1)!, false);
    }
  }

  /* ───── 재생 로직 ───── */
  function randIdx() {
    if ((limit >= 0 && playedSet.size >= limit) || playedSet.size === s.length) return -1;
    let i: number;
    do i = Math.floor(Math.random() * s.length); while (playedSet.has(i));
    return i;
  }

  async function play(i: number, inc = true) {
    if (!browser || i < 0 || i >= s.length) return;
    if (inc) order++;
    idx = i;
    playedSet.add(i);
    if (inc) playedOrder.push(i);
    await tick();

    player.pause();
    player.src = `${curLang === "kor" ? AUDIO_KOR : AUDIO_ENG}/${String(i + 1).padStart(2, "0")}.mp3`;
    try { await player.play(); playing = true; } catch { pendingNext = true; }
  }

  function bindEnded() {
    if (!browser || !player) return;
    player.onended = () => {
      playing = false;
      if (pendingNext) { pendingNext = false; nextRandom(); return; }
      const done = (limit >= 0 && playedSet.size >= limit) || (limit < 0 && playedSet.size === s.length);
      if (done) return;
      if (gap >= 0) startWaiting();
    };
  }
  $: browser && player && bindEnded();

  function startWaiting() {
    if (gap < 0) return;
    if (waiting) clearInterval(timer);
    waiting = true;
    remain = Math.ceil(gap / 1000);
    timer = setInterval(() => {
      if (--remain <= 0) {
        clearInterval(timer); waiting = false;
        playing ? (pendingNext = true) : nextRandom();
      }
    }, 1000);
  }

  function nextRandom() {
    player.pause(); clearInterval(timer);
    playing = waiting = pendingNext = false; remain = 0;
    const i = randIdx();
    if (i === -1) { finished = true; return; }
    play(i, true);
  }

  /* ───── 힌트 & 마스킹 ───── */
  const maskWord = (w: string, lv: number) =>
    lv === 1 ? "_".repeat(w.length) :
    lv === 2 ? w[0] + "_".repeat(w.length - 1) : w;
  const maskedSentence = (sent: string) =>
    hintLevel === 4 ? sent :
    hintLevel === 3 ? sent.split(" ").map((w, i) => i % 2 ? "_".repeat(w.length) : w).join(" ") :
    hintLevel > 0 ? sent.split(" ").map(w => maskWord(w, hintLevel)).join(" ") : "";

  /* ───── 제어 함수 ───── */
  function stop() {
    player.pause(); clearInterval(timer);
    playing = waiting = pendingNext = false;
    idx = -1; order = remain = 0;
    playedSet.clear(); playedOrder = [];
    finished = false;
  }
  function toggleStartStop() { (playing || waiting) ? stop() : finished ? stop() : nextRandom(); }
  function toggleCount()       { stop(); cntIdx  = (cntIdx + 1) % counts.length; }
  function toggleHint(bw=false){ stop(); hintLevel = (hintLevel + (bw?-1:1) + 5) % 5; }
  function toggleLanguage()    { stop(); useKor = !useKor; }
  function toggleHide()        { hideSentence = !hideSentence; }
  function toggleGap()         { stop(); gapIdx = (gapIdx + 1) % gaps.length; }
  const replay = (i:number)=> play(i,false);

  /* ───── 버튼 정의 ───── */
  $: cntLabel   = limit < 0 ? "전체" : `${limit}개`;
  $: isActive   = playing || waiting;
  $: gapLabel   = gap < 0 ? "∞" : `${gap/1000}s`;
  $: hintLabel  = `H${hintLevel}`;
  $: langLabel  = useKor ? "한" : "영";
  $: hideLabel  = hideSentence ? "보기" : "가리기";
  $: buttons = [
    { id:"start", icon:isActive ? "⏹" : "▶" },
    { id:"count", text:`출제:${cntLabel}` },
    { id:"hint",  text:hintLabel, active:hintLevel>0 },
    { id:"lang",  text:langLabel },
    { id:"hide",  text:hideLabel },
    { id:"gap",   text:gapLabel }
  ];

  function onBarClick(e: CustomEvent<{id:string;backward?:boolean}>) {
    const { id, backward=false } = e.detail;
    switch(id) {
      case "start": toggleStartStop(); break;
      case "count": toggleCount();    break;
      case "hint":  toggleHint(backward);  break;
      case "lang":  toggleLanguage(); break;
      case "hide":  toggleHide();     break;
      case "gap":   toggleGap();      break;
    }
  }
</script>

<main class="wrapper">
  {#if !finished}
    <div
      class="sentence-box {isActive ? 'playing' : ''}"
      role="button" tabindex="0"
      on:click={idx === -1 ? nextRandom : () => play(idx,false)}
      on:keydown={(e)=>
        ["Enter"," "].includes(e.key) &&
        (e.preventDefault(), idx === -1 ? nextRandom() : play(idx,false))
      }>
      <div class="order-big">{idx === -1 ? "Ready" : `#${order}`}</div>
      {#if gap >= 0 && remain > 0}<div class="remain-big">{remain}</div>{/if}

      {#if idx !== -1}
        {#if hideSentence}
          <p class="placeholder">•••</p>
        {:else if useKor}
          <p class="kor">{k[idx]}</p>
        {:else if hintLevel > 0}
          <p class="eng">{maskedSentence(s[idx])}</p>
        {:else}
          <p class="eng">{s[idx]}</p>
        {/if}
      {/if}
    </div>

    <button class="next-btn" on:click={nextRandom}>NEXT ⏭</button>
  {:else}
    <div class="result-list">
      <h2>재생 순서 (클릭·Enter로 다시 듣기)</h2>
      {#each playedOrder as i, n}
        <div
          class="result-item" role="button" tabindex="0"
          on:click={() => replay(i)}
          on:keydown={(e)=>["Enter"," "].includes(e.key)&& (e.preventDefault(), replay(i))}>
          <span class="num">{n+1}.</span>
          <span class="eng txt">{s[i]}</span>
          <span class="kor txt">{k[i]}</span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<ControlBar {buttons} on:click={onBarClick}/>
<audio bind:this={player} playsinline preload="auto"/>

<style>
/* 기존 스타일 그대로 (생략 없이 유지) */
.wrapper{position:absolute;top:50px;bottom:120px;left:0;right:0;display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding-top:1rem}
.sentence-box{width:85vw;max-width:900px;min-width:260px;height:clamp(9rem,38vh,18rem);padding:1.6rem 1rem;border:3px solid #ccc;border-radius:1rem;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;user-select:none;overflow-y:auto}
.sentence-box p{word-break:keep-all;white-space:normal;letter-spacing:3px}
.playing{animation:pulse 1.4s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,0.6)}70%{box-shadow:0 0 0 18px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}
.order-big{position:absolute;top:.3rem;left:50%;transform:translateX(-50%);font-size:clamp(1.8rem,4.5vw,2.8rem);font-weight:800;color:#2563eb}
.remain-big{position:absolute;bottom:.3rem;left:50%;transform:translateX(-50%);font-size:clamp(1rem,2.8vw,1.6rem);font-weight:700;color:#16a34a}
.eng,.kor,.placeholder{font-size:clamp(.95rem,2.8vw,1.6rem);line-height:1.35;margin:.2rem 0}
.kor{color:#374151}.placeholder{color:#9ca3af}
.next-btn{margin:1rem 0;padding:.6rem 2rem;font-size:clamp(.95rem,2.8vw,1.4rem);border-radius:50px;background:#1d4ed8;color:#fff;border:none;cursor:pointer}
.next-btn:hover{background:#2563eb}
.result-list{width:92%;max-width:900px;margin:1.5rem auto 2rem;border-top:2px solid #ddd;padding-top:.7rem}
.result-list h2{text-align:center;font-size:1.15rem;margin-bottom:.7rem}
.result-item{display:flex;flex-wrap:wrap;gap:.22rem .4rem;margin-bottom:.4rem;font-size:clamp(.7rem,1.7vw,.9rem);cursor:pointer}
.num{font-weight:600;color:#2563eb}
.txt{word-break:keep-all;white-space:normal}
.result-item .eng{flex:1 1 55%}
.result-item .kor{flex:1 1 40%;color:#374151}
audio{display:none}
</style>

<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import ControlBar from "$lib/components/ControlBar.svelte";

  /* ────────────────────────── 경로 ────────────────────────── */
  $: id = $page.params.id;
  $: ASSET_BASE = `${base}/assets/sentence/${id}`;
  $: AUDIO_ENG = `${ASSET_BASE}/audio`;
  $: AUDIO_KOR = `${ASSET_BASE}/audiok`;

  /* ────────────────────────── 상태 ────────────────────────── */
  const gaps = [10_000, 20_000, 30_000, -1];
  const counts = [10, 20, 50, -1]; // -1 ▶ 전체
  let gapIdx = 0;
  $: gap = gaps[gapIdx];
  let cntIdx = 0;
  $: limit = counts[cntIdx]; // 현재 출제 수

  let s: string[] = [],
    k: string[] = [];
  let idx = -1,
    order = 0;
  let player: HTMLAudioElement;
  let playing = false,
    waiting = false,
    pendingNext = false;
  let remain = 0,
    timer: number;
  const playedSet = new Set<number>();
  let playedOrder: number[] = [];
  let curLang: "kor" | "eng" = "kor";
  let finished = false;

  /* ───────────── 힌트 & 자막 ───────────── */
  let hintLevel = 0; // 0~4
  let showKor = true;

  /* ───────────── 마운트 (브라우저 전용) ───────────── */
  onMount(() => {
    if (!browser) return;

    // 데이터 fetch도 브라우저에서만 수행 (SSR에서는 건너뜀)
    fetch(`${ASSET_BASE}/sentences.json`)
      .then((r) => r.ok && r.json())
      .then((d: any) => {
        if (d) {
          s = d.sentences;
          k = d.korean;
        }
      });

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  onDestroy(() => {
    if (!browser) return;
    player?.pause();
    clearInterval(timer);
  });

  /* ───────────── 키보드 ───────────── */
  function onKey(e: KeyboardEvent) {
    if (finished) return;
    if (["Space", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
      nextRandom();
    } else if (e.code === "ArrowLeft" && playedOrder.length > 1) {
      e.preventDefault();

      // 1) 방금 풀었던 문제를 완전히 되돌리기
      const last = playedOrder.pop();
      if (last !== undefined) playedSet.delete(last); // ← 누락된 부분

      // 2) 문제 번호(order)도 한 칸 줄이기
      order = playedOrder.length;

      // 3) 직전 문제의 영어 트랙 재생
      play(playedOrder.at(-1)!, false, "eng");
    }
  }

  /* ───────────── 재생 로직 ───────────── */
  function randIdx() {
    // ── 이미 오늘 낼 만큼 다 냈으면 끝 ─────────────
    if (limit >= 0 && playedSet.size >= limit) return -1;
    if (playedSet.size === s.length) return -1;

    // ── 전체 풀( s.length )에서 무작위로 하나 고르기 ──
    let i: number;
    do i = Math.floor(Math.random() * s.length);
    while (playedSet.has(i));
    return i;
  }

  async function play(i: number, inc = true, lang: "kor" | "eng" = "kor") {
    curLang = lang;
    if (!browser || i < 0 || i >= s.length) return;
    if (inc) order++;
    idx = i;
    playedSet.add(i);
    if (inc) playedOrder.push(i);
    await tick();
    player.pause();
    player.src = `${lang === "kor" ? AUDIO_KOR : AUDIO_ENG}/${String(i + 1).padStart(2, "0")}.mp3`;
    try {
      await player.play();
      playing = true;
    } catch {
      pendingNext = true;
    }
  }

  function bindEnded() {
    if (!browser || !player) return;
    player.onended = () => {
      playing = false;
      if (pendingNext) {
        pendingNext = false;
        nextRandom();
        return;
      }
      // 영어(재플레이) 트랙이면 여기서 종료
      if (curLang === "eng") return;

      // ───────── ① 이번 라운드가 끝났는지 먼저 체크 ─────────
      const reachedLimit =
        (limit >= 0 && playedSet.size >= limit) || // 10·20·50 모드
        (limit < 0 && playedSet.size === s.length); // 전체 모드

      if (reachedLimit) {
        // 끝났더라도 자동 대기·자동 종료는 하지 않는다.
        // 사용자가 NEXT 를 누르면 nextRandom() → finished 로 넘어감
        return;
      }

      // ───────── ② 아직 문제 남았으면 gap 대기 ─────────
      if (gap >= 0) startWaiting();
    };
  }
  $: browser && player && bindEnded();

  function startWaiting() {
    if (gap < 0) return;
    if (waiting) clearInterval(timer); // 이미 대기 중이면 기존 인터벌 제거
    waiting = true;
    remain = Math.ceil(gap / 1000);
    timer = setInterval(() => {
      if (--remain <= 0) {
        clearInterval(timer);
        waiting = false;
        playing ? (pendingNext = true) : nextRandom();
      }
    }, 1000);
  }

  function nextRandom() {
    if (!browser) return;
    player.pause();
    clearInterval(timer);
    playing = waiting = pendingNext = false;
    remain = 0;
    const i = randIdx();
    if (i === -1) {
      finished = true;
      return;
    }
    play(i, true, "kor");
  }

  /* ───────────── UI 헬퍼 ───────────── */
  const maskWord = (w: string, lv: number) =>
    lv === 1
      ? "_".repeat(w.length)
      : lv === 2
        ? w[0] + "_".repeat(w.length - 1)
        : w;
  const maskedSentence = (sent: string) =>
    hintLevel === 4
      ? sent
      : hintLevel === 3
        ? sent
            .split(" ")
            .map((w, i) => (i % 2 ? "_".repeat(w.length) : w))
            .join(" ")
        : hintLevel > 0
          ? sent
              .split(" ")
              .map((w) => maskWord(w, hintLevel))
              .join(" ")
          : "";

  /* ───────────── 토글 ───────────── */
  const stop = () => {
    if (!browser) return;
    player.pause();
    clearInterval(timer);
    playing = waiting = pendingNext = false;
    idx = -1;
    order = remain = 0;
    playedSet.clear();
    playedOrder = [];
    finished = false;
  };
  const toggleStartStop = () =>
    playing || waiting ? stop() : finished ? stop() : nextRandom();
  function toggleHint(backward = false) {
    hintLevel = (hintLevel + (backward ? -1 : 1) + 5) % 5;
  }
  const toggleKor = () => (showKor = !showKor);
  const toggleCount = () => {
    cntIdx = (cntIdx + 1) % counts.length;
    stop(); // 출제 수가 바뀌면 새 라운드 시작
  };
  const toggleGap = () => {
    gapIdx = (gapIdx + 1) % gaps.length;

    // 재생 중에는 gap 값만 바꿔 놓는다. (현재 트랙 끝난 뒤부터 적용)
    if (waiting) {
      // 대기 중이라면 새 gap 으로 타이머 재시작
      clearInterval(timer);
      waiting = false;
      remain = 0;
      startWaiting();
    }
  };
  const replay = (i: number) => play(i, false, "eng");

  /* ───────────── ControlBar 동적 버튼 ───────────── */
  $: cntLabel = limit < 0 ? "전체" : limit + "개";
  $: isActive = playing || waiting;
  $: gapLabel = gap < 0 ? "∞" : `${gap / 1000}s`;
  $: hintLabel = `H${hintLevel}`;
  $: buttons = [
    { id: "start", icon: isActive ? "⏹" : "▶" },
    { id: "count", text: `출제:${cntLabel}` }, // ← 추가
    { id: "hint", text: hintLabel, active: hintLevel > 0 },
    { id: "kor", text: showKor ? "가" : "한" },
    { id: "gap", text: gapLabel },
  ];

  function onBarClick(e: CustomEvent<{ id: string; backward?: boolean }>) {
    const { id, backward = false } = e.detail;

    switch (id) {
      case "count":
        cntIdx = (cntIdx + (backward ? -1 : 1) + counts.length) % counts.length;
        stop();
        break;

      case "gap":
        gapIdx = (gapIdx + (backward ? -1 : 1) + gaps.length) % gaps.length;
        if (waiting) {
          clearInterval(timer);
          waiting = false;
          startWaiting();
        }
        break;

      /* 나머지 버튼들은 기존과 동일 */
      case "start":
        toggleStartStop();
        break;
      case "hint":
        toggleHint(backward);
        break;
      case "kor":
        toggleKor();
        break;
    }
  }
</script>

<main class="wrapper">
  {#if !finished}
    <div
      class="sentence-box {isActive ? 'playing' : ''}"
      role="button"
      tabindex="0"
      on:click={idx === -1 ? nextRandom : () => play(idx, false, "eng")}
      on:keydown={(e) =>
        ["Enter", " "].includes(e.key) &&
        (e.preventDefault(),
        idx === -1 ? nextRandom() : play(idx, false, "eng"))}
    >
      <div class="order-big">{idx === -1 ? "Ready" : `#${order}`}</div>
      {#if gap >= 0 && remain > 0}<div class="remain-big">{remain}</div>{/if}
      {#if idx !== -1}
        {#if showKor}<p class="kor">{k[idx]}</p>{/if}
        {#if hintLevel > 0}<p class="eng">{maskedSentence(s[idx])}</p>{:else}<p
            class="placeholder"
          >
            •••
          </p>{/if}
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
          on:keydown={(e) =>
            ["Enter", " "].includes(e.key) && (e.preventDefault(), replay(i))}
        >
          <span class="num">{n + 1}.</span><span class="eng txt">{s[i]}</span
          ><span class="kor txt">{k[i]}</span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<ControlBar {buttons} on:click={onBarClick} />

<audio bind:this={player} playsinline preload="auto"></audio>

<style>
  /* ───── 기본 레이아웃 ───── */
  .wrapper {
    position: absolute;
    top: 50px;
    bottom: 120px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    padding-top: 1rem;
  }

  /* ───── 문장 상자 ───── */
  .sentence-box {
    width: 85vw;
    max-width: 900px;
    min-width: 260px;
    height: clamp(9rem, 38vh, 18rem);
    padding: 1.6rem 1rem;
    border: 3px solid #ccc;
    border-radius: 1rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    user-select: none;
    overflow-y: auto;
  }
  .sentence-box p {
    word-break: keep-all;
    white-space: normal;
    letter-spacing: 3px;
  }
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
    }
    70% {
      box-shadow: 0 0 0 18px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
  .playing {
    animation: pulse 1.4s infinite;
  }
  .order-big {
    position: absolute;
    top: 0.3rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(1.8rem, 4.5vw, 2.8rem);
    font-weight: 800;
    color: #2563eb;
  }
  .remain-big {
    position: absolute;
    bottom: 0.3rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(1rem, 2.8vw, 1.6rem);
    font-weight: 700;
    color: #16a34a;
  }
  .eng,
  .kor,
  .placeholder {
    font-size: clamp(0.95rem, 2.8vw, 1.6rem);
    line-height: 1.35;
    margin: 0.2rem 0;
  }
  .kor {
    color: #374151;
  }
  .placeholder {
    color: #9ca3af;
  }
  .next-btn {
    margin: 1rem 0;
    padding: 0.6rem 2rem;
    font-size: clamp(0.95rem, 2.8vw, 1.4rem);
    border-radius: 50px;
    background: #1d4ed8;
    color: #fff;
    border: none;
    cursor: pointer;
  }
  .next-btn:hover {
    background: #2563eb;
  }

  /* ───── 결과 리스트 ───── */
  .result-list {
    width: 92%;
    max-width: 900px;
    margin: 1.5rem auto 2rem;
    border-top: 2px solid #ddd;
    padding-top: 0.7rem;
  }
  .result-list h2 {
    text-align: center;
    font-size: 1.15rem;
    margin-bottom: 0.7rem;
  }
  .result-item {
    display: flex;
    flex-wrap: wrap;
    gap: 0.22rem 0.4rem;
    margin-bottom: 0.4rem;
    font-size: clamp(0.7rem, 1.7vw, 0.9rem);
    cursor: pointer;
  }
  .num {
    font-weight: 600;
    color: #2563eb;
  }
  .txt {
    word-break: keep-all;
    white-space: normal;
  }
  .result-item .eng {
    flex: 1 1 55%;
  }
  .result-item .kor {
    flex: 1 1 40%;
    color: #374151;
  }
  audio {
    display: none;
  }
</style>

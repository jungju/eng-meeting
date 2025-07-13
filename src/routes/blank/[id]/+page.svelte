<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import ControlBar from '$lib/components/ControlBar.svelte';
  import './Page.css';

  /* ────────── Constants ────────── */
  const COUNTS = [10, 20, 50, -1] as const;
  const TIMES  = [10, 30, -1] as const;   // -1 ▶ 무한
  const REG_PUNCT = /[.,!?]/g;

  /* ────────── Stores & Refs ────────── */
  $: id = $page.params.id;
  $: ASSET_BASE = `${base}/assets/sentence/${id}`;
  $: AUDIO_ENG = `${ASSET_BASE}/audio`;

  /* ────────── Limit Settings ────────── */
  let cntIdx = 0;  $: limit = COUNTS[cntIdx];
  let timeIdx = 0; $: timeLimit = TIMES[timeIdx];

  /* ────────── State ────────── */
  let s: string[] = [];
  let k: string[] = [];
  let wordPool: string[] = [];

  let nodes: WordNode[] = [];
  let blankChoices: BlankChoice[] = [];
  let player: HTMLAudioElement;

  // progress
  let idx = -1;
  let order = 0;
  let finished = false;
  let blankPtr = 0;
  let correctCnt = 0;
  let totalBlanks = 0;
  $: score = totalBlanks ? Math.round((correctCnt / totalBlanks) * 100) : 0;

  // timer
  let remaining = 0;               // seconds left for current sentence
  let timer: ReturnType<typeof setInterval> | undefined;
  $: showTime = timeLimit < 0 ? '∞' : `${remaining}s`;

  // tracking played
  const playedSet = new Set<number>();
  const playedOrder: number[] = [];

  /* ────────── Types ────────── */
  type RevealState = 'correct' | 'wrong' | undefined;

  interface WordNode {
    text: string;
    isBlank: boolean;
    active: boolean;
    len: number;
    result?: RevealState;  // after reveal: 'correct' | 'wrong'
  }

  interface BlankChoice {
    index: number;
    choices: string[];
  }

  /* ────────── Utilities ────────── */
  const clean = (w: string) => w.replace(REG_PUNCT, '');

  const shuffle = <T,>(a: T[]): T[] => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const randIdx = () => {
    if ((limit >= 0 && playedSet.size >= limit) || playedSet.size === s.length) return -1;
    let i: number;
    do i = Math.floor(Math.random() * s.length); while (playedSet.has(i));
    return i;
  };

  /* ────────── Lifecycle ────────── */
  onMount(async () => {
    const res = await fetch(`${ASSET_BASE}/sentences.json`);
    if (!res.ok) return;
    const data = await res.json();
    s = data.sentences;
    k = data.korean;
    wordPool = [...new Set(s.flatMap((t: string) => t.split(' ').map(clean)))];
  });

  /* ────────── Timer Helpers ────────── */
  function startTimer() {
    clearTimer();
    if (timeLimit < 0) return;      // 무한
    remaining = timeLimit;
    timer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearTimer();
        // 시간 초과 → 다음 문제로 이동
        next();
      }
    }, 1000);
  }

  function clearTimer() {
    if (timer) clearInterval(timer);
    timer = undefined;
  }

  /* ────────── Game Flow ────────── */
  function prepare(i: number) {
    const words = s[i].split(' ');

    // 1) pick 3–4 blanks
    const picks = new Set<number>();
    const want = Math.min(4, 3 + Math.floor(Math.random() * 2));
    while (picks.size < Math.min(want, words.length)) {
      picks.add(Math.floor(Math.random() * words.length));
    }

    // 2) create choices per blank (10 options)
    blankChoices = [...picks]
      .map((index) => {
        const correct = clean(words[index]);
        const pool = new Set<string>([correct]);
        while (pool.size < 10) pool.add(wordPool[Math.floor(Math.random() * wordPool.length)]);
        return { index, choices: shuffle([...pool]) };
      })
      .sort((a, b) => a.index - b.index);

    // 3) build display nodes
    nodes = words.map((w, idx) => {
      const asBlank = picks.has(idx);
      return {
        text: w,
        isBlank: asBlank,
        active: asBlank && idx === blankChoices[0].index,
        len: asBlank ? Math.max(clean(w).length, 3) : 0,
        result: undefined,
      } as WordNode;
    });

    blankPtr = 0;
    startTimer();
  }

  function next() {
    const i = randIdx();
    if (i === -1) {
      finished = true;
      clearTimer();
      return;
    }

    idx = i;
    order++;
    playedSet.add(i);
    playedOrder.push(i);
    prepare(i);
    totalBlanks += blankChoices.length;
  }

  function choose(opt: string) {
    const { index } = blankChoices[blankPtr];
    const correctWord = clean(nodes[index].text);
    const isCorrect = opt === correctWord;

    if (isCorrect) correctCnt++;

    nodes[index].isBlank = false;
    nodes[index].active = false;
    nodes[index].result = isCorrect ? 'correct' : 'wrong';

    blankPtr++;
    if (blankPtr < blankChoices.length) {
      nodes[blankChoices[blankPtr].index].active = true;
    } else {
      next();
    }
  }

  function restart() {
    clearTimer();
    idx = -1;
    order = 0;
    correctCnt = 0;
    totalBlanks = 0;
    finished = false;
    playedSet.clear();
    playedOrder.length = 0;
    nodes = [];
    blankChoices = [];
    remaining = 0;
  }

  /* ────────── ControlBar ────────── */
  $: buttons = [
    { id: 'start', icon: idx === -1 ? '▶' : '⏹' },
    { id: 'count', text: limit < 0 ? '전체' : `${limit}개` },
    { id: 'time',  text: timeLimit < 0 ? '∞' : `${timeLimit}s` },
  ];

  function handleBar(e: CustomEvent<{ id: string }>) {
    const { id } = e.detail;

    if (id === 'start') {
      idx === -1 ? next() : restart();
    }
    if (id === 'count') {
      cntIdx = (cntIdx + 1) % COUNTS.length;
      restart();
    }
    if (id === 'time') {
      timeIdx = (timeIdx + 1) % TIMES.length;
      // 게임 중단 (pause) → 전체 리셋
      restart();
    }
  }
</script>

<main class="wrapper">
  {#if !finished}
    <!-- Sentence -->
    <div class="sentence-box">
      <div class="order-big">{idx === -1 ? 'Ready' : `#${order}`}</div>
      {#if timeLimit >= 0 && idx !== -1}
        <div class="timer">⏱ {showTime}</div>
      {/if}

      {#if idx !== -1}
        <p class="kor">{k[idx]}</p>
        <p class="eng">
          {#each nodes as n}
            {#if n.isBlank}
              <span class="blank {n.active ? 'highlight' : ''}" style="width:{n.len}ch;"></span>{' '}
            {:else if n.result === 'correct'}
              <span class="revealed correct-word">{n.text}</span>{' '}
            {:else if n.result === 'wrong'}
              <span class="revealed wrong-word">{n.text}</span>{' '}
            {:else}
              {n.text}{' '}
            {/if}
          {/each}
        </p>
      {/if}
    </div>

    <!-- Choice Grid -->
    {#if idx !== -1 && blankPtr < blankChoices.length}
      <div class="choices">
        {#each blankChoices[blankPtr].choices as w}
          <button class="choice-btn" on:click={() => choose(w)}>{w}</button>
        {/each}
      </div>
    {/if}
  {:else}
    <!-- Result -->
    <div class="result-list">
      <h2>정답 : {correctCnt} / {totalBlanks}</h2>
      <h2>점수 : {score}점</h2>
    </div>
  {/if}
</main>

<ControlBar {buttons} on:click={handleBar} />
<audio bind:this={player} playsinline preload="auto"></audio>

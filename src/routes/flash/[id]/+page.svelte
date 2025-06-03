<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	$: id = $page.params.id;
	$: ASSET_BASE = `${base}/assets/sentence/${id}`;

	let s = [], k = [];
	let idx = -1, order = 0;
	let player;                           // 단일 <audio>
	let playing = false, waiting = false, pendingNext = false;
	let show = 'none', gaps = [10000, 20000, -1], gap = gaps[0];
	let remain = 0, timer, played = new Set();

	onMount(async () => {
		const r = await fetch(`${ASSET_BASE}/sentences.json`);
		if (r.ok) { const d = await r.json(); s = d.sentences; k = d.korean; }
	});
	onDestroy(() => { player?.pause(); clearInterval(timer); });

	function randIdx() {
		if (played.size === s.length) return -1;
		let i; do i = Math.floor(Math.random() * s.length); while (played.has(i));
		return i;
	}

	async function play(i, inc = true) {
		if (i < 0 || i >= s.length) return;
		if (inc) order++;
		idx = i; played.add(i); await tick();
		player.pause();
		player.src = `${ASSET_BASE}/audio/${String(i + 1).padStart(2, '0')}.mp3`;
		try { await player.play(); }          // iOS 오토플레이 차단 감지
		catch { pendingNext = true; return; }
		playing = true;
	}

	playerEnded();
	function playerEnded() {                // onended 콜백 등록
		if (!player) return;
		player.onended = () => {
			playing = false;
			if (pendingNext) { pendingNext = false; nextRandom(); }
			else if (gap > 0 && played.size < s.length) startWaiting();
		};
	}
	$: player && playerEnded();             // player 준비되면 이벤트 바인딩

	function startWaiting() {
		waiting = true; remain = Math.ceil(gap / 1000);
		timer = setInterval(() => {
			if (--remain <= 0) {
				clearInterval(timer); waiting = false;
				playing ? pendingNext = true : nextRandom();
			}
		}, 1000);
	}

	function nextRandom() {
		player.pause(); clearInterval(timer);
		playing = waiting = pendingNext = false; remain = 0;
		const i = randIdx(); if (i !== -1) play(i);
	}

	function centerClick() {
		if (idx === -1) nextRandom();
		else { player.pause(); clearInterval(timer); waiting = pendingNext = false; remain = 0; play(idx, false); }
	}

	function stop() {
		player.pause(); clearInterval(timer);
		playing = waiting = pendingNext = false; idx = -1; order = 0; remain = 0; played.clear();
	}

	function toggleShow() { show = show === 'none' ? 'eng' : show === 'eng' ? 'kor' : 'none'; }
	function setGap(ms) { gap = ms; if (waiting) { clearInterval(timer); waiting = false; remain = 0; } }
</script>

<main class="wrapper">
	<div class="sentence-box {(playing||waiting)?'playing':''}" on:click={centerClick}>
		<div class="order-big">{idx===-1?'Ready':`#${order}`}</div>
		{#if gap>=0 && remain>0}<div class="remain-big">{remain}</div>{/if}
		{#if idx !== -1}
			{#if show === 'eng'}<p class="eng">{s[idx]}</p>
			{:else if show === 'kor'}<p class="kor">{k[idx]}</p>
			{:else}<p class="placeholder">•••</p>{/if}
		{/if}
	</div>
	<button class="next-btn" on:click={nextRandom}>NEXT ⏭</button>
</main>

<div class="controls">
	<button on:click={stop}>⏹ 멈춤</button>
	<button on:click={toggleShow}>{show==='none'?'표시:없음':show==='eng'?'표시:영어':'표시:한글'}</button>
	<div class="gap-group">
		{#each gaps as g}
			<button class:selected={gap===g} on:click={() => setGap(g)}>{g<0?'시간 제한 없음':`${g/1000}s`}</button>
		{/each}
	</div>
</div>

<audio bind:this={player} playsinline preload="auto"></audio>

<!-- ✅ script 부분 그대로 (생략) -->

<style>
/* ─── 레이아웃 ─────────────────────────────────────────────── */
.wrapper{
	position:absolute;
	top:50px;bottom:120px;left:0;right:0;
	display:flex;flex-direction:column;
	align-items:center;justify-content:center;
}

/* ─── 문장 박스 ─────────────────────────────────────────────── */
.sentence-box{
	width:80vw;                 /* 화면 기준 80% */
	max-width:900px;
	min-width:260px;
	height:clamp(12rem,45vh,22rem); /* 세로 45% 를 넘지 않음 */
	padding:2.5rem 1.5rem;
	border:3px solid #ccc;border-radius:1.2rem;
	position:relative;
	display:flex;align-items:center;justify-content:center;
	text-align:center;cursor:pointer;user-select:none;
}
@keyframes pulse{
	0%{box-shadow:0 0 0 0 rgba(59,130,246,.6)}
	70%{box-shadow:0 0 0 25px rgba(59,130,246,0)}
	100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}
}
.playing{animation:pulse 1.6s infinite}

/* 순서/타이머 */
.order-big{
	position:absolute;top:.6rem;left:50%;transform:translateX(-50%);
	font-size:clamp(2.6rem,6vw,4rem);font-weight:800;color:#2563eb;
}
.remain-big{
	position:absolute;bottom:.6rem;left:50%;transform:translateX(-50%);
	font-size:clamp(1.8rem,4.5vw,3rem);font-weight:700;color:#16a34a;
}

/* 문장 글꼴 (반응형) */
.eng,.kor,.placeholder{
	font-size:clamp(1.8rem,4.5vw,3.2rem);
	line-height:1.33;margin:0;
}
.kor{color:#374151}
.placeholder{color:#9ca3af}

/* ─── NEXT 버튼 ────────────────────────────────────────────── */
.next-btn{
	margin-top:2rem;padding:1rem 3rem;
	font-size:clamp(1.4rem,4vw,2.2rem);
	border-radius:60px;background:#1d4ed8;color:#fff;border:none;cursor:pointer;
}
.next-btn:hover{background:#2563eb}

/* ─── 컨트롤 바 ────────────────────────────────────────────── */
.controls{
	position:fixed;left:0;right:0;bottom:0;
	height:80px;display:flex;align-items:center;justify-content:center;
	gap:1rem;padding:1rem;
	background:#fff;border-top:1px solid #d1d5db;
}
.gap-group{display:flex;gap:.5rem}
button.selected{font-weight:700;border:2px solid #1d4ed8}
audio{display:none}

/* ─── iPad 세로(768px↓) 최적화 ─────────────────────────────── */
@media (max-height:768px){
	.sentence-box{height:clamp(10rem,50vh,18rem);padding:2rem 1rem;}
	.next-btn{margin-top:1.5rem;}
}
</style>


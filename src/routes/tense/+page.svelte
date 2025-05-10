<script>
  import { onMount } from 'svelte';

  /* ──────────────── 상태 변수 ──────────────── */
  let info = [], en = [], ko = [];     // 세트 정보·영문·한글
  let sel = '', base = '', pre = '';   // 선택 파일·동사·프리픽스
  let aud, mode = '', pIdx = null;     // 오디오·모드(blank/guess 등)·재생 인덱스
  let sc = { c: 0, t: 0 };             // guess 점수
  let q = null, last = null;           // guess 문제·최근 클릭 결과
  let koOn = false, all = false, aIdx = 0;  // 한글 토글·전체 재생·인덱스

  const hd = [
    'Present', 'Past', 'Future',
    'Present Progressive', 'Past Progressive', 'Future Progressive',
    'Present Perfect', 'Past Perfect', 'Future Perfect'
  ];
  const sb = ['I', 'You', 'He', 'We', 'They'];

  /* ──────────────── 공통 fetch ──────────────── */
  const req = async url => {
    const r = await fetch(url);
    return r.ok ? await r.json() : [];
  };

  /* ──────────────── 초기 로드 ──────────────── */
  onMount(async () => {
    info = await req('/assets/tense/info.json');
    await ld('sentences1-1.json', 'eat');       // 기본 세트
  });

  /* ──────────────── 세트 로드 ──────────────── */
  async function ld(file, verb) {
    const e = await req(`/assets/tense/${file}`);
    if (!e.length) return alert(`fail ${file}`);

    ko   = await req(`/assets/tense/${file.replace('-1.json', '-2.json')}`);
    en   = e;
    sel  = file;
    base = verb;
    pre  = file.replace('sentences', '').replace('.json', '');

    aud?.pause();
    pIdx = null;
    mode = '';
    sc   = { c: 0, t: 0 };
    q    = null;
    last = null;
    koOn = false;
    all  = false;
  }

  /* ──────────────── 헬퍼 ──────────────── */
  const row = i => (koOn && ko.length ? ko : en).slice(i * 9, i * 9 + 9);

  function blankify(s) {
    const p = s.replace(/\.$/, '').split(' ');
    return p.length < 3
      ? s
      : `${p[0]} ${p.slice(1, -1).map(w => '_'.repeat(w.length)).join(' ')} ${p[p.length - 1]}`;
  }

  /* ──────────────── 단일 재생 ──────────────── */
  const play = i => {
    if (mode || !pre.endsWith('-1')) return;
    aud?.pause();
    aud      = new Audio(`/assets/tense/audio/${pre}-${i + 1}.mp3`);
    pIdx     = i;
    aud.onended = () => (pIdx = null);
    aud.play().catch(() => {});
  };

  /* ──────────────── 전체 재생 ──────────────── */
  function seq() {
    if (!all || aIdx >= en.length) {
      all = false;
      pIdx = null;
      return;
    }
    aud?.pause();
    aud      = new Audio(`/assets/tense/audio/${pre}-${aIdx + 1}.mp3`);
    pIdx     = aIdx;
    aud.onended = () => {
      aIdx++;
      seq();
    };
    aud.play().catch(() => {});
  }

  function toggleAll() {
    if (all) {
      aud?.pause();
      all = false;
      pIdx = null;
      return;
    }
    if (sel.startsWith('tense_info') || mode || !pre.endsWith('-1')) return;
    all  = true;
    aIdx = 0;
    seq();
  }

  /* ──────────────── 모드 전환 ──────────────── */
  const blank = () => {
    mode = 'blank';
    last = null;
  };

  const guess = () => {
    if (mode === 'guess') {
      aud?.pause();
      aud && (aud.currentTime = 0, aud.play().catch(() => {}));
      return;
    }
    koOn = false;
    mode = 'guess';
    sc   = { c: 0, t: 0 };
    nextQuestion();
  };

  /* ──────────────── guess 기능 ──────────────── */
  function nextQuestion() {
    last = null;
    const v  = Math.floor(Math.random() * 5) + 1;     // 1~5
    const gp = Math.floor(Math.random() * 2) + 1;     // 1~2
    const i  = Math.floor(Math.random() * 45) + 1;    // 1~45

    q = i - 1;
    sc.t++;

    aud?.pause();
    aud = new Audio(`/assets/tense/audio/${v}-${gp}-${i}.mp3`);
    aud.play().catch(() => {});
  }

  function chk(i, j) {
    if (mode !== 'guess' || q === null) return;

    const cr = Math.floor(q / 9);
    const cc = q % 9;
    const ok = i === cr && j === cc;

    if (ok) sc.c++;
    last = { r: i, c: j, x: ok, cr, cc };      // 오답 시 정답 좌표 저장
    setTimeout(nextQuestion, 800);
  }
</script>

<style>
  /* ───────── 테이블 ───────── */
  table { border-collapse: collapse; width: 100%; min-width: 800px; margin-bottom: 120px; font-size: 1.1rem; }
  th, td { border: 1px solid #ccc; padding: 2px; text-align: center; }
  th { background: #333; color: #fff;  font-size: 0.7rem; }
  td:first-child { background: #333; color: #fff; font-weight: 600;  font-size: 0.7rem;}

  td.click { cursor: pointer; }
  td.play  { background: #fffae6; }
  td.blank { background: #fafafa; }
  td.ok    { background: #2a9d8f; color: #000; }
  td.no    { background: #d9534f; color: #fff; }
  td.ans   { background: #ffd54f; color: #000; }

  /* ───────── 컨트롤 박스 ───────── */
  .footer{
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #222;
    padding: 5px 8px;
    display: flex; flex-wrap: wrap;
    gap: 2px; align-items: center; justify-content: center;
    min-height: 92px;
    z-index: 100;
  }
  .footer button{
    width: 68px; height: 15px;
    background: #444; color: #fff;
    border: none; border-radius: 4px;
    cursor: pointer; font-size: 0.7rem;
  }
  .footer button.active  { background: #2a9d8f; color: #000; }
  .footer button.korean  { background: #d4af37; color: #000; }
  .footer button:disabled{ opacity: .4; cursor: not-allowed; }

  /* Info 버튼 고정 */
  .info-btn{
    position: absolute;
    left: 12px;
    bottom: 5px;
  }
</style>

{#if en.length}
  <div style="overflow-x:auto">
    <table>
      <thead>
        <tr>
          <th>S</th>
          {#each hd as h}<th>{h}</th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each sb as s, i}
          <tr>
            <td>{s}</td>
            {#each row(i) as c, j}
              <td
                class:click={!mode && pre.endsWith('-1')}
                class:play={!mode && pIdx === i * 9 + j}
                class:blank={mode === 'blank'}
                class:ok={mode === 'guess' && last?.x && last.r === i && last.c === j}
                class:no={mode === 'guess' && last && !last.x && last.r === i && last.c === j}
                class:ans={mode === 'guess' && last && !last.x && last.cr === i && last.cc === j}
                on:click={() => {
                  if (!mode) play(i * 9 + j);
                  else if (mode === 'guess') chk(i, j);
                }}>
                {#if mode === 'blank'}
                  {blankify(c)}
                {:else if mode === 'guess'}
                  {#if last && !last.x && last.cr === i && last.cc === j}
                    {c}     <!-- 정답 공개 -->
                  {:else}
                    ?       <!-- 아직 모르는 칸 -->
                  {/if}
                {:else}
                  {c}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p style="margin-bottom: 120px;">⬇ 하단 버튼을 눌러 문장을 불러오세요.</p>
{/if}

<!-- ───────── 컨트롤 박스 ───────── -->
<div class="footer">
  <!-- Info (좌측 하단 고정) -->
  <button
    class="info-btn"
    on:click={() => sel.startsWith('tense_info1')
      ? ld('tense_info2.json', 'Tense Info 2')
      : ld('tense_info1.json', 'Tense Info 1')}>
    Info
  </button>

  <!-- 세트(최대 30) 버튼 -->
  <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
    {#each info as it}
      <button
        on:click={() => {
          if (sel === it.file_en && !mode) {
            koOn = !koOn;             // 영/한 토글
          } else {
            koOn = false;             // 새 세트 → 영어 먼저
            ld(it.file_en, it.base);
          }
        }}
        class:active={!mode && sel === it.file_en}
        class:korean={!mode && sel === it.file_en && koOn}>
        {it.base}
      </button>
    {/each}
  </div>

  <!-- 우측 기능 버튼 -->
  <div style="display:flex; gap:12px;">
    <button
      on:click={toggleAll}
      class:active={all}
      disabled={sel.startsWith('tense_info') || mode || !pre.endsWith('-1')}>
      {all ? '⏸' : '▶'}
    </button>

    <button
      on:click={blank}
      class:active={mode === 'blank'}
      disabled={sel.startsWith('tense_info')}>
      Q1
    </button>

    <button
      on:click={guess}
      class:active={mode === 'guess'}>
      {mode === 'guess' ? `${sc.c}/${sc.t}` : 'Q2'}
    </button>
  </div>
</div>

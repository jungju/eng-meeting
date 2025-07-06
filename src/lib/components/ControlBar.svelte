<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  /**
   * Generic ControlBar — 버튼 배열 기반 + 보이기/숨기기 토글
   */
  export let buttons: {
    id: string;
    icon?: string;
    text?: string;
    aria?: string;
    active?: boolean;
  }[] = [];

  const dispatch = createEventDispatcher();
// 클릭할 때 Shift 가 눌려있으면 backward=true 로 전달
const handleBtn = (id: string) => (e: MouseEvent) =>
  dispatch('click', { id, backward: e.shiftKey });

  let visible = true;
  const hideBar = () => { visible = false; dispatch('toggle', { visible }); };
  const showBar = () => { visible = true;  dispatch('toggle', { visible }); };
</script>

{#if visible}
  <div class="ctrls">
    {#each buttons as b (b.id)}
      <button
        class="btn {b.active ? 'selected' : ''} {b.icon && !b.text ? 'icon' : ''}"
        aria-label={b.aria ?? b.text ?? b.id}
        on:click={handleBtn(b.id)}
      >
        {#if b.icon}<span class="ico">{b.icon}</span>{/if}
        {#if b.text}<span>{b.text}</span>{/if}
      </button>
    {/each}

    <button class="hide-btn" aria-label="Hide controls" on:click={hideBar}>▾</button>
  </div>
{:else}
  <button class="bar-fixed" aria-label="Show controls" on:click={showBar}>▴</button>
{/if}

<style>
  /* --- Wrapper Bar --- */
  .ctrls {
    position: fixed;
    left: 0;
    right: 0;
    /* iOS accidental touch 방지를 위해 8px 위로 올림 */
    bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
    display: flex;
    flex-wrap: nowrap;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    height: 60px;
    background: #fff;
    border-top: 1px solid #ccc;
    z-index: 10;
  }

  /* --- Generic button --- */
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;

    /* 폭 30% 감소 */
    width: clamp(65px, 8.4vw, 90px);
    min-width: 65px;
    max-width: 90px;

    font-size: clamp(0.95rem, 1.1vw, 1.3rem);
    padding: 0.55rem 0;
    white-space: nowrap;
    text-align: center;

    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn:hover { background: #f3f4f6; }
  .btn.icon { font-size: clamp(1.4rem, 2vw, 2.2rem); }
  .btn.selected { font-weight: 700; border: 2px solid #1d4ed8; }

  .ico { font-size: 1.25em; line-height: 1; }

  /* --- Hide button --- */
  .hide-btn {
    margin-left: auto;
    width: 40px;
    min-width: 40px;
    max-width: 40px;
    height: 100%;

    font-size: 1.8rem;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  .hide-btn:hover { background: #f3f4f6; }

  /* --- Show button when collapsed --- */
  .bar-fixed {
    position: fixed;
    right: 0.75rem;
    bottom: calc(env(safe-area-inset-bottom) + 1.25rem); /* 이전보다 0.5rem 위 */

    width: 52px;
    height: 40px;
    font-size: 1.8rem;
    line-height: 40px;

    text-align: center;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    cursor: pointer;
    z-index: 11;
    transition: background 0.15s;
  }
  .bar-fixed:hover { background: #f3f4f6; }
</style>
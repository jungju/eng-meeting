<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import './ControlBar.css';

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

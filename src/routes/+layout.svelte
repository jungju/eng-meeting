<script lang="ts">
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import '../app.css';

  onMount(() => {
    navigator.serviceWorker?.register('/service-worker.js');
  });

  type Meta = { icon: string; title: string; detail?: string };
  const routeMeta = derived(page, ($page): Meta => {
    const path = $page.url.pathname;
    const [, section = '', id = ''] = path.split('/');
    if (section === 'dialogue') return { icon: '🎧', title: 'Dialogue Player', detail: id };
    if (section === 'sentence') return { icon: '📝', title: 'Sentence Trainer', detail: id };
    if (section === 'flash2') return { icon: '⚡', title: 'Flash v2', detail: id };
    if (section === 'flash') return { icon: '⚡', title: 'Flash v1', detail: id };
    return { icon: '🏠', title: 'Home' };
  });

  const goHome = () => goto(`${base}/`);
  const goBack = () => {
    if (history.length > 1) history.back();
    else goHome();
  };
</script>

<svelte:head>
  <base href="{base}/" />
</svelte:head>

<div class="app-shell">
  <header class="app-header">
    <div class="title-block">
      <p class="eyebrow">Eng Meet</p>
      <div class="title-line">
        <span class="title-icon">{$routeMeta.icon}</span>
        <h1>{$routeMeta.title}</h1>
        {#if $routeMeta.detail}<span class="subtitle">세트: {$routeMeta.detail}</span>{/if}
      </div>
    </div>
    <div class="header-actions">
      <button class="ghost-btn" type="button" on:click={goBack}>← 뒤로</button>
      <button class="home-btn" type="button" on:click={goHome}>
        <span class="icon">🏠</span>
        <span>홈으로</span>
      </button>
    </div>
  </header>

  <main class="app-main">
    <slot />
  </main>
</div>

<style>
:global(body){
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  background:#eef2ff;
  color:#0f172a;
}
.app-shell{
  min-height:100vh;
  background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 45%,#ffffff 100%);
}
.app-header{
  position:fixed;
  top:0;
  left:0;
  right:0;
  height:56px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 1.5rem env(safe-area-inset-right);
  background:rgba(248,250,252,.92);
  border-bottom:1px solid rgba(15,23,42,.06);
  box-shadow:0 10px 28px rgba(15,23,42,.08);
  backdrop-filter:blur(12px);
  z-index:1000;
}
.title-block{display:flex;flex-direction:column;gap:.2rem}
.title-line{display:flex;align-items:center;gap:.6rem;flex-wrap:nowrap;min-width:0}
.title-icon{font-size:1.7rem}
.title-block h1{
  margin:0;
  font-size:1.35rem;
  font-weight:700;
  display:inline-flex;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.eyebrow{
  margin:0;
  font-size:.78rem;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:#94a3b8;
}
.subtitle{
  font-size:.9rem;
  color:#64748b;
  white-space:nowrap;
}
.header-actions{
  display:flex;
  align-items:center;
  gap:.75rem;
}
.ghost-btn{
  border:1px solid rgba(15,23,42,.15);
  background:transparent;
  color:#0f172a;
  padding:.4rem .9rem;
  border-radius:.65rem;
  font-weight:600;
  cursor:pointer;
}
.ghost-btn:hover{background:rgba(15,23,42,.05)}
.home-btn{
  display:inline-flex;
  align-items:center;
  gap:.4rem;
  padding:.45rem .95rem;
  border-radius:.75rem;
  border:none;
  background:#2563eb;
  color:#fff;
  font-weight:600;
  cursor:pointer;
  box-shadow:0 6px 18px rgba(37,99,235,.25);
  transition:transform .15s ease,box-shadow .15s ease,opacity .15s ease;
}
.home-btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(37,99,235,.3)}
.home-btn:active{transform:scale(.98);opacity:.95}
.home-btn .icon{font-size:1.15rem;line-height:1}
.app-main{
  padding:calc(56px + 1.2rem) 1.25rem 2rem;
}
@media (max-width:700px){
  .app-header{flex-direction:column;align-items:flex-start;height:auto;padding:.8rem 1rem 1rem;gap:.6rem}
  .header-actions{width:100%;justify-content:flex-end}
  .app-main{padding:calc(56px + 2rem) .75rem 1.5rem}
}
</style>

<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { derived } from 'svelte/store';
  import '../app.css';

  const title = derived(page, ($page) => {
    const path = $page.url.pathname;
    const id = $page.url.searchParams.get('id');
    if (path.startsWith('/dialogue')) return `🎧 Dialogue Player${id ? ' - ' + id : ''}`;
    if (path.startsWith('/sentence')) return `📝 Sentence Trainer${id ? ' - ' + id : ''}`;
    return '🏠 Home';
  });
</script>

<header style="background: #f5f5f5; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc;">
  <h1 style="margin: 0; font-size: 1.2rem;">
    {$title}
  </h1>
  <button on:click={() => {
    if (window.__dialogue_audio__) {
      window.__dialogue_audio__.pause();
      window.__dialogue_audio__.currentTime = 0;
    }
    goto('/');
  }} style="font-size: 1em; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
    🏠 홈으로
  </button>
</header>

<slot />
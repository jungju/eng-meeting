<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { derived } from 'svelte/store';
  import { base } from '$app/paths';
  import '../app.css';
  import {onMount} from 'svelte';
  
  onMount(()=>{navigator.serviceWorker?.register('/service-worker.js')});

  const title = derived(page, ($page) => {
    const path = $page.url.pathname;
    const match = path.match(/\/(dialogue|sentence)\/([^\/]+)/);
    const id = match ? match[2] : '';
    if (path.startsWith('/dialogue')) return `🎧 Dialogue Player${id ? ' - ' + id : ''}`;
    if (path.startsWith('/sentence')) return `📝 Sentence Trainer${id ? ' - ' + id : ''}`;
    if (path.startsWith('/flash2')) return `📝 Flash v2${id ? ' - ' + id : ''}`;
    if (path.startsWith('/flash')) return `📝 Flash v1${id ? ' - ' + id : ''}`;
    return '🏠 Home';
  });
</script>

<svelte:head>
  <base href="{base}/" />
</svelte:head>

<header style="position:fixed; top:0; left:0; right:0; height:45px; background:#f5f5f5; border-bottom:1px solid #ccc; display:flex; align-items:center; justify-content:space-between; padding:0 20px; z-index:1000;">
  <h1 style="margin:0; font-size:1.2rem;">{$title}</h1>
  <button on:click={() => goto('/')} style="font-size:1em; padding:6px 12px; border-radius:6px; cursor:pointer;">🏠 홈으로</button>
</header>

<main style="margin-top:30px; padding:15px;">
  <slot />
</main>

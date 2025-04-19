<!-- src/routes/+page.svelte -->
<script>
  import { base } from '$app/paths';

  const links = [
    { id: 'uni', label: 'Sentence Group uni', type: 'sentence' },
    { id: 'meet1', label: 'Dialogue Example meet1', type: 'dialogue' }
  ];
</script>

<ul class="space-y-2">
  {#each links as link}
    <li>
      <a class="text-blue-500 hover:underline" href={`${base}/${link.type}/${link.id}`}>
        {link.label}
      </a>
    </li>
  {/each}
</ul>
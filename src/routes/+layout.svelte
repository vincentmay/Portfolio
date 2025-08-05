<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { onMount, onDestroy } from 'svelte';

  let { children } = $props();

  // Check for dark mode preference
  function applyTheme(isDarkMode: boolean) {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Dark mode support
  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => applyTheme(event.matches);
    mediaQuery.addEventListener('change', listener);

    onDestroy(() => {
      mediaQuery.removeEventListener('change', listener);
    });
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

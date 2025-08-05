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

  // Listen for changes in the user's color scheme preference
  onMount(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mediaQuery.matches);

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => applyTheme(event.matches);
    mediaQuery.addEventListener('change', listener);

    // Cleanup listener on component destroy
    onDestroy(() => {
      mediaQuery.removeEventListener('change', listener);
    });
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

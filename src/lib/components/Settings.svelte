<script lang="ts">
  import { settings } from '$lib/settings.svelte';
  import * as Sheet from '$lib/components/ui/sheet/index';
  import Slider from './ui/slider/slider.svelte';
  import Label from './ui/label/label.svelte';
</script>

<Sheet.Root>
  <Sheet.Trigger style="position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);">
    <div class="settings-trigger-wrapper">
      Settings
    </div>
  </Sheet.Trigger>
  <Sheet.Content>
    <Sheet.Close>Close</Sheet.Close>
    <h2>Settings</h2>
    <Label for="particle-count">Particle Count</Label>
    <Slider
      id="particle-count"
      type="single"
      min={1}
      max={10_000}
      step={1}
      bind:value={settings.particleCount}
    />
  </Sheet.Content>
</Sheet.Root>

<style>
  .settings-trigger-wrapper {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: .5rem 1rem;
    border-radius: 2rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .settings-trigger-wrapper:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .settings-trigger-wrapper:active {
    transform: scale(0.95);
  }
</style>

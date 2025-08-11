<script lang="ts">
  import { settings } from '$lib/settings.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index';
  import Slider from './ui/slider/slider.svelte';
  import Label from './ui/label/label.svelte';
</script>

<div class="settings-wrapper">
  <Dialog.Root>
    <Dialog.Trigger>
      <div class="settings-trigger-wrapper">Settings</div>
    </Dialog.Trigger>
    <Dialog.Content>
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
    </Dialog.Content>
  </Dialog.Root>
</div>

<style>
  .settings-wrapper {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .settings-trigger-wrapper {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    cursor: pointer;
    transition:
      background-color 0.3s,
      transform 0.1s;
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

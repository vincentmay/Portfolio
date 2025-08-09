<script lang="ts">
  import { Settings } from 'lucide-svelte';
  import { settings } from '$lib/settings.svelte';
  import * as Sheet from '$lib/components/ui/sheet/index';
  import Slider from './ui/slider/slider.svelte';
  import Label from './ui/label/label.svelte';
</script>

<Sheet.Root>
  <Sheet.Trigger style="position: fixed; top: 1rem; right: 1rem;">
    <Settings />Settings
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

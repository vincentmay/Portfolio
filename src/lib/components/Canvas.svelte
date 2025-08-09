<script lang="ts">
  import { animate } from '$lib/three/animate';
  import { createParticles, updateParticles } from '$lib/three/particles';
  import { initScene } from '$lib/three/scene';
  import { onMount } from 'svelte';
  import { settings } from '$lib/settings.svelte';
  import * as THREE from 'three';

  let container: HTMLDivElement;
  let scenee: THREE.Scene;

  onMount(() => {
    const { scene, camera, renderer } = initScene(container);
    const { geometry, positions, velocities } = createParticles(settings.particleCount);
    scene.add(geometry);
    scenee = scene;

    animate((deltaTime: number) => {
      updateParticles(positions, velocities, deltaTime);
      geometry.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    });
  });

  $effect(() => {
    if (scenee) {
      // Perform any necessary updates or effects with the scene
    }
  });
</script>

<div bind:this={container} class="h-screen w-full"></div>

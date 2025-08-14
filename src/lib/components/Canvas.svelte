<script lang="ts">
  import { animate } from '$lib/three/animate';
  import { initScene } from '$lib/three/scene';
  import { onMount } from 'svelte';
  import { settings } from '$lib/settings.svelte';
  import * as THREE from 'three';
  import { createGridLines, updateGridLines } from '$lib/three/particles';

  let container: HTMLDivElement;
  let scene_: THREE.Scene;
  let lines: THREE.LineSegments;
  let offset: number = 0;
  const speed: number = 0.1;

  onMount(() => {
    const { scene, camera, renderer } = initScene(container);

    const lines = createGridLines(container.clientWidth, container.clientHeight);
    scene.add(lines);
    scene_ = scene;

    animate((deltaTime: number) => {
      offset += deltaTime * speed;
      updateGridLines(lines, offset);
      renderer.render(scene, camera);
    });
  });

  $effect(() => {
    if (scene_) {
      // Perform any necessary updates or effects with the scene
    }
  });
</script>

<div bind:this={container} class="h-screen w-full"></div>

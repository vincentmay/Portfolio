<script lang="ts">
  import { animate } from '$lib/three/animate';
  import { createParticles, updateParticles } from '$lib/three/particles';
  import { initScene, resizeRendererToDisplaySize } from '$lib/three/scene';
  import { onMount } from 'svelte';

  const particleCount = 1_000;

  let container: HTMLDivElement;

  onMount(() => {
    const { scene, camera, renderer } = initScene(container);
    const { geometry, positions, velocities } = createParticles(particleCount);
    scene.add(geometry);

    animate(() => {
      updateParticles(positions, velocities);
      geometry.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      resizeRendererToDisplaySize(renderer, camera, container);
    });
  });
</script>

<div bind:this={container} class="w-full h-screen"></div>

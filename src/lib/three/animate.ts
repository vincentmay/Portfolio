export function animate(callback: (deltaTime: number) => void) {
  let lastTime = performance.now();

  function loop(now: number) {
    const deltaTime = (now - lastTime) / 1000; // Convert to seconds
    lastTime = now;

    callback(deltaTime);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

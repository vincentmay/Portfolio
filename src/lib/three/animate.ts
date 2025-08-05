export function animate(callback: () => void) {
  function loop() {
    callback();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

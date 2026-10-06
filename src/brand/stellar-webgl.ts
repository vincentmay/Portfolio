export type StellarMessage =
  | { type: "init"; canvas: OffscreenCanvas; width: number; height: number; pixelRatio: number; accent: string; scroll: number }
  | { type: "resize"; width: number; height: number }
  | { type: "pose"; scroll: number }
  | { type: "pointer"; x: number; y: number }
  | { type: "visible"; visible: boolean };
export type StellarResponse = { type: "ready" | "lost" | "error" };

/** Keep graphics initialization and rendering off the scrolling thread. */
export function createStellar(host: HTMLElement) {
  if (!HTMLCanvasElement.prototype.transferControlToOffscreen || typeof Worker === "undefined")
    return () => {};
  const canvas = document.createElement("canvas");
  const worker = new Worker(new URL("./stellar-worker.ts", import.meta.url), { type: "module" });
  let stopped = false;
  const send = (message: StellarMessage) => { if (!stopped) worker.postMessage(message); };
  const fail = () => {
    stopped = true;
    worker.terminate();
    canvas.remove();
    delete host.dataset.ready;
  };
  worker.onerror = fail;
  worker.onmessage = ({ data }: MessageEvent<StellarResponse>) => {
    if (stopped) return;
    if (data.type === "ready") host.dataset.ready = "true";
    else if (data.type === "lost") delete host.dataset.ready;
    else fail();
  };
  let width = host.clientWidth, height = host.clientHeight;
  try {
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({
      type: "init", canvas: offscreen, width, height,
      pixelRatio: Math.min(devicePixelRatio, 1.6),
      accent: getComputedStyle(host).getPropertyValue("--accent").trim() || "#b9c9ff",
      scroll: Number(host.dataset.scrollPose ?? 0),
    } satisfies StellarMessage, [offscreen]);
  } catch {
    fail();
    return () => {};
  }
  host.append(canvas);
  const sizeObserver = new ResizeObserver(() => {
    const nextWidth = host.clientWidth, nextHeight = host.clientHeight;
    if (width === nextWidth && height === nextHeight) return;
    width = nextWidth; height = nextHeight;
    send({ type: "resize", width, height });
  });
  sizeObserver.observe(host);
  const poseObserver = new MutationObserver(() =>
    send({ type: "pose", scroll: Number(host.dataset.scrollPose ?? 0) }));
  poseObserver.observe(host, { attributes: true, attributeFilter: ["data-scroll-pose"] });
  let visible = true;
  const visibility = () => send({ type: "visible", visible: visible && !document.hidden });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visibility();
  });
  observer.observe(host);
  const move = (event: PointerEvent) => {
    const box = host.getBoundingClientRect();
    send({ type: "pointer", x: (event.clientX - box.left) / box.width - 0.5,
      y: (event.clientY - box.top) / box.height - 0.5 });
  };
  const leave = () => send({ type: "pointer", x: 0, y: 0 });
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  visibility();
  return () => {
    sizeObserver.disconnect();
    poseObserver.disconnect();
    observer.disconnect();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    fail();
  };
}

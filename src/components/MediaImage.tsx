import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

type ImageState = "static" | "loading" | "ready" | "error";

/** Keep the real image usable without JS; enhance only genuine loading. */
export function MediaImage({ src, srcSet, sizes, alt, width, height, eager = false }: {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
}) {
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<ImageState>("static");
  useLayoutEffect(() => {
    const element = image.current!;
    let active = true;
    const fail = () => { if (active) setState("error"); };
    const loaded = () => {
      const candidate = element.currentSrc;
      const reveal = () => {
        if (active && candidate === element.currentSrc && element.naturalWidth > 0)
          setState("ready");
      };
      void element.decode().then(reveal, () => {
        // A responsive candidate can change during decoding. Its load event
        // handles the new source; don't mark it failed while it is downloading.
        if (!active || candidate !== element.currentSrc) return;
        if (element.naturalWidth > 0) reveal();
        else if (element.complete) fail();
      });
    };
    element.addEventListener("load", loaded);
    element.addEventListener("error", fail);
    if (element.complete) {
      if (element.naturalWidth > 0) setState("ready");
      else fail();
    } else setState("loading");
    return () => {
      active = false;
      element.removeEventListener("load", loaded);
      element.removeEventListener("error", fail);
    };
  }, [src, srcSet]);
  return (
    <span
      className="image-media"
      data-image-state={state}
      aria-busy={state === "loading"}
      style={{ "--media-ratio": width / height } as CSSProperties}
    >
      <img
        ref={image}
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
      />
      <span className="image-placeholder" aria-hidden="true" />
      {state === "error" && <span className="image-error" role="status">Image unavailable</span>}
    </span>
  );
}

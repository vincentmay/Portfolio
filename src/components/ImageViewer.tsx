import { useEffect, useRef, useState } from "react";
import type { Locale } from "../content";

export function ImageViewer({ src, alt, caption, locale }: {
  src: string;
  alt: string;
  caption: string;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.current!.showModal();
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);
  return <>
    <button className="image-open" type="button" onClick={() => setOpen(true)}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9V5h4m6 0h4v4M5 15v4h4m6 0h4v-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      {"View full image"}
    </button>
    {open && (
      <dialog
        className="image-dialog"
        ref={dialog}
        aria-label={"Project image"}
        onClose={() => setOpen(false)}
        onClick={event => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button className="image-close" type="button" onClick={() => dialog.current?.close()}>
          {"Close"} <span aria-hidden="true">×</span>
        </button>
        <img src={src} alt={alt} />
        <p>{caption}</p>
      </dialog>
    )}
  </>;
}

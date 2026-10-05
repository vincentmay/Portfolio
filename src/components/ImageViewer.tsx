import { useEffect, useRef, useState, type ReactNode } from "react";

export function ImageViewer({ src, alt, caption, aspectRatio, children }: {
  src: string;
  alt: string;
  caption: string;
  aspectRatio: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
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
    <button
      className="screenshot-frame image-zoom"
      type="button"
      ref={trigger}
      style={{ aspectRatio }}
      aria-label={`Enlarge image: ${caption}`}
      aria-haspopup="dialog"
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
    {open && (
      <dialog
        className="image-dialog"
        ref={dialog}
        aria-label={"Project image"}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
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

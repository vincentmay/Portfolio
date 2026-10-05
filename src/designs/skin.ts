import { useEffect } from "react";

/**
 * Each gallery design owns the whole page, including whatever shows through
 * when the viewport is over-scrolled. Tagging the root element lets a design
 * repaint `html` without any of them leaking into the others.
 */
export function useSkin(id: string) {
  useEffect(() => {
    document.documentElement.dataset.skin = id;
    return () => {
      delete document.documentElement.dataset.skin;
    };
  }, [id]);
}

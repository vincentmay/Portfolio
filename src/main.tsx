import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./app/router.tsx";
import "./portfolio.css";
import "./editorial.css";
import "./finishing.css";

const root = document.getElementById("root")!;
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const prerendered = root.hasChildNodes() && root.dataset.route === path;
// Tell the router this is hydration so its Suspense tree matches the server.
// Our routes have no loaders or serialized server data.
if (prerendered) router.ssr = { manifest: undefined };
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
// An initial view transition can commit before React hydrates the server tree.
// Reserve transitions for navigation after the initial route has loaded.
router.update({ defaultViewTransition: false });
await router.load();
if (prerendered) hydrateRoot(root, app);
else createRoot(root).render(app);
// The router discards the native transition object. Consume its `ready`
// rejection when the browser skips an animation (rapid navigation, hidden tab).
// Route updates still run; callback failures are not suppressed.
router.startViewTransition = (update) => {
  const enabled = router.shouldViewTransition ?? router.options.defaultViewTransition;
  router.shouldViewTransition = undefined;
  if (!enabled || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof document.startViewTransition !== "function") {
    void update();
    return;
  }
  const transition = document.startViewTransition(update);
  void transition.ready.catch(() => {});
};
router.update({ defaultViewTransition: true });

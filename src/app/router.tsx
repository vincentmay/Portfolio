import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
  lazyRouteComponent,
  Link,
} from "@tanstack/react-router";
import { Home } from "../routes/Home.tsx";
import { Legal } from "../routes/Legal.tsx";
import { Project } from "../routes/Project.tsx";
import { Header, Footer } from "../components/Portfolio";
import { useDocument } from "./page";

function NotFound() {
  useDocument(
    "en",
    "Page not found — Vincent May",
    "This page could not be found. Explore Vincent May’s selected projects.",
    true,
  );
  return (
    <div className="portfolio">
      <Header locale="en" />
      <main id="top" className="wrap not-found">
        <p className="eyebrow">404 / PAGE NOT FOUND</p>
        <h1>This one went missing.</h1>
        <Link to="/en" className="text-link">
          ← Back to the portfolio
        </Link>
      </main>
      <Footer locale="en" />
    </div>
  );
}
const root = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFound,
});

// Written out one by one rather than through a helper: the router derives its
// type-safe link paths from these literals.
const routeTree = root.addChildren([
  createRoute({
    getParentRoute: () => root,
    path: "/",
    component: () => <Home locale="en" />,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/en",
    component: () => <Home locale="en" />,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/en/work/$project",
    component: EnglishProject,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/legal-notice",
    component: () => <Legal page="imprint" locale="en" />,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/privacy",
    component: () => <Legal page="privacy" locale="en" />,
  }),
  ...(import.meta.env.DEV ? experimentRoutes() : []),
]);

// Keep design experiments locally, outside the published route tree.
function experimentRoutes() {
const LogoLab = lazyRouteComponent(
  () => import("../routes/LogoLab"),
  "LogoLab",
);
const Designs = lazyRouteComponent(
  () => import("../routes/Designs"),
  "Designs",
);
const Studio = lazyRouteComponent(() => import("../designs/Studio"), "Studio");
const Terminal = lazyRouteComponent(
  () => import("../designs/Terminal"),
  "Terminal",
);
const Chrome = lazyRouteComponent(() => import("../designs/Chrome"), "Chrome");
const Kinetic = lazyRouteComponent(
  () => import("../designs/Kinetic"),
  "Kinetic",
);

  return [
  // Temporary: remove once the mark is chosen.
  createRoute({
    getParentRoute: () => root,
    path: "/logo-lab",
    component: LogoLab,
  }),

  // The design gallery. Whichever direction wins becomes the site; the rest go.
  createRoute({
    getParentRoute: () => root,
    path: "/designs",
    component: Designs,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/d/studio",
    component: () => <Studio locale="en" />,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/d/terminal",
    component: () => <Terminal locale="en" />,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/d/chrome",
    component: () => <Chrome locale="en" />,
  }),
  createRoute({
    getParentRoute: () => root,
    path: "/d/kinetic",
    component: () => <Kinetic locale="en" />,
  }),
  ];
}

export const router = createRouter({
  routeTree,
  // Published routes are already in the initial bundle and have no loaders.
  // Intent preloading adds no work to cache and can emit a render/scroll reset
  // while a project link comes under the pointer during ordinary scrolling.
  defaultPreload: false,
  defaultViewTransition: true,
});

function EnglishProject() {
  const { project } = useParams({ strict: false });
  return <Project locale="en" id={project ?? ""} />;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

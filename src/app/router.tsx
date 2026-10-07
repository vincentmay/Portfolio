import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
  Link,
} from "@tanstack/react-router";
import { Home } from "../routes/Home.tsx";
import { Legal } from "../routes/Legal.tsx";
import { Project } from "../routes/Project.tsx";
import { Header, Footer } from "../components/Portfolio";
import { useDocument } from "./page";
import { SmoothScroll } from "./SmoothScroll";

function NotFound() {
  useDocument(
    "en",
    "Page not found | Vincent May",
    "This page could not be found. Explore Vincent May’s selected projects.",
    true,
  );
  return (
    <div className="portfolio">
      <Header locale="en" />
      <main id="top" className="wrap not-found">
        <p className="eyebrow">404 / PAGE NOT FOUND</p>
        <h1>Page not found.</h1>
        <Link to="/en" className="text-link">
          ← Back to the portfolio
        </Link>
      </main>
      <Footer locale="en" />
    </div>
  );
}
function Root() {
  return <><SmoothScroll /><Outlet /></>;
}

const root = createRootRoute({
  component: Root,
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
]);

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
  interface HistoryState {
    smoothWorkReturn?: boolean;
  }
  interface Register {
    router: typeof router;
  }
}

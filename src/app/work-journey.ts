import { settleScroll } from "./scroll";

/** Native vertical scrolling carries a horizontal, image-first project chapter. */
export function createWorkJourney(root: HTMLElement) {
  const journey = root.querySelector<HTMLElement>(".work-journey");
  const track = journey?.querySelector<HTMLElement>(".selected-work");
  if (!journey || !track) return;
  const rows = [...track.querySelectorAll<HTMLElement>(".work-row")];
  const buttons = [
    ...journey.querySelectorAll<HTMLButtonElement>("[data-journey-index]"),
  ];
  let state: { start: number; distance: number; stride: number } | undefined;
  let lastTravel = -1;
  let cancelSettle = () => {};
  const resetRows = () =>
    rows.forEach((row) => row.style.removeProperty("--scene-focus"));
  const measure = () => {
    lastTravel = -1;
    const enabled = matchMedia(
      "(min-width: 1100px) and (min-height: 760px)",
    ).matches;
    journey.dataset.enabled = String(enabled);
    if (!enabled || rows.length < 2) {
      state = undefined;
      track.style.removeProperty("transform");
      journey.style.removeProperty("--journey-distance");
      resetRows();
      return;
    }
    const width = root.clientWidth;
    const inset = root.querySelector<HTMLElement>(".work-section")!.offsetLeft;
    journey.style.setProperty("--page-width", `${width}px`);
    journey.style.setProperty("--scene-inset", `${inset}px`);
    journey.style.setProperty(
      "--scene-gap",
      `${Math.min(120, width * 0.08)}px`,
    );
    const stride = rows[1].offsetLeft - rows[0].offsetLeft;
    const distance = stride * (rows.length - 1);
    journey.style.setProperty("--journey-distance", `${distance}px`);
    state = {
      start: journey.getBoundingClientRect().top + scrollY - 100,
      stride,
      distance,
    };
  };
  const draw = (scroll: number) => {
    if (!state) return;
    const travel = Math.max(0, Math.min(state.distance, scroll - state.start));
    if (travel === lastTravel) return;
    lastTravel = travel;
    const position = travel / state.stride;
    track.style.transform = `translate3d(${-travel}px,0,0)`;
    rows.forEach((row, i) => {
      const t = Math.max(0, 1 - Math.abs(position - i));
      row.style.setProperty("--scene-focus", String(t * t * (3 - 2 * t)));
    });
    buttons.forEach((button, i) => {
      if (i === Math.round(position))
        button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
      button.style.setProperty(
        "--scene-progress",
        String(Math.max(0, Math.min(1, position - i + 1))),
      );
    });
  };
  const go = (index: number, smooth: boolean) => {
    if (state)
      scrollTo({
        top: state.start + index * state.stride,
        behavior: smooth ? "smooth" : "instant",
      });
  };
  const showProject = (id: string, smooth = false) => {
    const index = rows.findIndex((row) => row.id === `work-${id}`);
    if (index < 0) return;
    cancelSettle();
    if (state) {
      cancelSettle = settleScroll(state.start + index * state.stride, smooth);
      draw(scrollY);
    } else {
      rows[index].scrollIntoView({ block: "start", behavior: "instant" });
      if (smooth) cancelSettle = settleScroll(scrollY, true);
    }
  };
  const click = (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-journey-index]",
    );
    if (button) go(Number(button.dataset.journeyIndex), true);
  };
  const key = (event: KeyboardEvent) => {
    if (
      !state ||
      event.key !== "Tab" ||
      !journey.contains(document.activeElement)
    )
      return;
    const links = [
      ...journey.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled])",
      ),
    ];
    const i = links.indexOf(document.activeElement as HTMLElement);
    const next = links[i + (event.shiftKey ? -1 : 1)];
    if (!next) return;
    event.preventDefault();
    const row = next.closest<HTMLElement>(".work-row");
    if (row) go(rows.indexOf(row), false);
    next.focus({ preventScroll: true });
  };
  journey.addEventListener("click", click);
  document.addEventListener("keydown", key);
  const stop = () => {
    cancelSettle();
    journey.removeEventListener("click", click);
    document.removeEventListener("keydown", key);
    delete journey.dataset.enabled;
    for (const p of [
      "--journey-distance",
      "--page-width",
      "--scene-inset",
      "--scene-gap",
    ])
      journey.style.removeProperty(p);
    track.style.removeProperty("transform");
    resetRows();
    buttons.forEach((button) => {
      button.style.removeProperty("--scene-progress");
      button.removeAttribute("aria-current");
    });
    state = undefined;
  };
  return { measure, draw, showProject, stop };
}

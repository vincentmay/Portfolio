import { useEffect, useState } from "react";
import { Mark } from "../brand/Mark.tsx";
import { DESIGNS } from "../brand/designs.ts";

/**
 * Temporary comparison page for choosing the mark. Delete this route, the
 * candidates you don't want, and the link in the router once one is picked.
 */
const SIZES = [16, 24, 32, 48, 96];

export function LogoLab() {
  const [light, setLight] = useState(false);
  const [weight, setWeight] = useState(1);

  useEffect(() => {
    document.title = "Logo lab — Vincent May";
  }, []);

  return (
    <div className={`lab${light ? " lab-light" : ""}`}>
      <header className="lab-bar">
        <h1>Logo lab</h1>
        <div className="lab-controls">
          <label>
            weight {weight.toFixed(2)}
            <input
              type="range"
              min="0.7"
              max="2"
              step="0.05"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </label>
          <button type="button" onClick={() => setLight((v) => !v)}>
            {light ? "dark" : "light"}
          </button>
        </div>
      </header>

      {DESIGNS.map((design) => (
        <section className="lab-row" key={design.id}>
          <div className="lab-meta">
            <h2>
              {design.name} <code>{design.id}</code>
            </h2>
            <p>{design.note}</p>
          </div>

          <div className="lab-hero">
            <Mark design={design} weight={weight} />
          </div>

          <div className="lab-sizes">
            {SIZES.map((size) => (
              <figure key={size} style={{ width: size }}>
                <Mark design={design} weight={weight} />
                <figcaption>{size}</figcaption>
              </figure>
            ))}
          </div>

          <div className="lab-lockup">
            <Mark design={design} weight={weight} />
            <span>VINCENT MAY</span>
          </div>
        </section>
      ))}
    </div>
  );
}

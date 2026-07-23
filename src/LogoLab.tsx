import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./LogoMark";
import { createLogoCloud } from "./logoParticles";

type ViewState = {
  pitch: number;
  yaw: number;
  roll: number;
};

const PRESETS: Record<string, ViewState> = {
  Front: { pitch: 0, yaw: 0, roll: 0 },
  Hero: { pitch: 5, yaw: -3, roll: 0 },
  Side: { pitch: 0, yaw: 90, roll: 0 },
  Above: { pitch: 65, yaw: 0, roll: 0 },
};

const CUBE_VERTICES = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
] as const;

const CUBE_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
] as const;

// Logo unit space tops out near ±0.7; stretch it toward the ±1 cube.
const LOGO_FIT = 1.4;
const LOGO_CLOUD = createLogoCloud(2600);

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function fract(value: number) {
  return value - Math.floor(value);
}

function seeded(index: number, salt: number) {
  return fract(Math.sin(index * 91.173 + salt * 47.719) * 43758.5453);
}

function InspectionCanvas({ view }: { view: ViewState }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);

      const pitch = radians(view.pitch);
      const yaw = radians(view.yaw);
      const roll = radians(view.roll);
      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosZ = Math.cos(roll);
      const sinZ = Math.sin(roll);
      const scale = Math.min(bounds.width, bounds.height) * 0.26;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      const project = (x: number, y: number, z: number) => {
        const yawX = x * cosY - z * sinY;
        const yawZ = x * sinY + z * cosY;
        const pitchY = y * cosX - yawZ * sinX;
        const depth = y * sinX + yawZ * cosX;
        const rollX = yawX * cosZ - pitchY * sinZ;
        const rollY = yawX * sinZ + pitchY * cosZ;
        const perspective = 1 / (1.18 - depth * 0.12);
        return {
          x: centerX + rollX * scale * perspective,
          y: centerY + rollY * scale * perspective,
          perspective,
        };
      };

      context.save();
      context.strokeStyle = "rgba(242, 241, 232, 0.22)";
      context.lineWidth = 1;
      context.setLineDash([5, 7]);
      const corners = CUBE_VERTICES.map(([x, y, z]) => project(x, y, z));
      for (const [from, to] of CUBE_EDGES) {
        context.beginPath();
        context.moveTo(corners[from].x, corners[from].y);
        context.lineTo(corners[to].x, corners[to].y);
        context.stroke();
      }
      context.restore();

      context.globalCompositeOperation = "lighter";
      context.fillStyle = "#f2f1e8";
      for (let index = 0; index < LOGO_CLOUD.count; index += 1) {
        const point = project(
          LOGO_CLOUD.x[index] * LOGO_FIT,
          LOGO_CLOUD.y[index] * LOGO_FIT,
          LOGO_CLOUD.z[index] * LOGO_FIT,
        );
        const sparkle = seeded(index, 61);
        const size = (0.6 + sparkle * 0.9) * (0.6 + point.perspective * 0.45);
        context.globalAlpha = 0.16 + sparkle * 0.4 + (point.perspective - 1) * 0.3;
        context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [view.pitch, view.roll, view.yaw]);

  return <canvas ref={ref} aria-label="3D particle structure of the mark" />;
}

function AngleControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="logo-lab-control">
      <span>{label}</span>
      <output>{value}°</output>
      <input
        type="range"
        min="-180"
        max="180"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function initialView(): ViewState {
  const requested = new URLSearchParams(window.location.search).get("view");
  if (!requested) return PRESETS.Front;
  const match = Object.keys(PRESETS).find(
    (name) => name.toLowerCase() === requested.toLowerCase(),
  );
  return match ? PRESETS[match] : PRESETS.Front;
}

export default function LogoLab() {
  const [view, setView] = useState<ViewState>(initialView);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Logo Lab — Vincent May";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const updateAngle = (key: keyof ViewState, value: number) => {
    setView((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="logo-lab">
      <header className="logo-lab-header">
        <div>
          <p className="logo-lab-kicker">North-star mark — star & orbit ring</p>
          <h1>Logo Lab</h1>
        </div>
        <a className="logo-lab-back" href="/de">Back to portfolio</a>
      </header>

      <p className="logo-lab-notice">
        Four-point north star with a tilted orbit ring, drawn from the silver
        pendant reference: longest point down, slightly uneven tips, ring
        passing in front below and behind above. The 2D mark is a single SVG;
        the 3D structure shares its geometry with the hero particle state.
      </p>

      <section className="logo-lab-grid">
        <article className="logo-lab-panel">
          <header className="logo-lab-panel-head">
            <p className="logo-lab-panel-label">2D mark</p>
            <span>Solid star, orbit ring front/back</span>
          </header>
          <div className="logo-lab-vector-stage">
            <LogoMark className="logo-mark-lab" title="Vincent May mark — north star with orbit ring" />
          </div>
          <div className="logo-lab-sizes" aria-label="Logo scale tests">
            {[20, 32, 64, 128].map((size) => (
              <div className="logo-lab-size" key={size}>
                <LogoMark className={`logo-mark-${size}`} />
                <span>{size}px</span>
              </div>
            ))}
          </div>
        </article>

        <article className="logo-lab-panel">
          <header className="logo-lab-panel-head">
            <p className="logo-lab-panel-label">3D structure</p>
            <span>Star wireframe + true orbit torus</span>
          </header>
          <div className="logo-lab-canvas-stage">
            <InspectionCanvas view={view} />
            <span className="logo-lab-axis logo-lab-axis-n">N</span>
            <span className="logo-lab-axis logo-lab-axis-e">E</span>
            <span className="logo-lab-axis logo-lab-axis-s">S</span>
            <span className="logo-lab-axis logo-lab-axis-w">W</span>
          </div>
        </article>
      </section>

      <section className="logo-lab-controls" aria-label="3D inspection controls">
        <div className="logo-lab-presets">
          {Object.entries(PRESETS).map(([label, preset]) => (
            <button key={label} type="button" onClick={() => setView(preset)}>{label}</button>
          ))}
        </div>
        <div className="logo-lab-sliders">
          <AngleControl label="Pitch" value={view.pitch} onChange={(value) => updateAngle("pitch", value)} />
          <AngleControl label="Yaw" value={view.yaw} onChange={(value) => updateAngle("yaw", value)} />
          <AngleControl label="Roll" value={view.roll} onChange={(value) => updateAngle("roll", value)} />
        </div>
      </section>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { LogoPlaceholder } from "./LogoPlaceholder";

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

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
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
      const scale = Math.min(bounds.width, bounds.height) * 0.18;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      const projected = CUBE_VERTICES.map(([x, y, z]) => {
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
        };
      });

      context.save();
      context.strokeStyle = "rgba(242, 241, 232, 0.34)";
      context.lineWidth = 1;
      context.setLineDash([5, 7]);
      for (const [from, to] of CUBE_EDGES) {
        context.beginPath();
        context.moveTo(projected[from].x, projected[from].y);
        context.lineTo(projected[to].x, projected[to].y);
        context.stroke();
      }
      context.restore();

      context.fillStyle = "rgba(242, 241, 232, 0.72)";
      context.beginPath();
      context.arc(centerX, centerY, 2, 0, Math.PI * 2);
      context.fill();
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [view.pitch, view.roll, view.yaw]);

  return <canvas ref={ref} aria-label="Empty 3D logo inspection volume" />;
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

export default function LogoLab() {
  const [view, setView] = useState<ViewState>(PRESETS.Front);

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
          <p className="logo-lab-kicker">Empty implementation environment</p>
          <h1>Logo Lab</h1>
        </div>
        <a className="logo-lab-back" href="/de">Back to portfolio</a>
      </header>

      <p className="logo-lab-notice">
        All previous logo geometry has been removed. These neutral slots define only size, camera and integration boundaries.
      </p>

      <section className="logo-lab-grid">
        <article className="logo-lab-panel">
          <header className="logo-lab-panel-head">
            <p className="logo-lab-panel-label">2D slot</p>
            <span>No mark implemented</span>
          </header>
          <div className="logo-lab-vector-stage">
            <LogoPlaceholder className="logo-placeholder-lab" label="2D logo slot empty" />
          </div>
          <div className="logo-lab-sizes" aria-label="Empty logo scale slots">
            {[20, 32, 64, 128].map((size) => (
              <div className="logo-lab-size" key={size}>
                <LogoPlaceholder className={`logo-placeholder-${size}`} />
                <span>{size}px</span>
              </div>
            ))}
          </div>
        </article>

        <article className="logo-lab-panel">
          <header className="logo-lab-panel-head">
            <p className="logo-lab-panel-label">3D slot</p>
            <span>Neutral inspection volume</span>
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

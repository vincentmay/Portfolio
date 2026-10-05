"""Prepare an actual Blockwright universe for a portfolio presentation render.

Run with the sibling Blockwright environment's Python. Geometry and the render
studio stay in .preview; only the final raster belongs in public/projects.
The source repository and all Minecraft worlds are left untouched.
"""
from pathlib import Path
import argparse
import hashlib
import pickle
import shutil
import subprocess
import sys
import types

root = Path(__file__).resolve().parents[1]
repo = root.parent / "Blockwright"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--capture", type=Path, help="Save a studio PNG/WebP capture as the public preview instead of rebuilding")
args = parser.parse_args()
if args.capture:
    from PIL import Image
    target = root / "public/projects/blockwright-universe.webp"
    with Image.open(args.capture) as image:
        if image.size != (3840, 2400):
            raise ValueError("Capture must be the full 3840 x 2400 canvas")
        image.convert("RGB").save(target, quality=90, method=6)
    print(f"Saved {target} ({target.stat().st_size:,} bytes)")
    raise SystemExit(0)

sys.path.insert(0, str(repo))
from blockwright.frame import Frame
from blockwright.model import VoxelModel

folder = root / ".preview/blockwright"
folder.mkdir(parents=True, exist_ok=True)
source_path = repo / "builds/fable_universe.py"
source = source_path.read_text(encoding="utf8")
fingerprint = hashlib.sha256(source.encode()).hexdigest()
# Explicit y is the registry default, now required by the state-intent lint.
# This compatibility fix changes neither the geometry nor the source checkout.
source = source.replace('_s("stripped_crimson_hyphae"),', '_s("stripped_crimson_hyphae", axis="y"),')
cache = folder / "fable_universe.pickle"
provenance = folder / "source.sha256"
if not cache.exists() or not provenance.exists() or provenance.read_text() != fingerprint:
    module = types.ModuleType("portfolio_fable_universe")
    sys.modules[module.__name__] = module
    exec(compile(source, str(source_path), "exec"), module.__dict__)
    model = VoxelModel()
    module.build(Frame(model))
    with cache.open("wb") as f:
        pickle.dump(model, f)
    provenance.write_text(fingerprint)
    print(f"Generated {model.non_air_count():,} blocks; material and palette lint checks passed", flush=True)

subprocess.run([sys.executable, str(root / "scripts/lib/blockwright-preview.py"), "fable_universe"], check=True)
shutil.copyfile(root / "scripts/lib/blockwright-studio.html", root / ".preview/blockwright-scene.html")
print("Open /.preview/blockwright-scene.html on the Vite dev server at 1920 x 1200.")
print("The studio uses actual block geometry, texture-derived face colours, and game emission values.")
print("Call studio.resize(3840, 2400), then studio.render(). Save the full canvas as WebP; --capture <file> installs it.")

"""Render the delivered Observatory schematic with Blockwright's native renderer.

Run with ../Blockwright/.venv/Scripts/python.exe. Source checkouts, schematics
and Minecraft worlds remain untouched. Only the final WebP is published.
"""
from pathlib import Path
import hashlib
import json
import pickle
import sys

from PIL import Image
import numpy as np

root = Path(__file__).resolve().parents[1]
repo = root.parent / "Blockwright"
sys.path.insert(0, str(repo))
from blockwright.litematic import read_litematic
from blockwright.model import VoxelModel
from blockwright.state import assert_legal_model
import blockwright.render as renderer

thread = repo / ".dev/threads/build-the-last-observatory-6d597971"
schematic = thread / "schematics/the_last_observatory.litematic"
digest = hashlib.sha256(schematic.read_bytes()).hexdigest()
evidence = json.loads(schematic.with_suffix(".evidence.json").read_text())
assert evidence["artifact"]["sha256"] == digest, "Stale schematic evidence"
assert evidence["checks"]["registry_and_static_lint"]["status"] == "pass"
folder = root / ".preview/blockwright-new"
folder.mkdir(parents=True, exist_ok=True)
cache = folder / f"observatory-surface-{digest}.pickle"
if cache.exists():
    with cache.open("rb") as stream:
        surface, metadata = pickle.load(stream)
else:
    model = read_litematic(schematic)
    assert_legal_model(model)
    bounds = model.bounds()
    bx, by, bz, ex, ey, ez = bounds
    cells = np.zeros((ex-bx+3, ey-by+3, ez-bz+3), dtype=np.uint16)
    # Match the build's presentation optimization: retain camera-facing surfaces.
    # No delivered blocks are edited or removed from the schematic.
    palette, indices = [None], {}
    for (x, y, z), block in model.items():
        if block not in indices:
            indices[block] = len(palette)
            palette.append(block)
        cells[x-bx+1, y-by+1, z-bz+1] = indices[block]
    inside = cells[1:-1, 1:-1, 1:-1]
    dx, dz = renderer._iso_direction("sw")
    nx = cells[2:, 1:-1, 1:-1] if dx > 0 else cells[:-2, 1:-1, 1:-1]
    nz = cells[1:-1, 1:-1, 2:] if dz > 0 else cells[1:-1, 1:-1, :-2]
    ny = cells[1:-1, 2:, 1:-1]
    visible = (inside > 0) & ((nx == 0) | (ny == 0) | (nz == 0))
    surface = VoxelModel()
    for x, y, z in np.argwhere(visible):
        surface.set(int(x)+bx, int(y)+by, int(z)+bz, palette[int(inside[x,y,z])])
    metadata = {"sha256": digest, "blocks": model.non_air_count(), "size": model.size()}
    with cache.open("wb") as stream:
        pickle.dump((surface, metadata), stream)
    del model, cells, inside, nx, ny, nz, visible
print(json.dumps(metadata), flush=True)

# Lift the renderer's preview cap in this process to rasterize at native 4K.
# The image is never enlarged; game-derived block shapes and colours are retained.
renderer.MAX_IMAGE_SIDE = 4096
renderer._background = lambda w, h, scale: Image.new("RGB", (w, h), (20, 20, 26))
image = renderer.render_model_isometric_image(surface, corner="sw", scale=10, elevation=.85)
canvas = Image.new("RGB", (3840, 2880), (20, 20, 26))
assert image.width <= canvas.width and image.height <= canvas.height
canvas.paste(image, ((canvas.width-image.width)//2, (canvas.height-image.height)//2))
target = root / "public/projects/blockwright-observatory.webp"
canvas.save(target, quality=88, method=6)
for width in (960, 1920):
    canvas.resize((width, width*3//4), Image.Resampling.LANCZOS).save(
        target.with_name(f"blockwright-observatory-{width}.webp"), quality=84, method=6)
metadata.update({"native_render": image.size, "canvas": canvas.size, "bytes": target.stat().st_size,
                 "runtime_behavior": "unverified", "renderer": "Blockwright native isometric renderer"})
(folder / "observatory-provenance.json").write_text(json.dumps(metadata, indent=2)+"\n")
print(json.dumps(metadata), flush=True)

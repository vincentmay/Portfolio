"""Export game-resolved block elements, face colours and glass transparency.

Presentation geometry stays in .preview. Minecraft texture colours and alpha
are averaged per face; this is a schematic visualization, not a game capture.
"""
from pathlib import Path
import json
import pickle
import sys

import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root.parent / "Blockwright"))
from blockwright.assets import AssetResolver, BlockShape, TEXTURES_DIR, _texture_stem
from blockwright.blockpedia import block_card
from blockwright.render import color_table, block_color

folder = root / ".preview/blockwright"
name = sys.argv[1]
with (folder / f"{name}.pickle").open("rb") as stream:
    model = pickle.load(stream)
bx, by, bz, ex, ey, ez = model.bounds()
size = (ex-bx+1, ey-by+1, ez-bz+1)
grid = np.zeros(tuple(n+2 for n in size), dtype=np.uint16)
for (sx, sy, sz), section in model._sections.items():
    starts = (sx*16-bx+1, sy*16-by+1, sz*16-bz+1)
    lower = tuple(max(n, 1) for n in starts)
    upper = tuple(min(n+16, grid.shape[i]-1) for i,n in enumerate(starts))
    if any(lower[i] >= upper[i] for i in range(3)): continue
    grid[tuple(slice(lower[i], upper[i]) for i in range(3))] = section.blocks[
        tuple(slice(lower[i]-starts[i], upper[i]-starts[i]) for i in range(3))]
cells = grid[1:-1,1:-1,1:-1]
assert np.count_nonzero(cells) == model.non_air_count()
resolver, table = AssetResolver(), color_table()
shapes = [None] + [resolver.shape_for(b) for b in model._palette[1:]]
for i, shape in enumerate(shapes[1:],1):
    # Some ordinary cubes expose several weighted texture variants. They are
    # alternatives, not overlapping geometry; pick the first legal variant.
    if all((e.x0,e.y0,e.z0,e.x1,e.y1,e.z1) == (0,0,0,1,1,1) for e in shape.elements):
        shapes[i] = BlockShape((shape.elements[0],), shape.source, shape.fallback_reason)
for i, shape in enumerate(shapes[1:],1):
    # The client renders fluids without JSON elements. For these static source
    # pools use the native renderer's occupied-cell volume, explicitly recorded
    # as a fluid approximation rather than claiming game-exact water surfaces.
    fluid = model._palette[i].name == "minecraft:water" and dict(model._palette[i].properties).get("level") == "0"
    assert not shape.is_fallback or fluid, f"Unresolved game geometry: {shape}"
cube = np.zeros(len(shapes), dtype=bool)
alpha = np.ones(len(shapes), dtype=float)
for i, shape in enumerate(shapes[1:], 1):
    if len(shape.elements) == 1:
        e = shape.elements[0]
        cube[i] = (e.x0,e.y0,e.z0,e.x1,e.y1,e.z1) == (0,0,0,1,1,1)
    if "glass" in model._palette[i].name:
        texture = next(iter(dict(shape.elements[0].faces).values()))
        path = TEXTURES_DIR / (_texture_stem(texture) + ".png")
        alpha[i] = float(np.asarray(Image.open(path).convert("RGBA"))[:,:,3].mean()/255)
occludes = cube & (alpha == 1)
directions = [
    ((1,0,0),"east",[(1,0,0),(1,1,0),(1,1,1),(1,0,1)]),
    ((-1,0,0),"west",[(0,0,1),(0,1,1),(0,1,0),(0,0,0)]),
    ((0,1,0),"up",[(0,1,1),(1,1,1),(1,1,0),(0,1,0)]),
    ((0,-1,0),"down",[(0,0,0),(1,0,0),(1,0,1),(0,0,1)]),
    ((0,0,1),"south",[(1,0,1),(1,1,1),(0,1,1),(0,0,1)]),
    ((0,0,-1),"north",[(0,0,0),(0,1,0),(1,1,0),(1,0,0)]),
]
positions, normals, colors, emissions, groups = [], [], [], [], []
offset = 0
for opacity in sorted(set(alpha[1:]), reverse=True):
    group_start = offset
    for i, shape in enumerate(shapes[1:],1):
        if alpha[i] != opacity: continue
        block = model._palette[i]
        xyz = np.argwhere(cells == i)
        if not len(xyz): continue
        light = round(block_card(block.name)["light_emission"]/15*255)
        for element in shape.elements:
            low = np.array([element.x0,element.y0,element.z0])
            high = np.array([element.x1,element.y1,element.z1])
            for normal, face, corners in directions:
                texture = dict(element.faces).get(face)
                if texture is None: continue
                axis = next(n for n,d in enumerate(normal) if d)
                boundary = high[axis] == 1 if normal[axis] > 0 else low[axis] == 0
                selected = xyz
                if boundary:
                    adjacent = grid[tuple((xyz+1+np.array(normal)).T)]
                    hidden = occludes[adjacent]
                    if opacity < 1: hidden |= adjacent == i
                    selected = xyz[~hidden]
                if not len(selected): continue
                rgb = np.array(resolver.texture_color(texture, block_color(block,table)))/255
                linear = np.where(rgb <= .04045,rgb/12.92,((rgb+.055)/1.055)**2.4)
                vertices = selected[:,None,:] + (low+np.array(corners)*(high-low))[[0,1,2,0,2,3]][None,:,:]
                vertices = vertices.reshape(-1,3).astype(np.float32)
                vertices -= np.array(size,dtype=np.float32)/2
                positions.append(vertices)
                normals.append(np.tile(np.array(normal,dtype=np.int8)*127,(len(vertices),1)))
                colors.append(np.tile(np.round(linear*255).astype(np.uint8),(len(vertices),1)))
                emissions.append(np.full(len(vertices),light,dtype=np.uint8))
                offset += len(vertices)
    groups.append({"start":group_start,"count":offset-group_start,"opacity":opacity})
arrays = [np.concatenate(a) for a in (positions,normals,colors,emissions)]
with (folder/f"{name}.bin").open("wb") as stream:
    for array in arrays: stream.write(array.tobytes())
metadata = {"vertices":offset,"size":size,"blocks":model.non_air_count(),
            "bytes":[a.nbytes for a in arrays],"groups":groups,
            "geometry":"game-resolved block elements", "surface":"texture-averaged colours and glass alpha",
            "approximations":[model._palette[i].name+": source-fluid cell volume" for i,s in enumerate(shapes[1:],1) if s.is_fallback]}
(folder/f"{name}.json").write_text(json.dumps(metadata),encoding="utf8")
print(json.dumps(metadata),flush=True)

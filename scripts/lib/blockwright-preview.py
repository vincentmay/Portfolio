from pathlib import Path
import json
import pickle
import sys
import numpy as np

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root.parent / "Blockwright"))
from blockwright.assets import AssetResolver
from blockwright.blockpedia import block_card
from blockwright.render import color_table, block_color

folder = root / ".preview" / "blockwright"
name = sys.argv[1] if len(sys.argv) > 1 else "fable_universe"
with (folder / f"{name}.pickle").open("rb") as f:
    model = pickle.load(f)
min_x, min_y, min_z, max_x, max_y, max_z = model.bounds()
size = (max_x-min_x+1, max_y-min_y+1, max_z-min_z+1)
grid = np.zeros(tuple(n+2 for n in size), dtype=np.uint16)
for (sx, sy, sz), section in model._sections.items():
    starts = (sx*16-min_x+1, sy*16-min_y+1, sz*16-min_z+1)
    # Bounds can cut through any section, including the lower edges. Clip both
    # sides and offset the source slices so negative starts cannot wrap the grid.
    lower = tuple(max(n, 1) for n in starts)
    upper = tuple(min(n+16, grid.shape[i]-1) for i,n in enumerate(starts))
    if any(lower[i] >= upper[i] for i in range(3)): continue
    grid[tuple(slice(lower[i], upper[i]) for i in range(3))] = section.blocks[
        tuple(slice(lower[i]-starts[i], upper[i]-starts[i]) for i in range(3))
    ]
cells = grid[1:-1,1:-1,1:-1]
assert np.count_nonzero(cells) == model.non_air_count(), "Preview lost blocks at a section boundary"
resolver = AssetResolver()
table = color_table()
directions = [
    ((1,0,0),"east",[(1,0,0),(1,1,0),(1,1,1),(1,0,1)]),
    ((-1,0,0),"west",[(0,0,1),(0,1,1),(0,1,0),(0,0,0)]),
    ((0,1,0),"up",[(0,1,1),(1,1,1),(1,1,0),(0,1,0)]),
    ((0,-1,0),"down",[(0,0,0),(1,0,0),(1,0,1),(0,0,1)]),
    ((0,0,1),"south",[(1,0,1),(1,1,1),(0,1,1),(0,0,1)]),
    ((0,0,-1),"north",[(0,0,0),(0,1,0),(1,1,0),(1,0,0)]),
]
positions, normals, colors, emissions = [], [], [], []
for normal, face, corners in directions:
    neighbor = grid[tuple(slice(1+d,1+d+n) for d,n in zip(normal,size))]
    xyz = np.argwhere((cells != 0) & (neighbor == 0))
    ids = cells[tuple(xyz.T)]
    palette_colors = np.zeros((len(model._palette),3), dtype=np.uint8)
    palette_light = np.zeros(len(model._palette), dtype=np.uint8)
    for i, block in enumerate(model._palette[1:],1):
        shape = resolver.shape_for(block)
        textures = dict(shape.elements[0].faces)
        texture = textures.get(face) or textures.get("up") or next(iter(textures.values()),None)
        rgb = np.array(resolver.texture_color(texture, block_color(block,table)))/255
        linear = np.where(rgb <= .04045, rgb/12.92, ((rgb+.055)/1.055)**2.4)
        palette_colors[i] = np.round(linear*255).astype(np.uint8)
        palette_light[i] = round(block_card(block.name)["light_emission"]/15*255)
    vertices = xyz[:,None,:] + np.array(corners)[[0,1,2,0,2,3]][None,:,:]
    vertices = vertices.reshape(-1,3).astype(np.float32)
    vertices -= np.array(size,dtype=np.float32)/2
    positions.append(vertices)
    normals.append(np.tile(np.array(normal,dtype=np.int8)*127,(len(vertices),1)))
    colors.append(np.repeat(palette_colors[ids],6,axis=0))
    emissions.append(np.repeat(palette_light[ids],6))
    print(f"{name}: {face}: {len(xyz):,} exposed faces",flush=True)
arrays=[np.concatenate(a) for a in (positions,normals,colors,emissions)]
with (folder/f"{name}.bin").open("wb") as f:
    for a in arrays: f.write(a.tobytes())
metadata={"vertices":len(arrays[0]),"size":size,"blocks":model.non_air_count(),"bytes":[a.nbytes for a in arrays]}
(folder/f"{name}.json").write_text(json.dumps(metadata),encoding="utf8")
print(metadata,flush=True)

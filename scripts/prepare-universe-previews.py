"""Resolve registry defaults in legacy universe caches without changing geometry.

All output stays in the portfolio; the authored programs and original caches are
read-only. Missing defaults affect old axis textures, not occupied block cells.
"""
from pathlib import Path
import argparse
import hashlib
import json
import pickle
import subprocess
import sys
import shutil

from PIL import Image

root = Path(__file__).resolve().parents[1]
repo = root.parent / 'Blockwright'
sys.path.insert(0, str(repo))
from blockwright.model import BlockState
from blockwright.state import registry_blocks, assert_legal_model
from blockwright.litematic import write_litematic, read_litematic

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('names', nargs='*', choices=['fable_universe', 'test_universe'])
parser.add_argument('--capture', type=Path, help='Install the selected 3840 × 2400 Fable canvas')
args = parser.parse_args()
names = args.names or ['fable_universe', 'test_universe']
camera = {'x': 290, 'y': 370, 'z': 590, 'exposure': 1.0, 'strength': .38,
          'fill': .45, 'ambient': .5, 'emission': 3.5,
          'keyPosition': [-350, 500, 300], 'keyIntensity': 2.2, 'shadows': False,
          'vignette': 1, 'vignetteInner': .21, 'vignetteOuter': .49,
          'bloomRadius': .65, 'bloomThreshold': .8}
if args.capture:
    assert names == ['fable_universe'], 'Capture installation is for the selected Fable view only'
    metadata_path = root / '.preview/blockwright/fable_universe_resolved-provenance.json'
    metadata = json.loads(metadata_path.read_text())
    assert metadata['source_sha256'] == hashlib.sha256((repo/'builds/fable_universe.py').read_bytes()).hexdigest()
    assert metadata['resolved_cache_sha256'] == hashlib.sha256((metadata_path.parent/'fable_universe_resolved.pickle').read_bytes()).hexdigest()
    target = root / 'public/projects/blockwright-fable-universe.webp'
    with Image.open(args.capture) as image:
        assert image.size == (3840, 2400) and image.format == 'WEBP'
        shutil.copyfile(args.capture, target)
        for width in (960, 1920):
            image.convert('RGB').resize((width, width*5//8), Image.Resampling.LANCZOS).save(
                target.with_name(f'blockwright-fable-universe-{width}.webp'), quality=86, method=6)
    metadata.update({'canvas': [3840, 2400], 'camera': camera,
                     'image_sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                     'bytes': target.stat().st_size,
                     'renderer': 'Three.js presentation of game-resolved block elements',
                     'surface': 'texture-averaged colours; emission from authored block states',
                     'presentation': 'soft directional light, bloom and optical edge falloff; unchanged geometry',
                     'runtime_behavior': 'static artwork; no runtime claim'})
    metadata_path.write_text(json.dumps(metadata, indent=2)+'\n')
    print(json.dumps(metadata))
    raise SystemExit(0)

for name in names:
    folder = root / '.preview/blockwright'
    cache = folder / f'{name}.pickle'
    source = repo / 'builds' / f'{name}.py'
    model = pickle.loads(cache.read_bytes())
    before = model.non_air_count(), model.bounds()
    resolved, defaults = [], []
    for block in model._palette:
        props = dict(registry_blocks()[block.name].get('default_state', {}).get('Properties', {}))
        props.update(dict(block.properties))
        state = BlockState.of(block.name, **props)
        if state != block:
            defaults.append({'block': block.to_identifier(), 'resolved': state.to_identifier()})
        resolved.append(state)
    model._palette = resolved
    model._palette_index = {state: index for index, state in enumerate(resolved)}
    assert before == (model.non_air_count(), model.bounds())
    assert_legal_model(model)
    target_name = f'{name}_resolved'
    target = folder / f'{target_name}.pickle'
    target.write_bytes(pickle.dumps(model))
    schematic = folder / f'{target_name}.litematic'
    write_litematic(model, schematic, name=name.replace('_', ' ').title(), output_root=root)
    roundtrip = read_litematic(schematic)
    assert before == (roundtrip.non_air_count(), roundtrip.bounds())
    stats = {'scene': target_name, 'source': str(source.relative_to(repo)),
             'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
             'cache_sha256': hashlib.sha256(cache.read_bytes()).hexdigest(),
             'resolved_cache_sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
             'schematic_sha256': hashlib.sha256(schematic.read_bytes()).hexdigest(),
             'blocks': before[0], 'bounds': before[1], 'size': model.size(),
             'registry_defaults': defaults, 'geometry_changes': 0,
             'status': 'presentation of authored build; no mechanics claim'}
    (folder / f'{target_name}-provenance.json').write_text(json.dumps(stats, indent=2)+'\n')
    print(json.dumps(stats), flush=True)
    subprocess.run([sys.executable, str(root/'scripts/lib/blockwright-shaped-preview.py'), target_name], check=True)
    shutil.copyfile(root/'scripts/lib/blockwright-studio.html', root/'.preview/blockwright-scene.html')
    print(f'Open /.preview/blockwright-scene.html?build={target_name} on the Vite server.')
    print('studio.resize(3840, 2400); studio.render(' + json.dumps(camera) + ')')

"""Prepare delivered agent schematics for portfolio presentation renders.

Use the sibling Blockwright environment's Python. Capture the local Three.js
studio at 3840 x 2400, then pass --capture to install responsive WebPs. Only
portfolio images are published; source artifacts and game worlds are untouched.
"""
from pathlib import Path
import argparse
import hashlib
import json
import pickle
import shutil
import subprocess
import sys

from PIL import Image

root = Path(__file__).resolve().parents[1]
repo = root.parent / "Blockwright"
scenes = {
    "tidal": {"thread": "build-the-tidal-engine-a-d7351d29", "name": "tidal_engine",
              "camera": {"x":420,"y":245,"z":-455,"ty":-15,"exposure":1.1,"strength":.15,
                         "fill":.8,"ambient":.65,"emission":2.8,"keyPosition":[100,420,-300],
                         "keyIntensity":3.2,"shadows":True,"bloomRadius":.5,"bloomThreshold":1,"vignette":.2}},
    "universe": {"thread": "build-a-universe-under-cf127995", "name": "universe_under_glass",
                 "camera": {"x":390,"y":215,"z":-512,"ty":-18,"exposure":1.16,"strength":.16,
                            "fill":1,"ambient":.7,"emission":3,"keyPosition":[100,420,-420],
                            "keyIntensity":3.2,"shadows":True,"bloomRadius":.55,"bloomThreshold":1,"vignette":.2}},
    "dragon": {"thread": "create-a-massive-gigantic-e12d2d5a", "name": "ancient_dragon_colossus",
               "camera": {"x":305,"y":175,"z":-370,"exposure":1.1,"strength":.1,"fill":1.1}},
    "crystal-star": {"thread": "create-a-fully-59b79564", "name": "orbital_crystal_star",
                     "camera": {"x":-85,"y":35,"z":180,"exposure":1.08,"strength":.1,"fill":1,
                                "keyPosition":[-100,180,160]}},
    "solar": {"thread": "create-a-floating-0d9eca02", "name": "solar_containment",
              "camera": {"x":-100,"y":36,"z":134,"exposure":.9,"strength":.19,"fill":.55,
                         "ambient":.55,"emission":1.2,"keyPosition":[-120,190,160],"keyIntensity":2.8,
                         "shadows":True,"bloomRadius":.5,"bloomThreshold":1,"vignette":.25,
                         "practicalIntensity":2300,"practicalPosition":[3,0,0],"practicalColor":0xffbb70,"practicalDistance":120}},
    "orrery": {"thread": "create-a-fully-b9b58133", "name": "fractured_astral_orrery",
               "camera": {"x":270,"y":170,"z":-360,"exposure":1.0,"strength":.13,"fill":.9}},
    "twilight": {"thread": "create-a-floating-f27c37b5", "name": "twilight_seed",
                 "camera": {"x":280,"y":160,"z":-400,"exposure":1.1,"strength":.14,"fill":1.0}},
    "stellar-002": {"thread": "build-a-monumental-minecraft-89395a40", "name": "002_stellar_star",
                    "source": "imports/previous_schematics", "camera": {"x":130,"y":60,"z":-430,"exposure":1.08,"strength":0,"fill":.65,
                                                                          "ambient":.5,"emission":0,"keyPosition":[-180,330,-300],
                                                                          "keyIntensity":3.2,"shadows":False,"vignette":.2}},
    "radiant-star": {"thread": "build-a-monumental-minecraft-89395a40", "name": "radiant_star",
                     "camera": {"x":-130,"y":65,"z":440,"exposure":1.08,"strength":.075,"fill":1,
                                "keyPosition":[-150,350,350]}},
}
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("scene", choices=scenes)
parser.add_argument("--capture", type=Path)
args = parser.parse_args()
scene = scenes[args.scene]
name = scene["name"]
schematic = repo / ".dev/threads" / scene["thread"] / scene.get("source", "schematics") / f"{name}.litematic"
digest = hashlib.sha256(schematic.read_bytes()).hexdigest()
evidence = json.loads(schematic.with_suffix(".evidence.json").read_text())
assert evidence["artifact"]["sha256"] == digest, "Stale schematic evidence"
assert evidence["checks"]["registry_and_static_lint"]["status"] == "pass"
camera = {"keyPosition":[150,350,-350], "keyIntensity":3.2, "shadows":True, **scene["camera"]}
folder = root / ".preview/blockwright"
folder.mkdir(parents=True, exist_ok=True)
metadata_path = folder / f"{name}-provenance.json"

if args.capture:
    metadata = json.loads(metadata_path.read_text())
    assert metadata["sha256"] == digest, "Capture preparation refers to another artifact"
    prefix = "under-glass" if args.scene == "universe" else args.scene
    target = root / f"public/projects/blockwright-{prefix}.webp"
    with Image.open(args.capture) as image:
        assert image.size == (3840, 2400), "Capture must be the full 4K canvas"
        if image.format == "WEBP":
            shutil.copyfile(args.capture, target)
        else:
            image.convert("RGB").save(target, quality=90, method=6)
        for width in (960, 1920):
            image.convert("RGB").resize((width, width*5//8), Image.Resampling.LANCZOS).save(
                target.with_name(f"blockwright-{prefix}-{width}.webp"), quality=84, method=6)
    metadata.update({"canvas":[3840,2400],"camera":camera,"bytes":target.stat().st_size,
                     "image_sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
                     "background":"#14141a before tone mapping",
                     "renderer":"Three.js presentation of game-resolved block elements",
                     "surface":"averaged texture colours and glass alpha",
                     "runtime_behavior":"static artwork; no runtime claim"})
    if camera.get("practicalIntensity", 0):
        metadata["practical_light"] = "Point-light approximation of the authored solar core's spill; studio lighting, not Minecraft light propagation"
    metadata_path.write_text(json.dumps(metadata, indent=2)+"\n")
    print(json.dumps(metadata))
    raise SystemExit(0)

sys.path.insert(0, str(repo))
from blockwright.litematic import read_litematic
from blockwright.state import assert_legal_model

model = read_litematic(schematic)
assert_legal_model(model)
with (folder / f"{name}.pickle").open("wb") as stream:
    pickle.dump(model, stream)
metadata = {"scene":args.scene,"source":str(schematic.relative_to(repo)),"sha256":digest,
            "blocks":model.non_air_count(),"bounds":model.bounds(),"size":model.size()}
metadata_path.write_text(json.dumps(metadata, indent=2)+"\n")
subprocess.run([sys.executable, str(root / "scripts/lib/blockwright-shaped-preview.py"), name], check=True)
shutil.copyfile(root / "scripts/lib/blockwright-studio.html", root / ".preview/blockwright-scene.html")
print(f"Open /.preview/blockwright-scene.html?build={name} on the Vite dev server.")
print("studio.resize(3840, 2400); studio.render(" + json.dumps(camera) + ")")
print("Capture the canvas at its original resolution, then run --capture <file>.")

"""Check that a hero tier's base and reveal land on the same pixel grid.

The cursor-reveal stacks these two images and masks the reveal to a circle. If
they were resampled onto different grids, or had drifted apart in framing, a
sliver of the reveal layer could escape the base layer's silhouette -- which is
exactly the sunglasses-bleed bug v19 fixed.

Two checks, per tier:
  - bounding box of the opaque region, which catches framing drift
  - per-scanline count of fully transparent pixels, which catches resampling
    drift that a bounding box would hide
"""
import os
import sys

from PIL import Image

DEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets")
TIERS = sys.argv[1:] or ["600"]


def opaque_rows(img):
    a = img.getchannel("A")
    w, h = img.size
    px = a.load()
    counts = []
    for y in range(0, h, max(1, h // 60)):
        row = [px[x, y] for x in range(w)]
        counts.append(sum(1 for v in row if v == 0))
    return counts


def bbox(img):
    return img.getchannel("A").getbbox()


for tier in TIERS:
    suffix = "" if tier in ("master", "1086") else f"-{tier}"
    base = Image.open(os.path.join(DEST, f"hero-base{suffix}.webp")).convert("RGBA")
    rev = Image.open(os.path.join(DEST, f"hero-reveal{suffix}.webp")).convert("RGBA")
    print(f"\n=== tier {tier or 'master'}  base {base.size}  reveal {rev.size} ===")
    if base.size != rev.size:
        print(f"  SIZE MISMATCH: {base.size} vs {rev.size}")
        continue
    bb, br = bbox(base), bbox(rev)
    print(f"  opaque bbox  base {bb}  reveal {br}")
    if bb == br:
        print("  bbox identical")
    else:
        print("  BBOX DIFFERS")
    cb, cr = opaque_rows(base), opaque_rows(rev)
    diffs = [abs(x - y) for x, y in zip(cb, cr)]
    worst = max(range(len(diffs)), key=lambda i: diffs[i])
    print(f"  transparent-px per scanline (60 samples, {base.size[0]}px wide)")
    print(f"    base  min {min(cb)} max {max(cb)}")
    print(f"    reveal min {min(cr)} max {max(cr)}")
    print(f"    worst per-scanline delta {diffs[worst]}px at sample {worst} "
          f"(base {cb[worst]} vs reveal {cr[worst]})")
    print(f"    mean delta {sum(diffs)/len(diffs):.2f}px  "
          f"({100*sum(diffs)/len(diffs)/base.size[0]:.3f}% of width)")

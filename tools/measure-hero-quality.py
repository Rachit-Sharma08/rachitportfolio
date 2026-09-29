"""Measure WebP quality candidates against the original PNGs.

v17 picked q92 by eyeballing PSNR on a straight channel comparison. That is
wrong for these files: they are cut-outs with an alpha channel, so the RGB under
a transparent pixel is arbitrary. Comparing raw RGB therefore reports huge
"errors" along the silhouette that have nothing to do with what anyone sees.

This composites both the reference and the candidate over the same near-black
page background first, then scores what is actually on screen — PSNR and SSIM,
both on the standard 0-255 scale.

Run from the repo root:

  <venv>\\Scripts\\python.exe tools/measure-hero-quality.py
"""
import math
import os

from PIL import Image

# The hero's darkest surface tone. Compositing over the real page colour is what
# makes the silhouette edge measurable.
PAGE_BG = (10, 4, 7)

SRC = {
    "base": r"D:\Pictures\photo 1.png",
    "reveal": r"D:\Pictures\photo 2.png",
}
OUT = os.path.join(os.path.dirname(__file__), "..", "dist", "quality-probe")

WIDTHS = [480, 800, 1086]
QUALITIES = [78, 82, 85, 88, 92]


def composite(img):
    """Flatten an RGBA cut-out onto the page background."""
    img = img.convert("RGBA")
    bg = Image.new("RGBA", img.size, PAGE_BG + (255,))
    return Image.alpha_composite(bg, img).convert("RGB")


def score(a, b):
    """PSNR (dB) and mean SSIM over the composited RGB pair."""
    pa = a.tobytes()
    pb = b.tobytes()
    total = 0.0
    count = 0
    for x, y in zip(pa, pb):
        d = x - y
        total += d * d
        count += 1
    mse = total / count
    psnr = float("inf") if mse == 0 else 10 * math.log10((255 * 255) / mse)

    # SSIM via a 8x8 sliding window on the luma plane, averaged. Cheap to
    # implement, and it tracks perceived quality far better than PSNR alone.
    L1, L2 = 0, 0
    a_px = a.load()
    b_px = b.load()
    w, h = a.size
    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2
    for y in range(0, h - 8, 4):
        for x in range(0, w - 8, 4):
            sa = sb = saa = sbb = sab = 0.0
            for j in range(8):
                for i in range(8):
                    va = a_px[x + i, y + j]
                    vb = b_px[x + i, y + j]
                    la = 0.299 * va[0] + 0.587 * va[1] + 0.114 * va[2]
                    lb = 0.299 * vb[0] + 0.587 * vb[1] + 0.114 * vb[2]
                    sa += la
                    sb += lb
                    saa += la * la
                    sbb += lb * lb
                    sab += la * lb
            n = 64.0
            ma, mb = sa / n, sb / n
            va = saa / n - ma * ma
            vb = sbb / n - mb * mb
            cov = sab / n - ma * mb
            ssim = ((2 * ma * mb + C1) * (2 * cov + C2)) / (
                (ma * ma + mb * mb + C1) * (va + vb + C2)
            )
            L1 += ssim
            L2 += 1
    return psnr, (L1 / L2 if L2 else 1.0)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, path in SRC.items():
        original = Image.open(path)
        print(f"\n=== {name}  {original.size[0]}x{original.size[1]} "
              f"{os.path.getsize(path):,} B PNG ===")

        for width in WIDTHS:
            height = round(width * 4 / 3)
            # The identical box for base and reveal, so the two layers land on
            # the same output pixel grid at every size.
            resized = original.resize((width, height), Image.LANCZOS)
            reference = composite(resized)
            print(f"  -- {width}w --")
            for q in QUALITIES:
                probe = os.path.join(OUT, f"{name}-{width}-q{q}.webp")
                resized.save(
                    probe, "WEBP", quality=q, method=6,
                    alpha_quality=100, exact=True,
                )
                psnr, ssim = score(composite(Image.open(probe)), reference)
                size = os.path.getsize(probe)
                print(
                    f"     q{q:<3} {size:>8,} B   PSNR {psnr:5.2f} dB   "
                    f"SSIM {ssim:.4f}"
                )
                os.remove(probe)


if __name__ == "__main__":
    main()

"""Probe the 720 hero tier for quality headroom, and test a better-fitting width.

Two questions, answered with the same metric the project already uses
(tools/measure-hero-quality.py -- composited over the page background, PSNR +
8x8-window SSIM, bar = SSIM >= 0.98):

  1. Can 720 go below q88 without crossing the bar? The v29/v32 notes say the
     silver blazer on the reveal drops to 0.977 at q85, but that was measured at
     a different width, so it gets re-measured here at 720 specifically.
  2. Is 720 even the right width for this device class? The figure renders at
     284 CSS px at 412x823, so a DPR-2 phone needs 568 device px and takes the
     next rung up, 720 -- a 27% overshoot on the LCP element.

Per-band SSIM is reported alongside the whole-image score so the worst area is
located rather than guessed at. The reveal's sunglasses / silver lapels are the
suspected hot spot and should show up as the worst band.

Run:
  <venv>\\Scripts\\python.exe tools/probe-hero-720.py [fast|exact]
"""
import math
import os
import sys
import tempfile
import importlib.util

from PIL import Image

# measure-hero-quality.py has a hyphen, so it cannot be imported by name. Load it
# by path and reuse its exact scoring so these numbers are directly comparable to
# the measurements already recorded in AGENTS.md, rather than a second definition.
_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "mhq", os.path.join(_HERE, "measure-hero-quality.py"))
_mhq = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mhq)
composite = _mhq.composite
PAGE_BG = _mhq.PAGE_BG

SRC = {
    "base": r"D:\Pictures\photo 1.png",
    "reveal": r"D:\Pictures\photo 2.png",
}

EXACT = (len(sys.argv) > 1 and sys.argv[1] == "exact")

# Coarse pass is a 8px step for speed; the exact pass matches the project tool.
STEP = 4 if EXACT else 8
QUALITIES = [88] if not EXACT else []
if not EXACT:
    WIDTHS = [600, 640, 720]
    QUALITIES = [88, 85, 82, 80, 78]
else:
    WIDTHS = [600, 720]
    QUALITIES = [88, 85, 82]

BANDS = 6


def score(a, b, step=4):
    """PSNR (dB) and mean SSIM over the composited RGB pair.

    Same formulation as measure-hero-quality.score, with a configurable window
    stride. Default stride matches that tool exactly.
    """
    pa, pb = a.tobytes(), b.tobytes()
    total = 0
    for x, y in zip(pa, pb):
        d = x - y
        total += d * d
    mse = total / len(pa)
    psnr = float("inf") if mse == 0 else 10 * math.log10((255 * 255) / mse)

    L1 = L2 = 0.0
    a_px, b_px = a.load(), b.load()
    w, h = a.size
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    for y in range(0, h - 8, step):
        for x in range(0, w - 8, step):
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
            va, vb, cov = saa / n - ma * ma, sbb / n - mb * mb, sab / n - ma * mb
            L1 += ((2 * ma * mb + C1) * (2 * cov + C2)) / (
                (ma * ma + mb * mb + C1) * (va + vb + C2))
            L2 += 1
    return psnr, (L1 / L2 if L2 else 1.0)


def band_scores(cand, ref, step=4):
    """SSIM of each horizontal band, so the worst region is identified."""
    w, h = cand.size
    bh = h // BANDS
    out = []
    for k in range(BANDS):
        box = (0, k * bh, w, (k + 1) * bh)
        out.append(score(cand.crop(box), ref.crop(box), step)[1])
    return out


def encode(img, path, q):
    img.save(path, "WEBP", quality=q, method=6, alpha_quality=100, exact=True)
    return os.path.getsize(path)


def score_at_display(original, cand_path, display_w):
    """Score a candidate the way a browser would actually show it.

    Scoring a 600w and a 720w file against their own same-width resized source
    answers the wrong question: each is compared to a differently-smoothed
    reference, so the numbers are not comparable to each other. What matters is
    both being scaled into the same device-pixel box. So the candidate is
    resized to display_w and scored against the source resized to display_w --
    the same comparison a viewer makes, resampling and all.
    """
    display_h = round(display_w * 4 / 3)
    ref = composite(original.resize((display_w, display_h), Image.LANCZOS))
    cand = composite(Image.open(cand_path).resize((display_w, display_h), Image.LANCZOS))
    return score(cand, ref, STEP)


def main():
    tmp = tempfile.mkdtemp(prefix="hero720-")
    # The device class under investigation: 412x823 at DPR 2 renders the figure
    # at 284 CSS px (46vh of 823, times the 3:4 aspect), so it needs 568 device
    # px and today takes the 720 rung.
    DISPLAY_W = 568
    for name, path in SRC.items():
        original = Image.open(path)
        print(f"\n=== {name}  {original.size[0]}x{original.size[1]} "
              f"{os.path.getsize(path):,} B PNG   (stride {STEP}) ===")
        print(f"\n  -- native-reference SSIM (each width vs its own resize) --")
        print(f"  {'width':>6} {'q':>4} {'bytes':>10} {'PSNR':>8} {'SSIM':>8}   worst band")
        for width in WIDTHS:
            height = round(width * 4 / 3)
            resized = original.resize((width, height), Image.LANCZOS)
            reference = composite(resized)
            for q in QUALITIES:
                probe = os.path.join(tmp, f"{name}-{width}-q{q}.webp")
                size = encode(resized, probe, q)
                cand = composite(Image.open(probe))
                psnr, ssim = score(cand, reference, STEP)
                bands = band_scores(cand, reference, STEP)
                worst = min(range(BANDS), key=lambda i: bands[i])
                flag = "PASS" if ssim >= 0.98 and psnr >= 40 else "FAIL"
                print(f"  {width:>6} {q:>4} {size:>10,} {psnr:>7.2f}d "
                      f"{ssim:>8.4f}   band {worst} ssim {bands[worst]:.4f}  {flag}")

        print(f"\n  -- as actually displayed at {DISPLAY_W} device px "
              f"(412x823 @2) --")
        print(f"  {'width':>6} {'q':>4} {'bytes':>10} {'PSNR':>8} {'SSIM':>8}")
        for width in WIDTHS:
            height = round(width * 4 / 3)
            resized = original.resize((width, height), Image.LANCZOS)
            for q in QUALITIES:
                probe = os.path.join(tmp, f"{name}-{width}-q{q}.webp")
                size = encode(resized, probe, q)
                psnr, ssim = score_at_display(original, probe, DISPLAY_W)
                flag = "PASS" if ssim >= 0.98 and psnr >= 40 else "FAIL"
                print(f"  {width:>6} {q:>4} {size:>10,} {psnr:>7.2f}d "
                      f"{ssim:>8.4f}   {flag}")
                os.remove(probe)


if __name__ == "__main__":
    main()

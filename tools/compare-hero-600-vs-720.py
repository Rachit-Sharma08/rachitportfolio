"""Region-by-region quality check for the 600 tier against the 720 it replaces.

Whole-image SSIM averaged the silver blazer and the sunglasses together with the
dark lower body, which is where most of the file's bytes go but where error is
least visible. This scores named regions at the device-pixel width the page
actually paints at (568), so the numbers answer "can you see it" rather than
"does the math work out".

  <venv>\\Scripts\\python.exe tools/compare-hero-600-vs-720.py
"""
import importlib.util
import os
import tempfile

from PIL import Image

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "mhq", os.path.join(_HERE, "measure-hero-quality.py"))
_mhq = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mhq)
composite = _mhq.composite

SRC = {
    "base": r"D:\Pictures\photo 1.png",
    "reveal": r"D:\Pictures\photo 2.png",
}
DEST = os.path.join(_HERE, "..", "public", "assets")
DISPLAY_W = 568
DISPLAY_H = round(DISPLAY_W * 4 / 3)
STEP = 4

# Fractions of height. The figure is 3:4, head at the top, the silver blazer
# across the middle third, and a wide dark mass filling the bottom ~40% (v16
# found the cut-out is opaque edge-to-edge below y ~ 62% of height).
REGIONS = [
    ("head + sunglasses", 0.00, 0.22),
    ("upper torso", 0.22, 0.42),
    ("silver blazer", 0.42, 0.62),
    ("lower dark mass", 0.62, 1.00),
]


def score(a, b):
    pa, pb = a.tobytes(), b.tobytes()
    total = sum((x - y) ** 2 for x, y in zip(pa, pb))
    mse = total / len(pa)
    import math
    psnr = float("inf") if mse == 0 else 10 * math.log10((255 * 255) / mse)

    L1 = L2 = 0.0
    ap, bp = a.load(), b.load()
    w, h = a.size
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    for y in range(0, max(1, h - 8), STEP):
        for x in range(0, max(1, w - 8), STEP):
            sa = sb = saa = sbb = sab = 0.0
            for j in range(8):
                for i in range(8):
                    va, vb = ap[x + i, y + j], bp[x + i, y + j]
                    la = 0.299 * va[0] + 0.587 * va[1] + 0.114 * va[2]
                    lb = 0.299 * vb[0] + 0.587 * vb[1] + 0.114 * vb[2]
                    sa += la; sb += lb
                    saa += la * la; sbb += lb * lb; sab += la * lb
            n = 64.0
            ma, mb = sa / n, sb / n
            va, vb, cov = saa / n - ma * ma, sbb / n - mb * mb, sab / n - ma * mb
            L1 += ((2 * ma * mb + C1) * (2 * cov + C2)) / (
                (ma * ma + mb * mb + C1) * (va + vb + C2))
            L2 += 1
    return psnr, (L1 / L2 if L2 else 1.0)


def at_display(img, w, h):
    return composite(img.resize((w, h), Image.LANCZOS))


def main():
    ref_full = {}
    for name, path in SRC.items():
        src = Image.open(path).convert("RGBA")
        ref_full[name] = at_display(src, DISPLAY_W, DISPLAY_H)

    print(f"Regions scored at {DISPLAY_W}x{DISPLAY_H} device px "
          f"(412x823 @2), composited over the page background.")
    print("SSIM >= 0.98 is the bar; PSNR >= 40 dB is the secondary one.\n")

    for name in SRC:
        print(f"=== {name} ===")
        print(f"  {'region':<20} {'600w SSIM':>10} {'600w PSNR':>10} "
              f"{'720w SSIM':>10} {'720w PSNR':>10}   verdict")
        ref = ref_full[name]
        results = {}
        for tier in ("600", "720"):
            img = Image.open(os.path.join(DEST, f"hero-{name}-{tier}.webp")).convert("RGBA")
            cand = at_display(img, DISPLAY_W, DISPLAY_H)
            results[tier] = {}
            for label, y0f, y1f in REGIONS:
                box = (0, round(y0f * DISPLAY_H), DISPLAY_W, round(y1f * DISPLAY_H))
                results[tier][label] = score(cand.crop(box), ref.crop(box))
        for label, _, _ in REGIONS:
            p6, s6 = results["600"][label]
            p7, s7 = results["720"][label]
            ok6 = s6 >= 0.98
            ok7 = s7 >= 0.98
            verdict = ("both pass" if ok6 and ok7 else
                       "600 FAILS" if not ok6 and ok7 else
                       "720 FAILS" if ok6 and not ok7 else "both fail")
            print(f"  {label:<20} {s6:>10.4f} {p6:>9.2f}d "
                  f"{s7:>10.4f} {p7:>9.2f}d   {verdict}")
        print()


if __name__ == "__main__":
    main()

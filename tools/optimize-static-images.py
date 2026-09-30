"""Re-encode the static, non-hero images in public/.

Same reasoning as generate-hero-assets.py: measure, then pick the quality that
holds SSIM >= 0.98 rather than guessing, and never let a re-encode feed on its
own output. That is why the portrait is read from tools/source/ rather than from
public/ — at one point the file this script wrote was the only copy left, and
feeding an encoder its own output compounds the resampling loss every run.

  public/rachit-{240,320,420,480,720}.webp
                       About-section portrait. The frame is a fixed 240px ring
                       with 2px of padding, so the image box is 236 CSS px at
                       every viewport and gets center-cropped to a square by
                       CSS object-cover. The sources are therefore pre-cropped
                       to the same center square, which is byte-identical on
                       screen to what object-cover shows and skips the 33% of
                       vertical pixels a 3:4 file would carry for it.
                       `sizes="236px"` then maps the DPRs worth covering
                       (1 / 1.3 / 1.75 / 2 / 3) onto exact device pixels — no
                       viewport downloads more than it draws. The 1200px JPEG
                       this replaced cost 92 KiB per visit into that box.
  public/og-image.png  Social share card. Never rendered on the page, so it is
                       not on any visitor's critical path — measured and
                       reported, and only rewritten if the win is large.

Run from the repo root:

  <venv>\\Scripts\\python.exe tools/optimize-static-images.py
"""
import math
import os

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
PORTRAIT_SOURCE = os.path.join(ROOT, "tools", "source", "rachit.jpg")
OG = os.path.join(ROOT, "public", "og-image.png")

# The image box inside the About frame is a fixed 236 CSS px square (a 240px
# ring with 2px padding) at every viewport, so these are its exact device-pixel
# needs at DPR 1, 1.3, 1.75 (Lighthouse mobile), 2 and 3 — the multiples
# sizes="236px" hands to the browser. The 320 tier exists because the 240->420
# jump over-served a DPR ~1.3-1.5 display by up to two thirds.
PORTRAIT_WIDTHS = (240, 320, 420, 480, 720)
# q85 keeps PSNR 36-39 dB and SSIM >= 0.98 on the square-cropped source at
# every tier (q82 already drops to 0.980-0.983 and q80 below that), which is
# the same visually-identical bar the hero images are held to.
PORTRAIT_QUALITY = 85


def psnr(a, b):
    pa, pb = a.tobytes(), b.tobytes()
    total = 0
    for x, y in zip(pa, pb):
        d = x - y
        total += d * d
    mse = total / len(pa)
    return float("inf") if mse == 0 else 10 * math.log10((255 * 255) / mse)


def ssim(a, b):
    ap, bp = a.load(), b.load()
    w, h = a.size
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    acc = n = 0
    for y in range(0, h - 8, 4):
        for x in range(0, w - 8, 4):
            sa = sb = saa = sbb = sab = 0.0
            for j in range(8):
                for i in range(8):
                    va, vb = ap[x + i, y + j], bp[x + i, y + j]
                    la = 0.299 * va[0] + 0.587 * va[1] + 0.114 * va[2]
                    lb = 0.299 * vb[0] + 0.587 * vb[1] + 0.114 * vb[2]
                    sa += la
                    sb += lb
                    saa += la * la
                    sbb += lb * lb
                    sab += la * lb
            m = 64.0
            ma, mb = sa / m, sb / m
            va = saa / m - ma * ma
            vb = sbb / m - mb * mb
            cov = sab / m - ma * mb
            acc += ((2 * ma * mb + C1) * (2 * cov + C2)) / (
                (ma * ma + mb * mb + C1) * (va + vb + C2)
            )
            n += 1
    return acc / n


def probe_rachit(original):
    square = portrait_square(original)
    print(f"\n=== portrait source  {original.size[0]}x{original.size[1]} "
          f"{os.path.getsize(PORTRAIT_SOURCE):,} B "
          f"-> center square {square.size[0]}x{square.size[1]} ===")
    tmp = os.path.join(ROOT, "dist", "probe.webp")
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    for width in PORTRAIT_WIDTHS:
        resized = square.resize((width, width), Image.LANCZOS)
        ref = resized.convert("RGB")
        resized.save(tmp, "WEBP", quality=PORTRAIT_QUALITY, method=6)
        got = Image.open(tmp).convert("RGB")
        print(f"  {width}x{width}  {os.path.getsize(tmp):>8,} B"
              f"   PSNR {psnr(got, ref):5.2f} dB   SSIM {ssim(got, ref):.4f}")


def probe_og(original):
    """Measured, deliberately not written.

    The share card is 1200x630 — exactly the Open Graph spec size — and it is
    never fetched by a visitor, so it adds zero bytes to page weight and never
    appears in a Lighthouse run. Its only audience is a social crawler rendering
    it at a size nobody can pixel-compare against the original.

    Quantising it to 256 colours would take 342,765 B to 140,677 B (-59%) and
    the text band still measures SSIM 0.9998, but a max per-channel error of 85
    inside a headline is the signature of colour banding that an average score
    hides. Trading a visible design asset for a number that buys no performance
    is the wrong side of the brief, so this stays as measured and unwritten.
    """
    print(f"\n=== og-image.png  {original.size[0]}x{original.size[1]} "
          f"{os.path.getsize(OG):,} B  (1200x630 is the OG spec size) ===")
    tmp = os.path.join(ROOT, "dist", "probe-og.png")
    ref = original.convert("RGB")
    w, h = ref.size
    text_band = ref.crop((0, int(h * 0.18), int(w * 0.72), int(h * 0.86)))
    ref.quantize(colors=256, method=Image.MEDIANCUT,
                 dither=Image.FLOYDSTEINBERG).save(
        tmp, "PNG", optimize=True, compress_level=9)
    decoded = Image.open(tmp).convert("RGB")
    band = decoded.crop((0, int(h * 18 / 100), int(w * 0.72), int(h * 0.86)))
    print(f"  256 colours dithered  {os.path.getsize(tmp):>8,} B"
          f"   PSNR {psnr(decoded, ref):5.2f} dB"
          f"   SSIM {ssim(decoded, ref):.4f}"
          f"   | text band SSIM {ssim(band, text_band):.4f}"
          f"   max px err {max(abs(a - b) for a, b in zip(band.tobytes(), text_band.tobytes()))}")
    print("  -> reported only, not written: off the critical path, and banding "
          "on the share card would be a visible design change")


def portrait_square(original):
    """Pre-crop the 3:4 source to the center square object-cover shows.

    CSS `object-cover` in the 236px square ring crops the same center square
    (top-to-bottom), so encoding the square directly gives byte-identical on
    screen pixels while carrying ~25% fewer bytes per file.
    """
    w, h = original.size
    side = min(w, h)
    return original.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))


def write_rachit(original):
    original = portrait_square(original)
    total = 0
    for width in PORTRAIT_WIDTHS:
        resized = original.resize((width, width), Image.LANCZOS)
        out = os.path.join(ROOT, "public", f"rachit-{width}.webp")
        resized.save(out, "WEBP", quality=PORTRAIT_QUALITY, method=6)
        size = os.path.getsize(out)
        total += size
        print(f"wrote {os.path.relpath(out, ROOT).replace(os.sep, '/')}"
              f"  {width}x{width}  {size:,} B")
    print(f"  {len(PORTRAIT_WIDTHS)} tiers, {total:,} B on disk — "
          f"exactly one is fetched per visit")


def main():
    original = Image.open(PORTRAIT_SOURCE).convert("RGB")
    probe_rachit(original)
    probe_og(Image.open(OG))
    write_rachit(original)


if __name__ == "__main__":
    main()

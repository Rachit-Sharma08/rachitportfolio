"""Generate the responsive hero cut-outs in public/assets/.

Re-encodes from the original PNGs in D:\\Pictures rather than from the existing
q92 WebP, so quality is not compounded by a second lossy pass.

Why four widths: the figure is sized in viewport height (46vh / 54vh / 74vh /
80vh at aspect 3/4), so the same asset was being downloaded at 1086px wide by a
phone showing it 291 CSS px wide. Measured across five viewports, the old
single-size setup was 52% of the pixels it needed on mobile and 187% of what
2x needed. srcset now picks per device.

Quality is q88 at every width, the highest level that holds SSIM >= 0.98 and
PSNR >= 40 dB once composited over the page background -- the conventional
"visually identical" bar. Re-measure with tools/probe-hero-720.py if the source
photos ever change; note that scoring a candidate against its own same-width
resize understates it, because the browser rescales it again on the way to the
screen. Score it at the device-pixel width it will actually be displayed at.

Every width uses the identical box for base and reveal, so the two layers always
land on the same output pixel grid. The cursor-reveal effect stacks them and
depends on that: if they were resampled onto different grids, a pixel of the
reveal layer could escape the base layer's silhouette.

Run from the repo root:

  <venv>\\Scripts\\python.exe tools/generate-hero-assets.py
"""
import os

from PIL import Image

SRC = {
    "base": r"D:\Pictures\photo 1.png",
    "reveal": r"D:\Pictures\photo 2.png",
}

DEST = os.path.join(os.path.dirname(__file__), "..", "public", "assets")

# The plain name is the widest variant: srcset, the preloads in index.html and
# the Supabase settings rows in the CMS all keep pointing at it, so nothing that
# already references these files has to change.
#
# The widths are sized to the device pixels each viewport actually needs
# (CSS box = 0.75 x the vh-based height, times devicePixelRatio):
#
#   375x667  @2   -> 460px   480 tier
#   412x823  @2   -> 568px   600 tier  (was 720, a 27% overshoot)
#   412x823  @1.75 -> 497px  512 tier
#   390x844  @3   -> 874px   896 tier  (was 1086, 24% oversize)
#   390x844  @2   -> 582px   600 tier
#   768x1024 @2   -> 830px   896 tier  (was 1086, 31% oversize)
#   1440x900 @1   -> 540px   600 tier
#   1440x900 @2   -> 1080px 1086 tier
#   1920x1080 @1  -> 648px   720 tier
#
# 600 closes the largest remaining hole, which is the DPR-2 phone band. At
# 412x823 @2 the figure renders at 284 CSS px (46vh of 823, times the 3:4
# aspect), so the browser needs 568 device px and the ladder had nothing between
# 512 and 720 -- it took 720, 27% more pixels than it draws, on the image that is
# the LCP element. Measured with tools/probe-hero-720.py, 600 overshoots by 5.6%
# and still clears the 0.98 SSIM / 40 dB bar *as displayed at 568 device px*
# (base 0.9804, reveal 0.9830), for 140,278 B across the pair against 189,504 B
# for 720 -- 26% less on the hero pair, which is the whole critical path at that
# device class. 640 was measured too and skipped: it is no smaller than 600 where
# it would actually be selected.
#
# 512 exists because 497 fell in the gap between 480 and 720: the browser had
# to take 720 for a 497px box, 53% more pixels than it draws, on the image that
# is almost always the LCP element. 512 overshoots 497 by 5.8%. It is additive
# -- 480/720/1086 are untouched, so the pairs the cursor-reveal alignment was
# measured against stay byte-identical.
#
# 896 closes the DPR-3 phone gap (874 needs 896 = 2.6% and 830 = 8% overshoot),
# and it also serves the high-DPR phone that used to pull the 1086 master down.
# Measured in Aug: the previous top end (a 390x844 @3 phone) downloaded 223 KB of
# hero-reveal for a 291x388 CSS box; with 896 it downloads 178 KB. 1086 stays as
# the cap for 1440 @2x and upscaling, where the source cannot do better.
#
# Quality stays q88 at every width, and the 720 tier could not be lowered even
# though it looked like it had headroom. Scored as displayed rather than against
# its own same-width reference, 720 at q82 drops the base to SSIM 0.9784 and
# 600 at q85 drops both images under the bar. The bytes that were worth chasing
# here were in the sizing, not the compression.
#
# A 1086px cap keeps the 1920 @2x case upscaling by exactly as much as it always
# has -- the source is not large enough to do better, and inventing a bigger
# master would mean resampling from a file that is already fixed.
WIDTHS = [(480, "hero-{}-480.webp"), (512, "hero-{}-512.webp"),
          (600, "hero-{}-600.webp"), (720, "hero-{}-720.webp"),
          (896, "hero-{}-896.webp"), (1086, "hero-{}.webp")]

QUALITY = 88


def main():
    for name, path in SRC.items():
        original = Image.open(path)
        if original.mode != "RGBA":
            raise SystemExit(f"{path} is {original.mode}, expected RGBA")
        if original.size != (1086, 1448):
            raise SystemExit(f"{path} is {original.size}, expected (1086, 1448)")

        for width, pattern in WIDTHS:
            height = round(width * 4 / 3)
            if (width, height) == original.size:
                resized = original
            else:
                resized = original.resize((width, height), Image.LANCZOS)
            target = os.path.join(DEST, pattern.format(name))
            resized.save(
                target,
                "WEBP",
                quality=QUALITY,
                method=6,
                # alpha_quality 100 + exact keeps the cut-out edge identical to
                # the source, which is what the reveal mask traces.
                alpha_quality=100,
                exact=True,
            )
            print(
                f"{os.path.basename(target):<26} {width}x{height:<5} "
                f"{os.path.getsize(target):>8,} B"
            )


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generates the original SAM JUNIOR app icons.

An abstract orb: deep navy rounded square, blue-white radial core.
Original artwork drawn procedurally — no third-party or copyrighted assets.

Usage: python3 scripts/generate_icons.py
Requires: Pillow (pip install pillow)
"""

from pathlib import Path

from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parent.parent / "apps" / "desktop" / "src-tauri" / "icons"

BG = (7, 10, 18, 255)          # near-black navy
BG_EDGE = (14, 22, 40, 255)    # subtle raised edge
CORE_BRIGHT = (214, 232, 255)  # blue-white core highlight
CORE_MID = (95, 156, 255)      # primary blue
CORE_DEEP = (16, 44, 88)       # deep halo edge


def lerp(a: tuple, b: tuple, t: float) -> tuple:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def draw_icon(size: int) -> Image.Image:
    # Render at 4x and downscale for smooth edges.
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    radius = round(s * 0.22)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=BG, outline=BG_EDGE, width=max(1, s // 96))

    # Orb: concentric circles approximating a radial gradient,
    # center offset up-left for a lit-sphere feel.
    cx, cy = s * 0.5, s * 0.5
    orb_r = s * 0.30
    hx, hy = s * 0.44, s * 0.42  # highlight center
    steps = 100
    for i in range(steps, 0, -1):
        t = i / steps
        r = orb_r * t
        if t > 0.55:
            color = lerp(CORE_MID, CORE_DEEP, (t - 0.55) / 0.45)
        else:
            color = lerp(CORE_BRIGHT, CORE_MID, t / 0.55)
        # Ring centers drift from highlight point to orb center as t grows.
        x = hx + (cx - hx) * t
        y = hy + (cy - hy) * t
        d.ellipse([x - r, y - r, x + r, y + r], fill=(*color, 255))

    # Faint outer halo ring.
    halo_r = orb_r * 1.35
    d.ellipse(
        [cx - halo_r, cy - halo_r, cx + halo_r, cy + halo_r],
        outline=(*CORE_MID, 60),
        width=max(2, s // 128),
    )

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sizes = {
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "icon.png": 512,
    }
    for name, size in sizes.items():
        draw_icon(size).save(OUT_DIR / name)
        print(f"wrote {OUT_DIR / name}")

    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    base = draw_icon(256)
    base.save(OUT_DIR / "icon.ico", sizes=[(x, x) for x in ico_sizes])
    print(f"wrote {OUT_DIR / 'icon.ico'}")


if __name__ == "__main__":
    main()

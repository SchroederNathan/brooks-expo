"""
Generates the app's launcher icons.

The icons this replaces were built around a real retailer's logo SVG, tinted
their brand blue. The mark drawn here is the same geometric glyph the app uses
in its header (see src/screens/home/wordmark.tsx): a rounded tile with a
forward chevron. Rendering it here rather than checking in binaries by hand
keeps the icon reproducible and in step with the in-app mark.

Usage: python3 tools/debrand/icons.py
Writes into assets/. Run from the repo root.
"""

from PIL import Image, ImageDraw

# Matches colors.blue / colors.navy / colors.surface in src/theme/colors.ts.
TEAL = (14, 92, 99, 255)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)

# Supersample, then downscale. PIL has no anti-aliased drawing, so drawing
# large and shrinking is what keeps the chevron's diagonals from stairstepping.
SS = 4


def chevron(draw, box, color, weight):
    """A forward chevron centred in `box`, drawn as two round-capped strokes."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    apex = (x0 + w * 0.70, y0 + h * 0.50)
    top = (x0 + w * 0.34, y0 + h * 0.20)
    bottom = (x0 + w * 0.34, y0 + h * 0.80)
    for a, b in ((top, apex), (apex, bottom)):
        draw.line([a, b], fill=color, width=weight, joint="curve")
    # Round the three ends and the elbow, which `line` leaves square.
    r = weight // 2
    for cx, cy in (top, apex, bottom):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)


def render(size, ground, tile, mark, tile_inset=0.14, radius_frac=0.24):
    """One icon: optional ground, a rounded tile, and the chevron on top."""
    s = size * SS
    im = Image.new("RGBA", (s, s), ground)
    d = ImageDraw.Draw(im)

    inset = s * tile_inset
    box = [inset, inset, s - inset, s - inset]
    if tile is not None:
        d.rounded_rectangle(box, radius=(box[2] - box[0]) * radius_frac, fill=tile)

    inner = (box[2] - box[0]) * 0.22
    chevron(
        d,
        [box[0] + inner, box[1] + inner, box[2] - inner, box[3] - inner],
        mark,
        max(2, int(s * 0.065)),
    )
    return im.resize((size, size), Image.LANCZOS)


def main():
    # iOS / web: teal tile on white, so the icon reads on either home screen.
    render(1024, WHITE, TEAL, WHITE).save("assets/icon.png")
    render(1024, CLEAR, TEAL, WHITE).save("assets/splash-icon.png")
    render(48, WHITE, TEAL, WHITE).save("assets/favicon.png")

    # Android adaptive: foreground and background are composited by the system,
    # so the foreground carries only the mark and sits inside the safe zone.
    render(512, CLEAR, None, WHITE, tile_inset=0.26).save(
        "assets/android-icon-foreground.png"
    )
    Image.new("RGBA", (512, 512), TEAL).save("assets/android-icon-background.png")
    render(432, CLEAR, None, WHITE, tile_inset=0.26).save(
        "assets/android-icon-monochrome.png"
    )
    print("wrote 6 icons")


if __name__ == "__main__":
    main()

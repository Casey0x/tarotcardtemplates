#!/usr/bin/env python3
"""
Replace black / near-black pixels in PNG(s) with the site cream color (#f4f1ea)
so the image matches the website background.
"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise SystemExit(1)

CREAM = (0xF4, 0xF1, 0xEA)  # #f4f1ea
# Pixels with R,G,B all <= this are replaced with cream (catches black center)
BLACK_THRESHOLD = 40


def process(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    count = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD:
                pixels[x, y] = (*CREAM, a)
                count += 1
    img.save(path, "PNG")
    print(f"  Updated {count} pixels in {path.name}")


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    templates_dir = root / "public" / "images" / "templates"
    if not templates_dir.is_dir():
        print(f"Directory not found: {templates_dir}")
        return
    for path in sorted(templates_dir.glob("*.png")):
        print(f"Processing {path.name}...")
        process(path)
    print("Done.")


if __name__ == "__main__":
    main()

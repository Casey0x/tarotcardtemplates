#!/usr/bin/env python3
"""
Replace baked checkerboard / neutral-gray center in a border PNG with site cream (#f4f1ea).
Flood-fills from image center through neutral (low chroma) pixels above a brightness floor
so bronze plaques and dragon scales are not touched.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise SystemExit(1)

# Must match tailwind.config.ts colors.cream
CREAM = (0xF4, 0xF1, 0xEA, 255)


def is_interior(r: int, g: int, b: int) -> bool:
    """Neutral gray / white checkerboard cells only (not bronze, not dark scales)."""
    lo, hi = min(r, g, b), max(r, g, b)
    if hi - lo > 35:
        return False
    if r + g + b < 180:
        return False
    if r + g + b > 700:
        return True
    return 180 <= r + g + b <= 700


def fill_center_with_cream(path: Path) -> int:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    cx, cy = w // 2, h // 2
    if not is_interior(*img.getpixel((cx, cy))[:3]):
        print(f"  Skip {path.name}: center pixel does not look like checkerboard")
        return 0

    pixels = img.load()
    vis: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque([(cx, cy)])
    changed = 0

    while q:
        x, y = q.popleft()
        if (x, y) in vis:
            continue
        r, g, b, a = pixels[x, y]
        if not is_interior(r, g, b):
            continue
        vis.add((x, y))
        pixels[x, y] = CREAM
        changed += 1
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in vis:
                q.append((nx, ny))

    img.save(path, "PNG")
    return changed


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    # Default: dragon scale border (baked checkerboard center)
    default = root / "public" / "images" / "templates" / "dragon-scale-tarot-border.png"
    import sys

    paths = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else [default]
    for path in paths:
        if not path.is_file():
            print(f"Not found: {path}")
            continue
        n = fill_center_with_cream(path)
        print(f"  {path.name}: replaced {n} pixels with cream")


if __name__ == "__main__":
    main()

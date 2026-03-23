#!/usr/bin/env python3
"""
Gothic Romance border: the inner artwork window is pure black (r+g+b < 80) while
border ink uses dark gray — so the center is a separate 4-connected component from
the frame. Flood-fill from the image center through black pixels only, then replace
with site cream (#f4f1ea). Safe for this asset; re-verify if the source PNG changes.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise SystemExit(1)

CREAM = (0xF4, 0xF1, 0xEA, 255)
BLACK_THRESHOLD = 80  # sum(r,g,b) < this = "center void" black


def fill_center(path: Path) -> int:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    cx, cy = w // 2, h // 2
    pixels = im.load()

    def is_black(r: int, g: int, b: int) -> bool:
        return r + g + b < BLACK_THRESHOLD

    vis: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque([(cx, cy)])
    n = 0
    while q:
        x, y = q.popleft()
        if (x, y) in vis:
            continue
        r, g, b, a = pixels[x, y]
        if not is_black(r, g, b):
            continue
        vis.add((x, y))
        pixels[x, y] = CREAM
        n += 1
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                q.append((nx, ny))

    im.save(path, "PNG")
    return n


def main() -> None:
    import sys

    root = Path(__file__).resolve().parent.parent
    default = root / "public" / "images" / "templates" / "gothic-romance-tarot-border.png"
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else default
    if not path.is_file():
        print(f"Not found: {path}")
        raise SystemExit(1)
    n = fill_center(path)
    print(f"Replaced {n} pixels with cream in {path.name}")


if __name__ == "__main__":
    main()

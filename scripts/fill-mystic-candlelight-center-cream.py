#!/usr/bin/env python3
"""
Mystic Candlelight border: the artwork window is very bright neutral gray/white
(checkerboard or flat) while honey-amber wax has saturated color (high chroma).
Flood-fill from center through pixels that are neutral (low chroma) AND sum(R+G+B) > 715,
then replace with site cream (#f4f1ea). Re-verify if the source PNG changes.
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
CHROMA_MAX = 35
SUM_MIN = 716  # keeps light wax highlights (e.g. sum ~697) out of the fill


def is_bright_neutral(r: int, g: int, b: int) -> bool:
    lo, hi = min(r, g, b), max(r, g, b)
    if hi - lo > CHROMA_MAX:
        return False
    return r + g + b >= SUM_MIN


def fill_center(path: Path) -> int:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    cx, cy = w // 2, h // 2
    if not is_bright_neutral(*im.getpixel((cx, cy))[:3]):
        print(f"  Skip {path.name}: center does not look like bright neutral window")
        return 0

    pixels = im.load()
    vis: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque([(cx, cy)])
    n = 0
    while q:
        x, y = q.popleft()
        if (x, y) in vis:
            continue
        r, g, b, a = pixels[x, y]
        if not is_bright_neutral(r, g, b):
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
    default = root / "public" / "images" / "templates" / "mystic-candlelight-tarot-border.png"
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else default
    if not path.is_file():
        print(f"Not found: {path}")
        raise SystemExit(1)
    n = fill_center(path)
    print(f"Replaced {n} pixels with cream in {path.name}")


if __name__ == "__main__":
    main()

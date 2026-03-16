#!/usr/bin/env python3
"""
Remove ONLY the black background outside the marble frame. Uses flood-fill from
the image edges so dark areas inside the artwork (stormy sky, robes, shadows)
are never touched. Export PNG with real alpha transparency.
"""
from pathlib import Path
from collections import deque

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise SystemExit(1)

# Only pixels with R,G,B all <= this are considered "outer background" to remove.
# Keep strict (15-20) so dark greys/blues inside the artwork are never touched.
BLACK_THRESHOLD = 18
DPI = 300


def is_black(pixels: object, x: int, y: int, w: int, h: int) -> bool:
    if not (0 <= x < w and 0 <= y < h):
        return False
    r, g, b, a = pixels[x, y]
    return r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD


def make_only_outer_black_transparent(path_in: Path, path_out: Path) -> None:
    img = Image.open(path_in).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # Flood-fill from all edge pixels: only make transparent pixels that are
    # (1) very black and (2) connected to the image edge via other very black pixels.
    to_make_transparent = set()
    queue = deque()

    def enqueue(x: int, y: int) -> None:
        if (x, y) in to_make_transparent or not is_black(pixels, x, y, w, h):
            return
        to_make_transparent.add((x, y))
        queue.append((x, y))

    # Seed: all black pixels on the four edges
    for x in range(w):
        enqueue(x, 0)
        enqueue(x, h - 1)
    for y in range(h):
        enqueue(0, y)
        enqueue(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if (nx, ny) not in to_make_transparent and is_black(pixels, nx, ny, w, h):
                to_make_transparent.add((nx, ny))
                queue.append((nx, ny))

    # Apply transparency only to those pixels; leave everything else untouched
    for (x, y) in to_make_transparent:
        r, g, b, a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)

    img.save(path_out, "PNG", dpi=(DPI, DPI))
    print(f"  {path_in.name} -> {path_out.name} (made {len(to_make_transparent)} edge-connected black pixels transparent)")


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    assets = root / "assets"
    if not assets.is_dir():
        assets = Path(r"C:\Users\Owner\.cursor\projects\c-Users-Owner-cursor-tarotcardtemplates\assets")
    if not assets.is_dir():
        print("Assets directory not found. Run from repo root or set assets path.")
        raise SystemExit(1)

    out_dir = root / "public" / "images" / "examples"
    out_dir.mkdir(parents=True, exist_ok=True)

    outputs = [
        ("marble-temple-example-1.png", "marble-temple-the-fool"),
        ("marble-temple-example-2.png", "marble-temple-high-priestess"),
        ("marble-temple-example-3.png", "marble-temple-three-of-swords"),
    ]

    for out_name, sub in outputs:
        candidates = list(assets.glob(f"*{sub}*.png"))
        if not candidates:
            print(f"  No file containing '{sub}' in {assets}")
            continue
        # Prefer the most recently modified (user may have re-uploaded)
        path_in = max(candidates, key=lambda p: p.stat().st_mtime)
        path_out = out_dir / out_name
        make_only_outer_black_transparent(path_in, path_out)

    print("Done.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Make black/near-black background transparent in Marble Temple tarot card PNGs.
Output: true PNG alpha transparency (no checkerboard/grey). 300 DPI when saving.
"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise SystemExit(1)

# Pixels with R,G,B all <= this are made fully transparent (alpha=0)
BLACK_THRESHOLD = 45
DPI = 300


def make_black_transparent(path_in: Path, path_out: Path) -> None:
    img = Image.open(path_in).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    count = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
                count += 1
    # Save as PNG with transparency; set DPI metadata (does not resample pixels)
    img.save(path_out, "PNG", dpi=(DPI, DPI))
    print(f"  {path_in.name} -> {path_out.name} (made {count} pixels transparent)")


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

    # Map output filename -> substring to find in assets
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
        path_in = candidates[0]
        path_out = out_dir / out_name
        make_black_transparent(path_in, path_out)

    print("Done.")


if __name__ == "__main__":
    main()

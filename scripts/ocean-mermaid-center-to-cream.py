from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "public" / "images" / "templates" / "ocean-mermaid-tarot-border.png"
OUTPUT = ROOT / "public" / "images" / "templates" / "ocean-mermaid-tarot-border-cream.png"

# Tailwind `cream` color from tailwind.config.ts
CREAM_RGBA = (0xF4, 0xF1, 0xEA, 255)


def is_dark(pixel: tuple[int, int, int, int]) -> bool:
  r, g, b, a = pixel
  return a > 0 and r < 25 and g < 25 and b < 25


def fill_center_black_with_cream(path_in: Path = INPUT, path_out: Path = OUTPUT) -> None:
  img = Image.open(path_in).convert("RGBA")
  w, h = img.size
  pixels = img.load()

  cx, cy = w // 2, h // 2

  if not is_dark(pixels[cx, cy]):
    found = None
    for dy in range(-30, 31):
      for dx in range(-30, 31):
        x, y = cx + dx, cy + dy
        if 0 <= x < w and 0 <= y < h and is_dark(pixels[x, y]):
          found = (x, y)
          break
      if found:
        break

    if not found:
      raise RuntimeError("Could not find dark center region to fill")
    cx, cy = found

  visited: set[tuple[int, int]] = set()
  q: deque[tuple[int, int]] = deque()
  q.append((cx, cy))
  visited.add((cx, cy))

  while q:
    x, y = q.popleft()
    pixels[x, y] = CREAM_RGBA

    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
      nx, ny = x + dx, y + dy
      if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
        if is_dark(pixels[nx, ny]):
          visited.add((nx, ny))
          q.append((nx, ny))

  img.save(path_out, "PNG", dpi=(300, 300))


if __name__ == "__main__":
  fill_center_black_with_cream()


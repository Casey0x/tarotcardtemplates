/** Public low-res preview (listing, logged-out Studio). */
export function publicBorderThumbPath(slug: string): string {
  return `/images/border-thumbs/${slug}.png`;
}

/** Transparent-center thumb when available (same folder naming as full-res private assets). */
export function publicBorderThumbTransparentPath(slug: string): string {
  return `/images/border-thumbs/${slug}-transparent.png`;
}

/** Protected full-res overlay for signed-in Studio users (same-origin cookies). */
export function protectedBorderImageUrl(slug: string): string {
  return `/api/borders/image/${slug}`;
}

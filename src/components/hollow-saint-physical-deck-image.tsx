"use client";

import { useState } from "react";

type HollowSaintPhysicalDeckImageProps = {
  primarySrc: string;
  fallbackSrc: string | undefined;
  alt: string;
  className: string;
};

/** Printed-deck image for Hollow Saint only: tries Supabase path, then preview fallback. */
export default function HollowSaintPhysicalDeckImage({
  primarySrc,
  fallbackSrc,
  alt,
  className,
}: HollowSaintPhysicalDeckImageProps) {
  const [src, setSrc] = useState(primarySrc);
  const [usedFallback, setUsedFallback] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (usedFallback || !fallbackSrc) return;
        setUsedFallback(true);
        setSrc(fallbackSrc);
      }}
    />
  );
}

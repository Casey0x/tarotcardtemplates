'use client';
import { useState } from 'react';
import { TEMPLATE_PREVIEW_FALLBACK } from '@/lib/templates';

export default function TemplateGallery({
  images,
  templateName,
}: {
  images: string[];
  templateName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const safe = (images ?? []).filter((s) => typeof s === 'string' && s.trim().length > 0);
  const display = safe.length > 0 ? safe : [TEMPLATE_PREVIEW_FALLBACK];
  const idx = Math.min(selectedImage, Math.max(0, display.length - 1));

  return (
    <div className="w-full max-w-md">
      {/* Main large image */}
      <div className="mb-6">
        <img
          src={display[idx]}
          alt={templateName}
          className="w-full h-auto"
        />
      </div>
      {/* Thumbnail grid - only show if more than 1 image */}
      {display.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {display.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`
                overflow-hidden border-2 transition-all
                ${
                  idx === index
                    ? 'border-charcoal'
                    : 'border-charcoal/20 hover:border-charcoal/50'
                }
              `}
            >
              <img
                src={img}
                alt={`${templateName} preview ${index + 1}`}
                className="w-full h-auto aspect-[2/3] object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

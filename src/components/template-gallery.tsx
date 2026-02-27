'use client';
import { useState } from 'react';
export default function TemplateGallery({
  images,
  templateName,
}: {
  images: string[];
  templateName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div className="w-full max-w-md">
      {/* Main large image */}
      <div className="mb-6">
        <img
          src={images[selectedImage]}
          alt={templateName}
          className="w-full h-auto"
        />
      </div>
      {/* Thumbnail grid - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`
                overflow-hidden border-2 transition-all
                ${
                  selectedImage === index
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

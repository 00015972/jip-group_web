"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { isRenderableImageUrl } from "@/lib/storefront/images";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { ZoomIn } from "lucide-react";
import { useState } from "react";

import styles from "./Gallery.module.css";

/** The main photo with a thumbnail strip under it when there is more than one. */
export function Gallery({
  images,
  active,
  onSelect,
  alt,
}: {
  images: string[];
  active: string;
  onSelect: (image: string) => void;
  alt: string;
}) {
  const [zoom, setZoom] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const canZoom = isRenderableImageUrl(active) && failed !== active;
  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <SafeImage src={active} alt={alt} sizes="(min-width: 580px) 540px, 100vw" eager onFail={() => setFailed(active)} />
        {canZoom && <button type="button" className={styles.zoom} aria-label="Rasmni kattalashtirish" onClick={() => setZoom(active)}><ZoomIn size={20} aria-hidden /><span>Kattalashtirish</span></button>}
      </div>
      {images.length > 1 && (
        <ul className={styles.thumbs}>
          {images.map((image, i) => (
            <li key={image}>
              <button
                type="button"
                className={styles.thumb}
                aria-label={`Rasm ${i + 1}`}
                aria-current={image === active ? "true" : undefined}
                onClick={() => onSelect(image)}
              >
                <SafeImage src={image} alt="" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {zoom && <ImageLightbox src={zoom} alt={alt} onClose={() => setZoom(null)} />}
    </div>
  );
}

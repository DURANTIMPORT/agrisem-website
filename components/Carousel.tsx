"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type CarouselProps = {
  images: string[];
  alt: string;
  /** Auto-advance interval in ms. */
  interval?: number;
};

/** Auto-advancing fading photo carousel (no controls — rotates on its own). */
export default function Carousel({
  images,
  alt,
  interval = 1600,
}: CarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((p) => (p + 1) % images.length),
      interval
    );
    return () => window.clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className="relative h-full w-full">
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <div className="relative h-full w-full p-8 sm:p-12 lg:p-16">
            <Image
              src={src}
              alt={`${alt} — ${i + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

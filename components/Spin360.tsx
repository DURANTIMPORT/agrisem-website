"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Spin360Props = {
  /** Base path of the frames, e.g. "/brands/rol-ex-360/" */
  base: string;
  /** Number of frames (named 1..count). */
  count: number;
  /** File extension, default ".jpg". */
  ext?: string;
  alt: string;
  className?: string;
};

/**
 * Studio-style 360° product viewer: auto-rotates continuously and lets the
 * user drag (mouse or touch) to spin the machine by hand.
 */
export default function Spin360({
  base,
  count,
  ext = ".jpg",
  alt,
  className = "",
}: Spin360Props) {
  const frames = useMemo(
    () => Array.from({ length: count }, (_, i) => `${base}${i + 1}${ext}`),
    [base, count, ext]
  );

  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const frameRef = useRef(0);

  // Preload every frame so the rotation is smooth.
  useEffect(() => {
    let loaded = 0;
    frames.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loaded += 1;
        if (loaded === frames.length) setReady(true);
      };
      img.src = src;
    });
  }, [frames]);

  // Continuous auto-rotation, paused while the user drags.
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      if (draggingRef.current) return;
      frameRef.current = (frameRef.current + 1) % count;
      setFrame(frameRef.current);
    }, 90);
    return () => window.clearInterval(id);
  }, [ready, count]);

  const scrub = (clientX: number) => {
    const delta = clientX - lastXRef.current;
    if (Math.abs(delta) < 6) return;
    const dir = delta > 0 ? 1 : -1;
    frameRef.current = (frameRef.current + dir + count) % count;
    setFrame(frameRef.current);
    lastXRef.current = clientX;
  };

  const startDrag = (clientX: number) => {
    draggingRef.current = true;
    lastXRef.current = clientX;
  };
  const endDrag = () => {
    draggingRef.current = false;
  };

  return (
    <div
      className={`flex h-full w-full items-center justify-center p-8 lg:p-16 ${className}`}
      onMouseDown={(e) => startDrag(e.clientX)}
      onMouseMove={(e) => draggingRef.current && scrub(e.clientX)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
      onTouchMove={(e) => draggingRef.current && scrub(e.touches[0].clientX)}
      onTouchEnd={endDrag}
      style={{ cursor: "grab", touchAction: "pan-y" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frames[frame]}
        alt={alt}
        draggable={false}
        className="max-h-full max-w-full select-none object-contain"
      />
    </div>
  );
}

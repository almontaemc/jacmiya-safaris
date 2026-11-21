"use client";

import { useEffect, useRef } from "react";

const HD = "/hero-1080.mp4";
const UHD = "/hero-4k.mp4";

type Conn = { saveData?: boolean; downlink?: number; effectiveType?: string };

/** 4K only for full-HD-or-better screens on a connection that can keep up; 1080p otherwise. */
function pickSource(): string {
  const conn = (navigator as Navigator & { connection?: Conn }).connection;
  const pixels = window.innerWidth * (window.devicePixelRatio || 1);
  const fast = !conn || (!conn.saveData && (conn.downlink ?? 10) >= 10 && conn.effectiveType === "4g");
  return pixels >= 1600 && fast ? UHD : HD;
}

/**
 * Muted looping hero footage. The server renders only the poster; the file is chosen in the
 * browser, and 4K drops to 1080p if it hasn't started playing within 3 seconds.
 */
export default function HeroVideo({ poster }: { poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = (src: string) => {
      v.src = src;
      // React doesn't reliably reflect `muted` to the DOM; browsers only autoplay muted video.
      v.muted = true;
      v.play().catch(() => {});
    };

    const first = pickSource();
    start(first);
    if (first !== UHD) return;
    const timer = window.setTimeout(() => {
      if (v.paused || v.currentTime < 0.5) start(HD);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <video
      ref={ref}
      poster={poster}
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}

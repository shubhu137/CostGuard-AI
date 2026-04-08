"use client";

import { useEffect, useRef } from "react";

/**
 * Runs a callback on an interval.
 * No Math.* used. Clean ref-based implementation.
 */
export function useInterval(callback: () => void, delayMs: number) {
  const callbackRef = useRef(callback);

  // Keep latest callback in ref without re-subscribing
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs <= 0) return;
    const id = setInterval(() => callbackRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

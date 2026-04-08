"use client";

import { useState, useCallback } from "react";
import { useInterval } from "./useInterval";

/** Metadata returned from every API response */
export interface ScanMetaResponse {
  scanId: string;
  slot: number;
  nextScanIn: number;
  generatedAt: string;
}

export interface RealtimeState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  meta: ScanMetaResponse | null;
  /** How many auto-refreshes have happened */
  refreshCount: number;
  /** Trigger a manual refresh */
  refresh: () => void;
  /** True for ~800ms after each refresh (for flash animation) */
  isUpdating: boolean;
}

/**
 * Fetches `url` immediately and then re-fetches every `intervalMs`.
 * On each new fetch where `scanId` differs from the previous, `isUpdating`
 * is set to true briefly so UI can flash-highlight changed cards.
 *
 * No Math.* used anywhere.
 */
export function useRealtimeData<T>(
  url: string,
  intervalMs = 15000
): RealtimeState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ScanMetaResponse | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastScanId, setLastScanId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
      const res = await fetch(fullUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const newMeta: ScanMetaResponse = {
        scanId: json.scanId || json.data?.scanId || "",
        slot: json.slot ?? json.data?.slot ?? 0,
        nextScanIn: json.nextScanIn ?? json.data?.nextScanIn ?? intervalMs / 1000,
        generatedAt: json.generatedAt || new Date().toISOString(),
      };

      setData(json.data);
      setMeta(newMeta);
      setError(null);
      setRefreshCount((c) => c + 1);

      // Flash update if scanId changed (new time slot)
      if (lastScanId !== null && lastScanId !== newMeta.scanId) {
        setIsUpdating(true);
        const timer = setTimeout(() => setIsUpdating(false), 800);
        return () => clearTimeout(timer);
      }
      setLastScanId(newMeta.scanId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { fetchData(); });

  // Auto-refresh
  useInterval(fetchData, intervalMs);

  return { data, loading, error, meta, refreshCount, refresh: fetchData, isUpdating };
}

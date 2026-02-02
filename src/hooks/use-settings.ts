"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllSettings } from "@/actions/settings";

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getAllSettings();
      setSettings(data);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getSetting = useCallback(
    (key: string) => {
      return settings[key] ?? null;
    },
    [settings]
  );

  return { settings, isLoading, refresh, getSetting };
}

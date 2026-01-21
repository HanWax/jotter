import { useState, useEffect } from "react";

type ViewMode = "grid" | "list";

const STORAGE_KEY = "jotter-view-preference";

export function useViewPreference(defaultView: ViewMode = "grid") {
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return defaultView;
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === "grid" || stored === "list") ? stored : defaultView;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view);
  }, [view]);

  return [view, setView] as const;
}

"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useState } from "react";
import {
  applyPreferences, clearReaderPreferenceBootstrap, DEFAULT_PREFERENCES,
  globalMode, parsePreferences, PREFERENCES_KEY, themeFromGlobalMode,
  type ReaderPreferences,
} from "@/lib/reader-state";

type ThemeContextValue = {
  preferences: ReaderPreferences;
  ready: boolean;
  canPersist: boolean;
  updatePreferences: (preferences: ReaderPreferences) => void;
  toggleAppearance: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [canPersist, setCanPersist] = useState(true);

  useLayoutEffect(() => {
    let saved = DEFAULT_PREFERENCES;
    try { saved = parsePreferences(localStorage.getItem(PREFERENCES_KEY)); }
    catch { setCanPersist(false); }
    applyPreferences(saved);
    setPreferences(saved);
    clearReaderPreferenceBootstrap();
    setReady(true);

    const sync = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || (event.key !== PREFERENCES_KEY && event.key !== null)) return;
      const next = parsePreferences(event.newValue);
      applyPreferences(next);
      setPreferences(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const updatePreferences = useCallback((next: ReaderPreferences) => {
    applyPreferences(next);
    setPreferences(next);
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); }
    catch { setCanPersist(false); }
  }, []);

  const toggleAppearance = () => updatePreferences({
    ...preferences,
    theme: themeFromGlobalMode(globalMode(preferences.theme) === "dark" ? "light" : "dark"),
  });

  return <ThemeContext.Provider value={{ preferences, ready, canPersist, updatePreferences, toggleAppearance }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
}

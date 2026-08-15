// ViperRange — useLocalStorage Hook
// ZeroDay Security Services

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev)
            : newValue;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          console.warn(`[useLocalStorage] Failed to write key "${key}"`);
        }
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    setValue(defaultValue);
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`[useLocalStorage] Failed to remove key "${key}"`);
    }
  }, [key, defaultValue]);

  return [value, set, remove];
}

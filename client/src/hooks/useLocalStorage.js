import { useState, useEffect } from "react";

/**
 * Generic hook that mirrors state to localStorage.
 *
 * @template T
 * @param {string} key - localStorage key
 * @param {T} initialValue - fallback when nothing is stored
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

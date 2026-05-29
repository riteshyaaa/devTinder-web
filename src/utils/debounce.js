import { useRef, useCallback, useEffect } from "react";

/**
 * Generic debounce utility function.
 *
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms (default: 300)
 * @returns {Function} Debounced function with .cancel() method
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  return debounced;
};

/**
 * React hook for debounced callbacks.
 * Automatically cleans up on unmount.
 *
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in ms (default: 300)
 * @returns {Function} Stable debounced function
 *
 * Usage:
 *   const debouncedSearch = useDebounce((query) => fetchResults(query), 300);
 *   <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export const useDebounce = (callback, delay = 300) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  // Keep callback ref current
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
};

/**
 * Hook that returns a debounced value.
 * Updates the returned value only after the specified delay.
 *
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms
 * @returns {any} Debounced value
 *
 * Usage:
 *   const [query, setQuery] = useState("");
 *   const debouncedQuery = useDebouncedValue(query, 300);
 *   useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
 */
export const useDebouncedValue = (value, delay = 300) => {
  const { useState, useEffect } = require("react");
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

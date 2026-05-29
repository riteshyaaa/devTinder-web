/**
 * Client-side swipe rate limiter.
 *
 * Tracks daily swipe count in localStorage. Resets at midnight.
 * Free tier: 50 swipes/day. Shows remaining count.
 *
 * Usage:
 *   const { canSwipe, remaining, recordSwipe, reset } = useSwipeLimit();
 */

const STORAGE_KEY = "devtinder-swipe-limit";
const DAILY_LIMIT = 50;

/**
 * Get current swipe data from localStorage.
 * Resets automatically if the stored date is not today.
 */
export const getSwipeData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === new Date().toDateString()) {
        return data;
      }
    }
  } catch {
    // Corrupted data — reset
  }
  // Default: fresh day
  return { count: 0, date: new Date().toDateString() };
};

/**
 * Record a swipe action. Returns updated data.
 */
export const recordSwipe = () => {
  const data = getSwipeData();
  data.count += 1;
  data.date = new Date().toDateString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

/**
 * Check if user can still swipe today.
 */
export const canSwipe = () => {
  const data = getSwipeData();
  return data.count < DAILY_LIMIT;
};

/**
 * Get remaining swipes for today.
 */
export const getRemaining = () => {
  const data = getSwipeData();
  return Math.max(0, DAILY_LIMIT - data.count);
};

/**
 * Reset swipe counter (for testing or premium override).
 */
export const resetSwipeLimit = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * React hook for swipe rate limiting.
 */
export const useSwipeLimit = () => {
  const data = getSwipeData();
  return {
    canSwipe: data.count < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - data.count),
    used: data.count,
    limit: DAILY_LIMIT,
    recordSwipe,
    reset: resetSwipeLimit,
  };
};

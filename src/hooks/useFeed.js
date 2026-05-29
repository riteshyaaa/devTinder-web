import { useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import {
  fetchFeed,
  sendConnectionRequest,
  sendSuperLike,
  boostProfile,
  undoLastSwipe,
  getErrorMessage,
} from "../services/api";
import { getSwipeData, recordSwipe as recordSwipeAction, getRemaining } from "../utils/rateLimiter";

const MAX_UNDO_HISTORY = 3;
const DAILY_SUPER_LIKES = 3;
const DAILY_SWIPE_LIMIT = 50;

/**
 * Custom hook for feed logic.
 *
 * Features:
 * - Feed fetching with filters + advanced sorting (completeness, activity, fair exposure)
 * - Swipe: interested / ignored
 * - Super Like: limited daily (3/day), shows high interest to the other user
 * - Boost: 30-min profile visibility boost
 * - Multi-undo: revert last 3 ignored swipes
 */
const useFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ skills: [], experienceLevel: "", location: "", smartMatch: false });
  const [undoHistory, setUndoHistory] = useState([]);
  const [undoLoading, setUndoLoading] = useState(false);
  const [swipesRemaining, setSwipesRemaining] = useState(getRemaining());
  const [superLikesRemaining, setSuperLikesRemaining] = useState(() => {
    const stored = localStorage.getItem("devtinder-superlikes");
    if (stored) {
      const { count, date } = JSON.parse(stored);
      if (date === new Date().toDateString()) return count;
    }
    return DAILY_SUPER_LIKES;
  });
  const [boostActive, setBoostActive] = useState(false);
  const [boostEndTime, setBoostEndTime] = useState(null);
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const undoHistoryRef = useRef([]);

  const clearError = useCallback(() => setError(""), []);

  // Persist super likes count
  const updateSuperLikes = (count) => {
    setSuperLikesRemaining(count);
    localStorage.setItem(
      "devtinder-superlikes",
      JSON.stringify({ count, date: new Date().toDateString() })
    );
  };

  const getFeed = useCallback(
    async (forceRefresh = false, customFilters = null) => {
      if (feed && !forceRefresh && !customFilters) return;
      setError("");
      setLoading(true);
      try {
        const activeFilters = customFilters || filters;
        // Add advanced sort params — backend handles prioritization
        const params = {
          ...activeFilters,
          sortBy: "smart", // tells backend: completeness + recency + fair exposure
        };
        const res = await fetchFeed(params);
        dispatch(addFeed(res.data));
      } catch (err) {
        if (err.response?.status !== 401) {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    },
    [feed, dispatch, filters]
  );

  const handleSwipe = useCallback(
    async (status, userId) => {
      // Rate limit check
      if (swipesRemaining <= 0) {
        setError("Daily swipe limit reached (50/day). Come back tomorrow!");
        return { success: false, error: "Daily swipe limit reached" };
      }

      const swipedUser = feed?.find((u) => u._id === userId);
      try {
        const res = await sendConnectionRequest(status, userId);
        dispatch(removeUserFromFeed(userId));

        // Record swipe and update remaining count
        recordSwipeAction();
        setSwipesRemaining(getRemaining());

        // Store in undo history (only "ignored" can be undone, max 3)
        if (status === "ignored" && swipedUser) {
          const newHistory = [{ user: swipedUser, status }, ...undoHistoryRef.current].slice(0, MAX_UNDO_HISTORY);
          undoHistoryRef.current = newHistory;
          setUndoHistory(newHistory);
        }

        const isMatch = res.data?.isMatch || res.data?.data?.isMatch || false;
        return { success: true, isMatch };
      } catch (err) {
        setError(getErrorMessage(err));
        return { success: false, error: getErrorMessage(err) };
      }
    },
    [dispatch, feed]
  );

  /**
   * Super Like — limited to DAILY_SUPER_LIKES per day.
   * Sends with special "superlike" status so the other user sees it highlighted.
   */
  const handleSuperLike = useCallback(
    async (userId) => {
      if (superLikesRemaining <= 0) {
        return { success: false, error: "No Super Likes remaining today. Resets at midnight!" };
      }
      const swipedUser = feed?.find((u) => u._id === userId);
      try {
        const res = await sendSuperLike(userId);
        dispatch(removeUserFromFeed(userId));
        updateSuperLikes(superLikesRemaining - 1);
        const isMatch = res.data?.isMatch || res.data?.data?.isMatch || false;
        return { success: true, isMatch, isSuperLike: true };
      } catch (err) {
        setError(getErrorMessage(err));
        return { success: false, error: getErrorMessage(err) };
      }
    },
    [dispatch, feed, superLikesRemaining]
  );

  /**
   * Boost — increases profile visibility for 30 minutes.
   */
  const handleBoost = useCallback(async () => {
    try {
      await boostProfile();
      setBoostActive(true);
      const endTime = Date.now() + 30 * 60 * 1000; // 30 minutes
      setBoostEndTime(endTime);
      localStorage.setItem("devtinder-boost-end", endTime.toString());

      // Auto-deactivate after 30 min
      setTimeout(() => {
        setBoostActive(false);
        setBoostEndTime(null);
        localStorage.removeItem("devtinder-boost-end");
      }, 30 * 60 * 1000);

      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  // Check for existing boost on mount
  useState(() => {
    const stored = localStorage.getItem("devtinder-boost-end");
    if (stored) {
      const endTime = parseInt(stored, 10);
      if (endTime > Date.now()) {
        setBoostActive(true);
        setBoostEndTime(endTime);
        const remaining = endTime - Date.now();
        setTimeout(() => {
          setBoostActive(false);
          setBoostEndTime(null);
          localStorage.removeItem("devtinder-boost-end");
        }, remaining);
      } else {
        localStorage.removeItem("devtinder-boost-end");
      }
    }
  });

  /**
   * Undo — reverts the most recent ignored swipe (up to last 3).
   */
  const handleUndo = useCallback(async () => {
    if (undoHistoryRef.current.length === 0) {
      return { success: false, error: "Nothing to undo" };
    }

    setUndoLoading(true);
    const toUndo = undoHistoryRef.current[0];
    try {
      await undoLastSwipe(toUndo.user._id);
    } catch {
      // If backend doesn't support undo, still undo locally
    }

    // Re-add user to feed
    dispatch(addFeed(feed ? [toUndo.user, ...feed] : [toUndo.user]));

    // Remove from undo history
    const newHistory = undoHistoryRef.current.slice(1);
    undoHistoryRef.current = newHistory;
    setUndoHistory(newHistory);
    setUndoLoading(false);
    return { success: true };
  }, [dispatch, feed]);

  const updateFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      getFeed(true, newFilters);
    },
    [getFeed]
  );

  const resetFilters = useCallback(() => {
    const empty = { skills: [], experienceLevel: "", location: "", smartMatch: false };
    setFilters(empty);
    getFeed(true, empty);
  }, [getFeed]);

  const retry = useCallback(() => {
    setError("");
    return getFeed(true);
  }, [getFeed]);

  return {
    feed,
    loading,
    error,
    filters,
    undoHistory,
    undoLoading,
    swipesRemaining,
    superLikesRemaining,
    boostActive,
    boostEndTime,
    clearError,
    getFeed,
    handleSwipe,
    handleSuperLike,
    handleBoost,
    handleUndo,
    updateFilters,
    resetFilters,
    retry,
  };
};

export default useFeed;

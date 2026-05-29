import { useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import { fetchFeed, sendConnectionRequest, undoLastSwipe, getErrorMessage } from "../services/api";

/**
 * Custom hook for feed logic.
 * Provides feed data, loading/error states, filters, undo, and swipe actions.
 */
const useFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ skills: [], experienceLevel: "", location: "" });
  const [lastSwiped, setLastSwiped] = useState(null); // For undo functionality
  const [undoLoading, setUndoLoading] = useState(false);
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const lastSwipedRef = useRef(null);

  const clearError = useCallback(() => setError(""), []);

  const getFeed = useCallback(
    async (forceRefresh = false, customFilters = null) => {
      if (feed && !forceRefresh && !customFilters) return;
      setError("");
      setLoading(true);
      try {
        const activeFilters = customFilters || filters;
        const res = await fetchFeed(activeFilters);
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
      // Store swipe for potential undo
      const swipedUser = feed?.find((u) => u._id === userId);
      try {
        const res = await sendConnectionRequest(status, userId);
        dispatch(removeUserFromFeed(userId));

        // Save for undo (only "ignored" can be undone)
        if (status === "ignored" && swipedUser) {
          setLastSwiped({ user: swipedUser, status });
          lastSwipedRef.current = { user: swipedUser, status };
        } else {
          setLastSwiped(null);
          lastSwipedRef.current = null;
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

  const handleUndo = useCallback(async () => {
    const toUndo = lastSwipedRef.current;
    if (!toUndo) return { success: false, error: "Nothing to undo" };

    setUndoLoading(true);
    try {
      await undoLastSwipe(toUndo.user._id);
      // Re-add the user to feed
      dispatch(addFeed(feed ? [toUndo.user, ...feed] : [toUndo.user]));
      setLastSwiped(null);
      lastSwipedRef.current = null;
      return { success: true };
    } catch (err) {
      // If backend doesn't support undo, still add locally
      dispatch(addFeed(feed ? [toUndo.user, ...feed] : [toUndo.user]));
      setLastSwiped(null);
      lastSwipedRef.current = null;
      return { success: true };
    } finally {
      setUndoLoading(false);
    }
  }, [dispatch, feed]);

  const updateFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      getFeed(true, newFilters);
    },
    [getFeed]
  );

  const resetFilters = useCallback(() => {
    const empty = { skills: [], experienceLevel: "", location: "" };
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
    lastSwiped,
    undoLoading,
    clearError,
    getFeed,
    handleSwipe,
    handleUndo,
    updateFilters,
    resetFilters,
    retry,
  };
};

export default useFeed;

import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import { fetchFeed, sendConnectionRequest, getErrorMessage } from "../services/api";

/**
 * Custom hook for feed logic.
 * Provides feed data, loading/error states, and actions (fetch, swipe).
 */
const useFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const clearError = useCallback(() => setError(""), []);

  const getFeed = useCallback(
    async (forceRefresh = false) => {
      if (feed && !forceRefresh) return;
      setError("");
      setLoading(true);
      try {
        const res = await fetchFeed();
        dispatch(addFeed(res.data));
      } catch (err) {
        // Don't set error for 401 (interceptor handles redirect)
        if (err.response?.status !== 401) {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    },
    [feed, dispatch]
  );

  const handleSwipe = useCallback(
    async (status, userId) => {
      try {
        const res = await sendConnectionRequest(status, userId);
        dispatch(removeUserFromFeed(userId));
        // Check if backend indicates a mutual match
        const isMatch = res.data?.isMatch || res.data?.data?.isMatch || false;
        return { success: true, isMatch };
      } catch (err) {
        setError(getErrorMessage(err));
        return { success: false, error: getErrorMessage(err) };
      }
    },
    [dispatch]
  );

  const retry = useCallback(() => {
    setError("");
    return getFeed(true);
  }, [getFeed]);

  return {
    feed,
    loading,
    error,
    clearError,
    getFeed,
    handleSwipe,
    retry,
  };
};

export default useFeed;

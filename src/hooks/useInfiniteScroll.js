import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useInfiniteScroll — Custom hook for infinite scroll with pagination.
 *
 * Features:
 * - Intersection Observer to detect when user scrolls near bottom
 * - Page tracking and loading states
 * - Deduplication of items by _id
 * - Pull-to-refresh support (reset and reload)
 * - Configurable threshold (how close to bottom before triggering)
 *
 * @param {Function} fetchFn - Async function that accepts (page, limit) and returns { data: [], hasMore: bool }
 * @param {Object} options - { limit: number, threshold: string, enabled: bool }
 * @returns {Object} - { items, loading, loadingMore, hasMore, error, loadMore, refresh, observerRef }
 */
const useInfiniteScroll = (fetchFn, options = {}) => {
  const { limit = 10, threshold = "200px", enabled = true } = options;

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); // Initial load
  const [loadingMore, setLoadingMore] = useState(false); // Subsequent pages
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const observerRef = useRef(null); // Attach this to sentinel element
  const observerInstance = useRef(null);
  const isFetching = useRef(false);

  // Fetch a page of data
  const fetchPage = useCallback(
    async (pageNum, isRefresh = false) => {
      if (isFetching.current) return;
      isFetching.current = true;

      if (pageNum === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError("");

      try {
        const result = await fetchFn(pageNum, limit);
        const newItems = result?.data || result || [];
        const moreAvailable =
          result?.hasMore !== undefined
            ? result.hasMore
            : newItems.length >= limit;

        if (pageNum === 1) {
          setItems(newItems);
        } else {
          // Deduplicate by _id
          setItems((prev) => {
            const existingIds = new Set(prev.map((item) => item._id || item.id));
            const unique = newItems.filter(
              (item) => !existingIds.has(item._id || item.id)
            );
            return [...prev, ...unique];
          });
        }

        setHasMore(moreAvailable);
        setPage(pageNum);
      } catch (err) {
        if (err.response?.status !== 401) {
          setError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              err.message ||
              "Failed to load data"
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        isFetching.current = false;
      }
    },
    [fetchFn, limit]
  );

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchPage(1);
    }
  }, [enabled]);

  // Load next page
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isFetching.current) {
      fetchPage(page + 1);
    }
  }, [page, loadingMore, hasMore, fetchPage]);

  // Refresh (pull-to-refresh or manual)
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  }, [fetchPage]);

  // Intersection Observer for auto-loading
  useEffect(() => {
    if (!enabled) return;

    const node = observerRef.current;
    if (!node) return;

    // Disconnect previous observer
    if (observerInstance.current) {
      observerInstance.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !isFetching.current) {
          loadMore();
        }
      },
      { rootMargin: threshold }
    );

    observer.observe(node);
    observerInstance.current = observer;

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore, threshold, enabled]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    refreshing,
    loadMore,
    refresh,
    observerRef,
    setItems,
  };
};

export default useInfiniteScroll;

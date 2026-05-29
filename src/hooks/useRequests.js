import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../utils/requestSlice";
import {
  fetchReceivedRequests,
  reviewConnectionRequest,
  getErrorMessage,
} from "../services/api";

/**
 * Custom hook for connection requests logic.
 * Provides requests data, loading/error states, fetch, review and retry.
 */
const useRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const clearError = useCallback(() => setError(""), []);

  const getRequests = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetchReceivedRequests();
      dispatch(addRequest(res.data.data));
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const reviewRequest = useCallback(
    async (status, requestId) => {
      try {
        await reviewConnectionRequest(status, requestId);
        dispatch(removeRequest(requestId));
        return { success: true };
      } catch (err) {
        setError(getErrorMessage(err));
        return { success: false, error: getErrorMessage(err) };
      }
    },
    [dispatch]
  );

  const retry = useCallback(() => {
    setError("");
    return getRequests();
  }, [getRequests]);

  return {
    requests,
    loading,
    error,
    clearError,
    getRequests,
    reviewRequest,
    retry,
  };
};

export default useRequests;

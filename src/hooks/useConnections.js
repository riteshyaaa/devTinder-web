import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { fetchConnections as fetchConnectionsAPI, getErrorMessage } from "../services/api";

/**
 * Custom hook for connections logic.
 * Provides connections data, loading/error states, fetch and retry.
 */
const useConnections = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const clearError = useCallback(() => setError(""), []);

  const getConnections = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetchConnectionsAPI();
      dispatch(addConnections(res.data.data));
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const retry = useCallback(() => {
    setError("");
    return getConnections();
  }, [getConnections]);

  return {
    connections,
    loading,
    error,
    clearError,
    getConnections,
    retry,
  };
};

export default useConnections;

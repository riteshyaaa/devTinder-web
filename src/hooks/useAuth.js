import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser, removeUser } from "../utils/userSlice";
import {
  loginUser,
  signUpUser,
  logoutUser,
  fetchProfile,
  getErrorMessage,
} from "../services/api";

/**
 * Custom hook for authentication logic.
 * Provides login, signup, logout, fetchUser, and loading/error states.
 */
const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  const clearError = useCallback(() => setError(""), []);

  const login = useCallback(
    async (email, password) => {
      setError("");
      setLoading(true);
      try {
        const res = await loginUser(email, password);
        dispatch(addUser(res.data));
        navigate("/");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate]
  );

  const signUp = useCallback(
    async ({ firstName, lastName, email, password }) => {
      setError("");
      setLoading(true);
      try {
        const res = await signUpUser({ firstName, lastName, email, password });
        dispatch(addUser(res.data.data));
        navigate("/onboarding");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  const fetchUser = useCallback(async () => {
    if (user) return;
    setLoading(true);
    try {
      const res = await fetchProfile();
      dispatch(addUser(res.data));
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [user, dispatch, navigate]);

  return {
    user,
    loading,
    error,
    clearError,
    login,
    signUp,
    logout,
    fetchUser,
  };
};

export default useAuth;

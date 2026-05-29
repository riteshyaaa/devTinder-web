import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (unauthorized) globally - redirect to login
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================

export const loginUser = (email, password) =>
  api.post("/login", { email, password });

export const signUpUser = ({ firstName, lastName, email, password }) =>
  api.post("/signUp", { firstName, lastName, email, password });

export const logoutUser = () => api.post("/logout", {});

export const fetchProfile = () => api.get("/profile/view");

export const updateProfile = (profileData) =>
  api.patch("/profile/edit", profileData);

// ==================== FEED APIs ====================

/**
 * Fetch feed with optional filters.
 * @param {Object} filters - { skills: [], experienceLevel: "", location: "" }
 */
export const fetchFeed = (filters = {}) => {
  const params = {};
  if (filters.skills?.length > 0) params.skills = filters.skills.join(",");
  if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
  if (filters.location) params.location = filters.location;
  return api.get("/feed", { params });
};

export const sendConnectionRequest = (status, userId) =>
  api.post(`/request/send/${status}/${userId}`, {});

export const undoLastSwipe = (userId) =>
  api.post(`/request/undo/${userId}`, {});

// ==================== CHAT APIs ====================

export const fetchChatHistory = (targetUserId) =>
  api.get(`/chat/${targetUserId}`);

// ==================== ACTIVITY / STORIES APIs ====================

export const fetchActivityFeed = () => api.get("/activity/feed");

export const createStory = (content) =>
  api.post("/activity/story", { content });

// ==================== PROJECTS APIs ====================

export const fetchProjects = () => api.get("/projects");

export const createProject = (projectData) =>
  api.post("/projects", projectData);

export const applyToProject = (projectId) =>
  api.post(`/projects/${projectId}/apply`, {});

// ==================== CONNECTIONS APIs ====================

export const fetchConnections = () => api.get("/user/connections");

// ==================== REQUESTS APIs ====================

export const fetchReceivedRequests = () => api.get("/user/requests/received");

export const reviewConnectionRequest = (status, requestId) =>
  api.post(`/request/review/${status}/${requestId}`, {});

// ==================== HELPER ====================

/**
 * Extract a human-readable error message from an axios error
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message === "Network Error")
    return "Unable to connect to server. Please check your internet connection.";
  if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
  return error.message || "Something went wrong. Please try again.";
};

export default api;

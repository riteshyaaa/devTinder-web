import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

let socket = null;

/**
 * Get or create a singleton socket connection.
 * Reuses the same socket across the app for online status, typing, etc.
 */
export const getSocket = () => {
  if (!socket || !socket.connected) {
    socket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

/**
 * Create a fresh socket connection (used for specific flows like joining a chat room).
 * @deprecated Use getSocket() for singleton pattern
 */
const createSocketConnection = () => {
  return io(BASE_URL, {
    withCredentials: true,
  });
};

/**
 * Disconnect and cleanup the global socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default createSocketConnection;
